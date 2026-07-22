import { z } from "zod";

const DATE_ONLY_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value: string) {
  const date =
    new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime());
}

const dateOnlySchema = z
  .string()
  .regex(
    DATE_ONLY_PATTERN,
    "Date must use YYYY-MM-DD format."
  )
  .refine(
    isValidDateOnly,
    "Expiry date is invalid."
  );

const optionalNullableText = (
  maximumLength: number
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
      .nullable()
  );

export const createInventoryItemSchema =
  z.object({
    itemName: z
      .string()
      .trim()
      .min(
        2,
        "Item name must contain at least 2 characters."
      )
      .max(
        150,
        "Item name cannot exceed 150 characters."
      ),

    quantity: z.coerce
      .number()
      .positive(
        "Quantity must be greater than zero."
      )
      .max(
        999999,
        "Quantity is too large."
      ),

    unit: z
      .string()
      .trim()
      .min(1, "Unit is required.")
      .max(
        30,
        "Unit cannot exceed 30 characters."
      ),

    expiryDate: dateOnlySchema,

    category: z
      .string()
      .trim()
      .min(1, "Category is required.")
      .max(
        50,
        "Category cannot exceed 50 characters."
      ),

    storageLocation:
      optionalNullableText(50).optional(),

    notes:
      optionalNullableText(1000).optional(),
  });

export const updateInventoryItemSchema =
  z
    .object({
      itemName: z
        .string()
        .trim()
        .min(
          2,
          "Item name must contain at least 2 characters."
        )
        .max(
          150,
          "Item name cannot exceed 150 characters."
        )
        .optional(),

      quantity: z.coerce
        .number()
        .positive(
          "Quantity must be greater than zero."
        )
        .max(
          999999,
          "Quantity is too large."
        )
        .optional(),

      unit: z
        .string()
        .trim()
        .min(1, "Unit is required.")
        .max(
          30,
          "Unit cannot exceed 30 characters."
        )
        .optional(),

      expiryDate:
        dateOnlySchema.optional(),

      category: z
        .string()
        .trim()
        .min(1, "Category is required.")
        .max(
          50,
          "Category cannot exceed 50 characters."
        )
        .optional(),

      storageLocation:
        optionalNullableText(50).optional(),

      notes:
        optionalNullableText(1000).optional(),

      status: z
        .enum([
          "AVAILABLE",
          "USED",
          "DISCARDED",
        ])
        .optional(),
    })
    .refine(
      (value) =>
        Object.keys(value).length > 0,
      {
        message:
          "At least one field must be provided.",
      }
    );

const optionalQueryString = z.preprocess(
  (value) =>
    value === "" ? undefined : value,
  z.string().trim().optional()
);

const optionalPositiveInteger = (
  defaultValue: number,
  maximum?: number
) =>
  z.preprocess(
    (value) =>
      value === "" ||
      value === undefined
        ? defaultValue
        : value,
    maximum
      ? z.coerce
          .number()
          .int()
          .min(1)
          .max(maximum)
      : z.coerce
          .number()
          .int()
          .min(1)
  );

export const inventoryQuerySchema =
  z.object({
    search: optionalQueryString,

    category: optionalQueryString,

    storageLocation:
      optionalQueryString,

    status: z.preprocess(
      (value) =>
        value === ""
          ? undefined
          : value,
      z
        .enum([
          "AVAILABLE",
          "USED",
          "DISCARDED",
          "RESERVED",
          "DONATED",
        ])
        .optional()
    ),

    expiry: z.preprocess(
      (value) =>
        value === ""
          ? undefined
          : value,
      z
        .enum([
          "expired",
          "soon",
          "future",
        ])
        .optional()
    ),

    sortBy: z.preprocess(
      (value) =>
        value === "" ||
        value === undefined
          ? "createdAt"
          : value,
      z.enum([
        "createdAt",
        "updatedAt",
        "expiryDate",
        "itemName",
        "quantity",
      ])
    ),

    sortDirection: z.preprocess(
      (value) =>
        value === "" ||
        value === undefined
          ? "desc"
          : value,
      z.enum(["asc", "desc"])
    ),

    page: optionalPositiveInteger(1),

    size: optionalPositiveInteger(
      20,
      100
    ),
  });

export type CreateInventoryItemInput =
  z.infer<
    typeof createInventoryItemSchema
  >;

export type UpdateInventoryItemInput =
  z.infer<
    typeof updateInventoryItemSchema
  >;

export type InventoryQueryInput =
  z.infer<
    typeof inventoryQuerySchema
  >;