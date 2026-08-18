export type AnalyticsPeriod = "7d" | "30d" | "90d" | "180d";

export type AnalyticsSummary = {
  foodSaved: number;
  itemsUsed: number;
  donationsCompleted: number;
  foodDiscarded: number;
  wasteReductionRate: number;
};

export type AnalyticsOutcome = {
  status: "USED" | "DONATED" | "DISCARDED";
  label: string;
  count: number;
};

export type AnalyticsCategory = {
  category: string;
  saved: number;
  discarded: number;
  total: number;
};

export type AnalyticsTrendPoint = {
  key: string;
  label: string;
  saved: number;
  donated: number;
  discarded: number;
};

export type FoodAnalyticsData = {
  period: {
    type: AnalyticsPeriod;
    from: string;
    to: string;
  };
  selectedCategory: string | null;
  categories: string[];
  summary: AnalyticsSummary;
  outcomes: AnalyticsOutcome[];
  categoryBreakdown: AnalyticsCategory[];
  trend: AnalyticsTrendPoint[];
  hasActivity: boolean;
};
