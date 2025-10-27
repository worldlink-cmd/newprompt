import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from 'types';

const baseSupplierPaymentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  purchaseOrderId: z.string().optional().nullable(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: 'Payment method is required',
  }),
  paymentDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  reference: z.string().max(100, 'Reference must be less than 100 characters').optional().nullable(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
  processedBy: z.string().optional().nullable(),
  processedAt: z.coerce.date().optional().nullable(),
});

const supplierPaymentSchemaWithRefinements = baseSupplierPaymentSchema.refine(
  (data) => {
    if (data.paymentDate && data.dueDate) {
      return data.paymentDate <= data.dueDate;
    }
    return true;
  },
  {
    message: 'Payment date cannot be after due date',
    path: ['paymentDate'],
  }
);

export const createSupplierPaymentSchema = supplierPaymentSchemaWithRefinements;

export const updateSupplierPaymentSchema = baseSupplierPaymentSchema.partial().extend({
  id: z.string().optional(),
}).refine(
  (data) => {
    if (data.paymentDate && data.dueDate) {
      return data.paymentDate <= data.dueDate;
    }
    return true;
  },
  {
    message: 'Payment date cannot be after due date',
    path: ['paymentDate'],
  }
);

export const updateSupplierPaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus, {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
  processedBy: z.string().optional(),
  processedAt: z.coerce.date().optional(),
});

export type CreateSupplierPaymentInput = z.infer<typeof createSupplierPaymentSchema>;
export type UpdateSupplierPaymentInput = z.infer<typeof updateSupplierPaymentSchema>;
export type UpdateSupplierPaymentStatusInput = z.infer<typeof updateSupplierPaymentStatusSchema>;
