import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-config";
import { hashSessionToken } from "@/lib/security/tokens";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawSessionToken = request.cookies.get(
    SESSION_COOKIE_NAME,
  )?.value;

  try {
    if (rawSessionToken) {
      const tokenHash = hashSessionToken(rawSessionToken);

      await prisma.session.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
        data: {},
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      priority: "high",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    /*
     * Clear the browser cookie even when database revocation fails.
     * The API still reports the server-side failure.
     */
    const response = NextResponse.json(
      {
        success: false,
        message: "Unable to complete logout.",
        errors: {},
      },
      {
        status: 500,
      },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      priority: "high",
    });

    return response;
  }
}