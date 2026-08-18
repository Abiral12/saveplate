import { z } from "zod";

export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "180d"]).default("30d"),
  category: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
