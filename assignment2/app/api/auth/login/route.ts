import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import {
  createSessionExpiryDate,
  getSessionMaxAgeSeconds,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session-config";
import { verifyPassword } from "@/lib/security/password";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/lib/security/tokens";
import { loginApiSchema } from "@/lib/validation/auth-api";

export const runtime = "nodejs";

function getRequestIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
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

  const validationResult = loginApiSchema.safeParse(requestBody);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid email address and password.",
        errors: validationResult.error.flatten().fieldErrors,
      },
      {
        status: 422,
      },
    );
  }

  const email = validationResult.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      passwordHash: true,
      status: true,
      emailVerifiedAt: true,
    },
  });

  /*
   * Use the same message for an unknown email and an incorrect password.
   * This avoids exposing whether a specific email address is registered.
   */
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "The email address or password is incorrect.",
        errors: {},
      },
      {
        status: 401,
      },
    );
  }

  const passwordMatches = await verifyPassword(
    validationResult.data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return NextResponse.json(
      {
        success: false,
        message: "The email address or password is incorrect.",
        errors: {},
      },
      {
        status: 401,
      },
    );
  }

  if (
    user.status === "PENDING_VERIFICATION" ||
    !user.emailVerifiedAt
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Your email address has not been verified. Enter the verification code sent to your email.",
        errors: {
          email: ["Email verification is required before login."],
        },
        data: {
          verificationRequired: true,
          email: user.email,
        },
      },
      {
        status: 403,
      },
    );
  }

  if (user.status === "SUSPENDED") {
    return NextResponse.json(
      {
        success: false,
        message:
          "This account has been suspended. Please contact SavePlate support.",
        errors: {},
      },
      {
        status: 403,
      },
    );
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      {
        success: false,
        message: "This account is not currently available.",
        errors: {},
      },
      {
        status: 403,
      },
    );
  }

  const rawSessionToken = generateSessionToken();
  const sessionTokenHash = hashSessionToken(rawSessionToken);
  const sessionExpiresAt = createSessionExpiryDate();

  const ipAddress = getRequestIpAddress(request);
  const userAgent = request.headers.get("user-agent");

  try {
    await prisma.$transaction([
      prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: sessionTokenHash,
          expiresAt: sessionExpiresAt,
          ipAddress,
          userAgent,
        },
      }),

      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastLoginAt: new Date(),
        },
      }),

      prisma.session.deleteMany({
        where: {
          userId: user.id,
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("Session creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create your login session.",
        errors: {},
      },
      {
        status: 500,
      },
    );
  }

  const response = NextResponse.json(
    {
      success: true,
      message: "Logged in successfully.",
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      },
    },
    {
      status: 200,
    },
  );

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawSessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: sessionExpiresAt,
    maxAge: getSessionMaxAgeSeconds(),
    priority: "high",
  });

  return response;
}