import type { Metadata } from "next";

import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";

export const metadata: Metadata = {
  title: "Food Analytics",
  description: "Track food saved, donations and household food-waste reduction.",
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
