import type {
  Metadata,
} from "next";

import {
  MyRequestsPageClient,
} from "@/components/donations/my-requests-page-client";

export const metadata: Metadata = {
  title: "My Requests",
  description:
    "Track pending, accepted, rejected and claimed donation requests.",
};

export default function MyRequestsPage() {
  return <MyRequestsPageClient />;
}