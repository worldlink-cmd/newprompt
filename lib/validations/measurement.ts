import { z } from 'zod';
import { GarmentType, MeasurementUnit } from 'types';
import { getMeasurementTemplate } from 'lib/constants/measurement-templates';

const measurementFieldSchema = z
  .number()
  .min(0, 'Measurement must be positive')
  .max(500, 'Measurement value too large');

const measurementsObjectSchema = z.record(z.string(), measurementFieldSchema);

const baseMeasurementSchema = z.object({
  garmentType: z.nativeEnum(GarmentType),
  unit: z.nativeEnum(MeasurementUnit),
  measurements: measurementsObjectSchema,
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const createMeasurementSchema = baseMeasurementSchema.refine(
  (data) => {
    const template = getMeasurementTemplate(data.garmentType);
    const requiredFields = template.fields.filter((field) => field.required).map((field) => field.name);
    return requiredFields.every((field) => field in data.measurements);
  },
  {
    message: 'All required measurement fields must be provided',
    path: ['measurements'],
  }
);

export const updateMeasurementSchema = baseMeasurementSchema.partial().extend({
  id: z.string().optional(),
}).refine(
  (data) => {
    // Only validate if both garmentType and measurements are present
    if (data.garmentType && data.measurements) {
      const template = getMeasurementTemplate(data.garmentType);
      const requiredFields = template.fields.filter((field) => field.required).map((field) => field.name);
      return requiredFields.every((field) => field in data.measurements!);
    }
    return true; // Skip validation if either field is missing
  },
  {
    message: 'All required measurement fields must be provided for the selected garment type',
    path: ['measurements'],
  }
);

export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;

export function validateMeasurementFields(
  garmentType: GarmentType,
  measurements: Record<string, number>
): boolean {
  const template = getMeasurementTemplate(garmentType);
  const requiredFields = template.fields.filter((field) => field.required).map((field) => field.name);
  return requiredFields.every((field) => field in measurements);
}
