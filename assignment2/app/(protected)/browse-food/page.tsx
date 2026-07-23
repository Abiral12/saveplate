import type {
  Metadata,
} from "next";

import {
  BrowseFoodPageClient,
} from "@/components/donations/browse-food-page-client";

export const metadata: Metadata = {
  title: "Browse Food",
  description:
    "Browse food shared by other SavePlate users.",
};

export default function BrowseFoodPage() {
  return <BrowseFoodPageClient />;
}