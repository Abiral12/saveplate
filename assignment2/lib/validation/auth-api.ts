import { z } from "zod";

export const registerApiSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320, "Email address is too long."),

  householdSize: z
    .number()
    .int("Household size must be a whole number.")
    .min(1, "Household size must be at least 1.")
    .max(30, "Household size cannot exceed 30.")
    .optional(),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(72, "Password cannot exceed 72 characters.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/\d/, "Password must include a number."),
});

export const loginApiSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320, "Email address is too long."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(72, "Password cannot exceed 72 characters."),
});

export const verifyEmailApiSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320, "Email address is too long."),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must contain exactly six digits."),
});

export type RegisterApiInput = z.infer<typeof registerApiSchema>;
export type LoginApiInput = z.infer<typeof loginApiSchema>;
export type VerifyEmailApiInput = z.infer<typeof verifyEmailApiSchema>;