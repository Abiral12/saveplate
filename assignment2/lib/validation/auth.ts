import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters.")
      .max(80, "Full name cannot exceed 80 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address."),

    householdSize: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" ||
          (/^\d+$/.test(value) &&
            Number(value) >= 1 &&
            Number(value) <= 30),
        "Household size must be between 1 and 30.",
      ),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(72, "Password cannot exceed 72 characters.")
      .regex(/[a-z]/, "Password must include a lowercase letter.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/\d/, "Password must include a number."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the complete six-digit verification code."),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;