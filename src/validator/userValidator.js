import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string("Username is required")
    .min(3, "username must be at least 3 characters long"),
  email: z.string("Email is required").email("invalid email address"),
  password: z
    .string("Password is required")
    .min(6, "password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string("Email is required").email("invalid email address"),
  password: z
    .string("Password is required")
    .min(6, "password must be at least 6 characters long"),
});

export const updateUserProfileSchema = z
  .object({
    job: z.string().optional(),

    address: z.string().optional(),
    fullname: z.string().optional(),

    age: z
      .number()
      .int()
      .nonnegative("Age must be a positive number")
      .optional(),

    phoneNumber: z
      .string()
      .regex(/^[0-9+\-() ]*$/, "Invalid phone number")
      .optional(),
  })
  .strict();

export const UpdateUserSchema = z.object({
  email: z.string("Email is required").email("invalid email address"),
});
