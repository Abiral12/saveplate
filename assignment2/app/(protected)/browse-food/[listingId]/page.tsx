import type {
  Metadata,
} from "next";

import {
  DonationDetailClient,
} from "@/components/donations/donation-detail-client";

export const metadata: Metadata = {
  title: "Donation Details",
};

type DonationDetailsPageProps = {
  params: Promise<{
    listingId: string;
  }>;
};

export default async function DonationDetailsPage({
  params,
}: DonationDetailsPageProps) {
  const { listingId } =
    await params;

  return (
    <DonationDetailClient
      listingId={listingId}
    />
  );
}