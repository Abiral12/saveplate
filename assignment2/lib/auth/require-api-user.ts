import "server-only";

import {
  getCurrentUser,
  type CurrentUser,
} from "@/lib/auth/current-user";
import { ApiError } from "@/modules/inventory/inventory.errors";

// import { ApiError } from "@/modules/inventory/inventory.errors";

export async function requireApiUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(
      401,
      "Authentication is required.",
    );
  }

  return user;
}