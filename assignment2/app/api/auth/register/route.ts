import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationCodeEmail } from "@/lib/email/send-verification-code";
import { hashPassword } from "@/lib/security/password";
import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/security/tokens";
import { registerApiSchema } from "@/lib/validation/auth-api";

export const runtime = "nodejs";

function normalizeFullName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, " ");
}

function getVerificationDurationMinutes(): number {
  const configuredDuration = Number(
    process.env.VERIFICATION_CODE_DURATION_MINUTES ?? "15",
  );

  if (
    !Number.isInteger(configuredDuration) ||
    configuredDuration < 5 ||
    configuredDuration > 60
  ) {
    return 15;
  }

  return configuredDuration;
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

  const validationResult = registerApiSchema.safeParse(requestBody);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Please correct the highlighted registration fields.",
        errors: validationResult.error.flatten().fieldErrors,
      },
      {
        status: 422,
      },
    );
  }

  const fullName = normalizeFullName(validationResult.data.fullName);
  const email = validationResult.data.email.trim().toLowerCase();
  const householdSize = validationResult.data.householdSize;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return NextResponse.json(
      {
        success: false,
        message: "An account with this email address already exists.",
        errors: {
          email: ["This email address is already registered."],
        },
      },
      {
        status: 409,
      },
    );
  }

  const passwordHash = await hashPassword(validationResult.data.password);

  const verificationCode = generateVerificationCode();
  const verificationCodeHash =
    hashVerificationCode(verificationCode);

  const verificationDurationMinutes =
    getVerificationDurationMinutes();

  const verificationExpiresAt = new Date(
    Date.now() + verificationDurationMinutes * 60 * 1000,
  );

  let createdUser: {
    id: string;
    fullName: string;
    email: string;
  };

  try {
    createdUser = await prisma.$transaction(async (transaction) => {
      return transaction.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          householdSize,
          privacySetting: {
            create: {
              listingVisibility: "PRIVATE",
              showContactInformation: false,
              expiryAlertsEnabled: true,
              donationAlertsEnabled: true,
            },
          },
          verificationCodes: {
            create: {
              codeHash: verificationCodeHash,
              expiresAt: verificationExpiresAt,
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email address already exists.",
          errors: {
            email: ["This email address is already registered."],
          },
        },
        {
          status: 409,
        },
      );
    }

    console.error("Registration database error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create your SavePlate account.",
        errors: {},
      },
      {
        status: 500,
      },
    );
  }

  try {
    await sendVerificationCodeEmail({
      fullName: createdUser.fullName,
      email: createdUser.email,
      code: verificationCode,
      expiresInMinutes: verificationDurationMinutes,
    });
  } catch (error) {
    console.error("Verification email error:", error);

    // Remove the incomplete account because the user cannot verify it.
    await prisma.user
      .delete({
        where: {
          id: createdUser.id,
        },
      })
      .catch((cleanupError) => {
        console.error(
          "Failed to remove account after email failure:",
          cleanupError,
        );
      });

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not send the verification email. Please try registering again.",
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
        "Account created successfully. Check your email for the verification code.",
      data: {
        userId: createdUser.id,
        email: createdUser.email,
        verificationRequired: true,
      },
    },
    {
      status: 201,
    },
  );
}