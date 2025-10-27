import * as z from "zod"

export const serviceSchema = z.object({
  name: z.string().min(1, { message: "Service name is required." }),
  description: z.string().optional(),
  category: z.enum(["TAILORING", "ALTERATION", "REPAIR", "DESIGN", "CONSULTATION", "OTHER"], {
    required_error: "Service category is required.",
  }),
  basePrice: z.coerce.number().min(0, { message: "Base price must be a positive number." }),
  currency: z.string().default("AED"),
  unit: z.string().optional(),
  isActive: z.boolean().default(true),
})
