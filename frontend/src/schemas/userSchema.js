import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const bootstrapSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const userFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
  role: z.enum(["user", "admin"]),
});

export const userCreateSchema = userFormSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});
