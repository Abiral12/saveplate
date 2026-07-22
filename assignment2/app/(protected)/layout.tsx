import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: {
    default: "SavePlate",
    template: "%s | SavePlate",
  },
  description:
    "Manage household food, expiry dates, donations and food-saving activity.",
};

export const dynamic = "force-dynamic";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await requireCurrentUser();

  return (
    <DashboardShell
      user={{
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      }}
    >
      {children}
    </DashboardShell>
  );
}