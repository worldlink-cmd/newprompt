import * as z from "zod"

export const invoiceItemSchema = z.object({
  serviceId: z.string().optional(),
  description: z.string().min(1, { message: "Description is required." }),
  quantity: z.coerce.number().min(0.01, { message: "Quantity must be a positive number." }),
  unitPrice: z.coerce.number().min(0, { message: "Unit price must be a positive number." }),
  totalPrice: z.coerce.number().min(0, { message: "Total price must be a positive number." }),
  taxRateId: z.string().optional(),
  taxAmount: z.coerce.number().default(0),
  discount: z.coerce.number().default(0),
})

export const invoiceSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().min(1, { message: "Customer is required." }),
  invoiceDate: z.coerce.date().default(new Date()),
  dueDate: z.coerce.date(),
  totalAmount: z.coerce.number().min(0, { message: "Total amount must be a positive number." }),
  subTotal: z.coerce.number().min(0, { message: "Subtotal must be a positive number." }),
  taxAmount: z.coerce.number().default(0),
  discountAmount: z.coerce.number().default(0),
  amountPaid: z.coerce.number().default(0),
  balanceDue: z.coerce.number().min(0, { message: "Balance due must be a positive number." }),
  currency: z.string().default("AED"),
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED", "VOID"]).default("DRAFT"),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE", "BANK_TRANSFER", "CHEQUE", "DIGITAL_WALLET"]).optional(),
  notes: z.string().optional(),
  templateUsed: z.string().optional(),
  isAutomated: z.boolean().default(false),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one invoice item is required." }),
})
