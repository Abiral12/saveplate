import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { hashVerificationCode } from "@/lib/security/tokens";
import { verifyEmailApiSchema } from "@/lib/validation/auth-api";

export const runtime = "nodejs";

const MAX_VERIFICATION_ATTEMPTS = 5;

class VerificationCodeUnavailableError extends Error {
  constructor() {
    super("Verification code is no longer available.");
    this.name = "VerificationCodeUnavailableError";
  }
}

/**
 * Compares two hexadecimal hashes without using normal string comparison.
 */
function safelyCompareHexHashes(
  storedHash: string,
  submittedHash: string,
): boolean {
  try {
    const storedBuffer = Buffer.from(storedHash, "hex");
    const submittedBuffer = Buffer.from(submittedHash, "hex");

    if (
      storedBuffer.length === 0 ||
      storedBuffer.length !== submittedBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(storedBuffer, submittedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "The request body must contain valid JSON.",
        errors: {},
      },
      {
        status: 400,
      },
    );
  }

  const validationResult = verifyEmailApiSchema.safeParse(requestBody);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid six-digit verification code.",
        errors: validationResult.error.flatten().fieldErrors,
      },
      {
        status: 422,
      },
    );
  }

  const email = validationResult.data.email.trim().toLowerCase();
  const submittedCode = validationResult.data.code.trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
    },
  });

  /*
   * Do not reveal whether an unknown email exists.
   */
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "The verification code is invalid or no longer available.",
        errors: {
          code: ["Enter the latest verification code sent to your email."],
        },
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Keep the endpoint idempotent.
   * Repeating verification for an already verified account is not an error.
   */
  if (user.emailVerifiedAt && user.status === "ACTIVE") {
    return NextResponse.json(
      {
        success: true,
        message: "Your email address has already been verified.",
        data: {
          userId: user.id,
          email: user.email,
          alreadyVerified: true,
        },
      },
      {
        status: 200,
      },
    );
  }

  if (user.status === "SUSPENDED") {
    return NextResponse.json(
      {
        success: false,
        message:
          "This account has been suspended and cannot be verified.",
        errors: {},
      },
      {
        status: 403,
      },
    );
  }

  const verificationCode = await prisma.emailVerificationCode.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      codeHash: true,
      expiresAt: true,
      attemptCount: true,
    },
  });

  if (!verificationCode) {
    return NextResponse.json(
      {
        success: false,
        message:
          "No active verification code was found. Request a new code.",
        errors: {
          code: ["Request a new verification code."],
        },
        data: {
          resendRequired: true,
        },
      },
      {
        status: 400,
      },
    );
  }

  const now = new Date();

  if (verificationCode.expiresAt <= now) {
    await prisma.emailVerificationCode.updateMany({
      where: {
        id: verificationCode.id,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    return NextResponse.json(
      {
        success: false,
        message:
          "This verification code has expired. Request a new code.",
        errors: {
          code: ["The verification code has expired."],
        },
        data: {
          resendRequired: true,
        },
      },
      {
        status: 400,
      },
    );
  }

  if (verificationCode.attemptCount >= MAX_VERIFICATION_ATTEMPTS) {
    await prisma.emailVerificationCode.updateMany({
      where: {
        id: verificationCode.id,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    return NextResponse.json(
      {
        success: false,
        message:
          "Too many incorrect attempts. Request a new verification code.",
        errors: {
          code: ["This verification code can no longer be used."],
        },
        data: {
          attemptsRemaining: 0,
          resendRequired: true,
        },
      },
      {
        status: 429,
      },
    );
  }

  const submittedCodeHash = hashVerificationCode(submittedCode);

  const codeMatches = safelyCompareHexHashes(
    verificationCode.codeHash,
    submittedCodeHash,
  );

  if (!codeMatches) {
    const nextAttemptCount = verificationCode.attemptCount + 1;
    const shouldInvalidateCode =
      nextAttemptCount >= MAX_VERIFICATION_ATTEMPTS;

    const updatedCode = await prisma.emailVerificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        attemptCount: {
          increment: 1,
        },
        usedAt: shouldInvalidateCode ? now : undefined,
      },
      select: {
        attemptCount: true,
      },
    });

    const attemptsRemaining = Math.max(
      0,
      MAX_VERIFICATION_ATTEMPTS - updatedCode.attemptCount,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          attemptsRemaining > 0
            ? "The verification code is incorrect."
            : "Too many incorrect attempts. Request a new verification code.",

        errors: {
          code: [
            attemptsRemaining > 0
              ? `Incorrect code. ${attemptsRemaining} attempt${
                  attemptsRemaining === 1 ? "" : "s"
                } remaining.`
              : "This verification code can no longer be used.",
          ],
        },

        data: {
          attemptsRemaining,
          resendRequired: attemptsRemaining === 0,
        },
      },
      {
        status: attemptsRemaining === 0 ? 429 : 400,
      },
    );
  }

  try {
    await prisma.$transaction(async (transaction) => {
      /*
       * Atomically claim the verification code.
       *
       * The conditions prevent:
       * - expired-code verification;
       * - reused-code verification;
       * - verification after too many attempts;
       * - two simultaneous requests from using the same code.
       */
      const claimedCode =
        await transaction.emailVerificationCode.updateMany({
          where: {
            id: verificationCode.id,
            userId: user.id,
            codeHash: submittedCodeHash,
            usedAt: null,
            expiresAt: {
              gt: now,
            },
            attemptCount: {
              lt: MAX_VERIFICATION_ATTEMPTS,
            },
          },
          data: {
            usedAt: now,
          },
        });

      if (claimedCode.count !== 1) {
        throw new VerificationCodeUnavailableError();
      }

      await transaction.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: "ACTIVE",
          emailVerifiedAt: now,
        },
      });

      /*
       * Invalidate any other verification codes belonging to this user.
       */
      await transaction.emailVerificationCode.updateMany({
        where: {
          userId: user.id,
          id: {
            not: verificationCode.id,
          },
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });
    });
  } catch (error) {
    if (error instanceof VerificationCodeUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This verification code is no longer available. Request a new code.",
          errors: {
            code: ["The verification code has already been used or expired."],
          },
          data: {
            resendRequired: true,
          },
        },
        {
          status: 409,
        },
      );
    }

    console.error("Email verification database error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify your email address. Please try again.",
        errors: {},
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Your email address has been verified successfully. You can now log in.",
      data: {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        verified: true,
      },
    },
    {
      status: 200,
    },
  );
}