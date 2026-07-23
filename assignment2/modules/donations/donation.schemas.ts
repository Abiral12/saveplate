import { z } from "zod";

export const FOOD_CATEGORIES = [
  "DAIRY",
  "FRUIT",
  "VEGETABLE",
  "MEAT",
  "SEAFOOD",
  "GRAIN",
  "BAKERY",
  "FROZEN",
  "CANNED",
  "BEVERAGE",
  "SNACK",
  "OTHER",
] as const;

export type FoodCategoryValue =
  (typeof FOOD_CATEGORIES)[number];

const nullableText = (
  maximumLength: number,
) =>
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === undefined
      ) {
        return null;
      }

      return value;
    },
    z
      .string()
      .trim()
      .max(maximumLength)
      .nullable(),
  );

const optionalQueryText = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined
    ) {
      return undefined;
    }

    return value;
  },
  z.string().trim().optional(),
);

const pageSchema = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined
    ) {
      return 1;
    }

    return value;
  },
  z.coerce
    .number()
    .int()
    .min(
      1,
      "Page must be at least 1.",
    ),
);

const sizeSchema = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined
    ) {
      return 12;
    }

    return value;
  },
  z.coerce
    .number()
    .int()
    .min(
      1,
      "Page size must be at least 1.",
    )
    .max(
      50,
      "Page size cannot exceed 50.",
    ),
);

export const uuidSchema = z
  .string()
  .uuid(
    "The ID must be a valid UUID.",
  );

export const createDonationSchema =
  z
    .object({
      foodItemId: uuidSchema,

      pickupLocation: z
        .string()
        .trim()
        .min(
          3,
          "Pickup location must contain at least 3 characters.",
        )
        .max(
          250,
          "Pickup location cannot exceed 250 characters.",
        ),

      availabilityDetails: z
        .string()
        .trim()
        .min(
          3,
          "Availability details must contain at least 3 characters.",
        )
        .max(
          500,
          "Availability details cannot exceed 500 characters.",
        ),

      notes:
        nullableText(1000).optional(),
    })
    .strict();

const updateDonationDetailsSchema =
  z
    .object({
      pickupLocation: z
        .string()
        .trim()
        .min(
          3,
          "Pickup location must contain at least 3 characters.",
        )
        .max(
          250,
          "Pickup location cannot exceed 250 characters.",
        )
        .optional(),

      availabilityDetails: z
        .string()
        .trim()
        .min(
          3,
          "Availability details must contain at least 3 characters.",
        )
        .max(
          500,
          "Availability details cannot exceed 500 characters.",
        )
        .optional(),

      notes:
        nullableText(1000).optional(),
    })
    .strict()
    .refine(
      (value) =>
        Object.keys(value).length > 0,
      {
        message:
          "At least one field must be provided.",
      },
    );

const cancelDonationSchema = z
  .object({
    action: z.literal("CANCEL"),
  })
  .strict();

export const updateDonationSchema =
  z.union([
    updateDonationDetailsSchema,
    cancelDonationSchema,
  ]);

export const createDonationRequestSchema =
  z
    .object({
      message:
        nullableText(500).optional(),
    })
    .strict();

export const donationRequestActionSchema =
  z.discriminatedUnion("action", [
    z
      .object({
        action: z.literal("ACCEPT"),
      })
      .strict(),

    z
      .object({
        action: z.literal("REJECT"),
      })
      .strict(),

    z
      .object({
        action: z.literal("CLAIM"),
      })
      .strict(),

    z
      .object({
        action: z.literal("CANCEL"),
      })
      .strict(),
  ]);

export const ownDonationsQuerySchema =
  z
    .object({
      search: optionalQueryText,

      status: z.preprocess(
        (value) => {
          if (
            value === "" ||
            value === undefined
          ) {
            return undefined;
          }

          return value;
        },
        z
          .enum([
            "AVAILABLE",
            "RESERVED",
            "COMPLETED",
            "CANCELLED",
            "EXPIRED",
          ])
          .optional(),
      ),

      page: pageSchema,
      size: sizeSchema,
    })
    .strict();

export const browseDonationsQuerySchema =
  z
    .object({
      search: optionalQueryText,

      location: optionalQueryText,

      category: z.preprocess(
        (value) => {
          if (
            value === "" ||
            value === undefined
          ) {
            return undefined;
          }

          return value;
        },
        z
          .enum(
            FOOD_CATEGORIES,
          )
          .optional(),
      ),

      expiry: z.preprocess(
        (value) => {
          if (
            value === "" ||
            value === undefined
          ) {
            return undefined;
          }

          return value;
        },
        z
          .enum([
            "soon",
            "later",
          ])
          .optional(),
      ),

      page: pageSchema,
      size: sizeSchema,
    })
    .strict();

export const myRequestsQuerySchema =
  z
    .object({
      search: optionalQueryText,

      status: z.preprocess(
        (value) => {
          if (
            value === "" ||
            value === undefined
          ) {
            return undefined;
          }

          return value;
        },
        z
          .enum([
            "PENDING",
            "ACCEPTED",
            "REJECTED",
            "CLAIMED",
            "CANCELLED",
          ])
          .optional(),
      ),

      page: pageSchema,
      size: sizeSchema,
    })
    .strict();

export type CreateDonationInput =
  z.infer<
    typeof createDonationSchema
  >;

export type UpdateDonationInput =
  z.infer<
    typeof updateDonationSchema
  >;

export type CreateDonationRequestInput =
  z.infer<
    typeof createDonationRequestSchema
  >;

export type DonationRequestActionInput =
  z.infer<
    typeof donationRequestActionSchema
  >;

export type OwnDonationsQuery =
  z.infer<
    typeof ownDonationsQuerySchema
  >;

export type BrowseDonationsQuery =
  z.infer<
    typeof browseDonationsQuerySchema
  >;

export type MyRequestsQuery =
  z.infer<
    typeof myRequestsQuerySchema
  >;