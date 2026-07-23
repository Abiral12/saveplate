import type {
  Metadata,
} from "next";

import {
  DonationsPageClient,
} from "@/components/donations/donations-page-client";

export const metadata: Metadata = {
  title: "My Donations",
  description:
    "Manage food donation listings and incoming food requests.",
};

export default function DonationsPage() {
  return <DonationsPageClient />;
}