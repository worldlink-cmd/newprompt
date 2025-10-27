import * as z from "zod"

export const creditNoteSchema = z.object({
  invoiceId: z.string().optional(),
  customerId: z.string().min(1, { message: "Customer is required." }),
  issueDate: z.coerce.date().default(new Date()),
  originalAmount: z.coerce.number().min(0.01, { message: "Original amount must be a positive number." }),
  remainingAmount: z.coerce.number().min(0, { message: "Remaining amount cannot be negative." }),
  currency: z.string().default("AED"),
  reason: z.string().optional(),
  status: z.enum(["DRAFT", "ISSUED", "APPLIED", "CANCELLED"]).default("DRAFT"),
  appliedToInvoiceId: z.string().optional(),
  appliedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
})
