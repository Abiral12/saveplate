import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-config";
import { hashSessionToken } from "@/lib/security/tokens";

export type CurrentUser = {
  id: string;
  sessionId: string;
  fullName: string;
  email: string;
  householdSize: number | null;
  emailVerifiedAt: Date;
  sessionExpiresAt: Date;
};

export const getCurrentUser = cache(
  async (): Promise<CurrentUser | null> => {
    const cookieStore = await cookies();

    const rawSessionToken = cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

    if (!rawSessionToken) {
      return null;
    }

    const tokenHash = hashSessionToken(rawSessionToken);

    const session = await prisma.session.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,

        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            householdSize: true,
            status: true,
            emailVerifiedAt: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    if (session.revokedAt) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    if (session.user.status !== "ACTIVE") {
      return null;
    }

    if (!session.user.emailVerifiedAt) {
      return null;
    }

    return {
      id: session.user.id,
      sessionId: session.id,
      fullName: session.user.fullName,
      email: session.user.email,
      householdSize: session.user.householdSize,
      emailVerifiedAt: session.user.emailVerifiedAt,
      sessionExpiresAt: session.expiresAt,
    };
  },
);

export const requireCurrentUser = cache(
  async (): Promise<CurrentUser> => {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login?reason=session-required");
    }

    return user;
  },
);