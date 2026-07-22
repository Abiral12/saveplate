import type { Metadata } from "next";

import { InventoryPageClient } from "@/components/inventory/inventory-page-client";

export const metadata: Metadata = {
  title: "Food Inventory",
  description:
    "Manage household food items, quantities, storage locations and expiry dates.",
};

export const dynamic =
  "force-dynamic";

export default function InventoryPage() {
  return <InventoryPageClient />;
}