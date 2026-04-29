import { z } from "zod";

export const todoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().refine((val) => val === "" || val.length >= 5, {
    message: "Description must be at least 5 characters",
  }),
  is_completed: z.boolean().default(false),
});
