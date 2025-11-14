import { z } from "zod";

export const urlSchema = z.object({
  originalUrl: z
    .string()
    .url("Invalid URL") // ensure it's a valid URL
    .nonempty("Original URL is required"),
  alias: z.string().optional(), // optional alias, max length 50 chars
  linkType: z
    .enum(["public", "private", "protected"])
    .optional()
    .default("public"), // optional, defaults to "public"
  setExpiry: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"), // optional, must be a valid date string if provided
  password: z.string().optional(), //optional password , if protected
});
