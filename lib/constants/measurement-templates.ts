import { GarmentType, OrderType, MeasurementTemplate } from 'types';

export const SHIRT_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.SHIRT,
  description: 'Standard shirt measurements',
  fields: [
    {
      name: 'neck',
      label: 'Neck circumference',
      unit: 'cm',
      required: true,
      min: 30,
      max: 60,
    },
    {
      name: 'chest',
      label: 'Chest circumference',
      unit: 'cm',
      required: true,
      min: 70,
      max: 150,
    },
    {
      name: 'waist',
      label: 'Waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'shoulder',
      label: 'Shoulder width',
      unit: 'cm',
      required: true,
      min: 35,
      max: 60,
    },
    {
      name: 'sleeveLength',
      label: 'Sleeve length from shoulder',
      unit: 'cm',
      required: true,
      min: 50,
      max: 90,
    },
    {
      name: 'shirtLength',
      label: 'Shirt length from shoulder to hem',
      unit: 'cm',
      required: true,
      min: 60,
      max: 100,
    },
    {
      name: 'cuff',
      label: 'Cuff circumference',
      unit: 'cm',
      required: true,
      min: 15,
      max: 30,
    },
  ],
};

export const SUIT_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.SUIT,
  description: 'Complete suit measurements (jacket and trouser)',
  fields: [
    // Jacket measurements
    {
      name: 'chest',
      label: 'Chest circumference',
      unit: 'cm',
      required: true,
      min: 70,
      max: 150,
    },
    {
      name: 'waist',
      label: 'Waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'hip',
      label: 'Hip circumference',
      unit: 'cm',
      required: true,
      min: 80,
      max: 160,
    },
    {
      name: 'shoulder',
      label: 'Shoulder width',
      unit: 'cm',
      required: true,
      min: 35,
      max: 60,
    },
    {
      name: 'sleeveLength',
      label: 'Sleeve length from shoulder',
      unit: 'cm',
      required: true,
      min: 50,
      max: 90,
    },
    {
      name: 'jacketLength',
      label: 'Jacket length from shoulder to hem',
      unit: 'cm',
      required: true,
      min: 60,
      max: 100,
    },
    // Trouser measurements
    {
      name: 'waistTrouser',
      label: 'Trouser waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'hipTrouser',
      label: 'Trouser hip circumference',
      unit: 'cm',
      required: true,
      min: 80,
      max: 160,
    },
    {
      name: 'inseam',
      label: 'Inseam length',
      unit: 'cm',
      required: true,
      min: 60,
      max: 100,
    },
    {
      name: 'outseam',
      label: 'Outseam length',
      unit: 'cm',
      required: true,
      min: 80,
      max: 120,
    },
    {
      name: 'thigh',
      label: 'Thigh circumference',
      unit: 'cm',
      required: true,
      min: 40,
      max: 80,
    },
    {
      name: 'knee',
      label: 'Knee circumference',
      unit: 'cm',
      required: true,
      min: 30,
      max: 60,
    },
    {
      name: 'cuffTrouser',
      label: 'Trouser cuff circumference',
      unit: 'cm',
      required: true,
      min: 20,
      max: 50,
    },
    {
      name: 'rise',
      label: 'Rise (crotch to waist)',
      unit: 'cm',
      required: true,
      min: 20,
      max: 40,
    },
  ],
};

export const DRESS_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.DRESS,
  description: 'Dress measurements',
  fields: [
    {
      name: 'bust',
      label: 'Bust circumference',
      unit: 'cm',
      required: true,
      min: 70,
      max: 150,
    },
    {
      name: 'waist',
      label: 'Waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'hip',
      label: 'Hip circumference',
      unit: 'cm',
      required: true,
      min: 80,
      max: 160,
    },
    {
      name: 'shoulderToWaist',
      label: 'Shoulder to waist length',
      unit: 'cm',
      required: true,
      min: 30,
      max: 50,
    },
    {
      name: 'waistToHem',
      label: 'Waist to hem length',
      unit: 'cm',
      required: true,
      min: 50,
      max: 100,
    },
    {
      name: 'dressLength',
      label: 'Total dress length',
      unit: 'cm',
      required: true,
      min: 80,
      max: 150,
    },
    {
      name: 'sleeveLength',
      label: 'Sleeve length',
      unit: 'cm',
      required: false,
      min: 40,
      max: 70,
    },
    {
      name: 'armhole',
      label: 'Armhole circumference',
      unit: 'cm',
      required: true,
      min: 30,
      max: 60,
    },
  ],
};

export const TROUSER_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.TROUSER,
  description: 'Trouser measurements',
  fields: [
    {
      name: 'waist',
      label: 'Waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'hip',
      label: 'Hip circumference',
      unit: 'cm',
      required: true,
      min: 80,
      max: 160,
    },
    {
      name: 'inseam',
      label: 'Inseam length',
      unit: 'cm',
      required: true,
      min: 60,
      max: 100,
    },
    {
      name: 'outseam',
      label: 'Outseam length',
      unit: 'cm',
      required: true,
      min: 80,
      max: 120,
    },
    {
      name: 'thigh',
      label: 'Thigh circumference',
      unit: 'cm',
      required: true,
      min: 40,
      max: 80,
    },
    {
      name: 'knee',
      label: 'Knee circumference',
      unit: 'cm',
      required: true,
      min: 30,
      max: 60,
    },
    {
      name: 'cuff',
      label: 'Cuff circumference',
      unit: 'cm',
      required: true,
      min: 20,
      max: 50,
    },
    {
      name: 'rise',
      label: 'Rise (crotch to waist)',
      unit: 'cm',
      required: true,
      min: 20,
      max: 40,
    },
  ],
};

// Order Type specific templates
export const BESPOKE_SUIT_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.SUIT,
  description: 'Bespoke suit measurements with multi-piece options',
  fields: [
    ...SUIT_TEMPLATE.fields,
    {
      name: 'waistcoatRequired',
      label: 'Include Waistcoat',
      unit: '',
      required: false,
      type: 'boolean',
    },
    {
      name: 'waistcoatChest',
      label: 'Waistcoat chest circumference',
      unit: 'cm',
      required: false,
      min: 70,
      max: 150,
    },
    {
      name: 'waistcoatLength',
      label: 'Waistcoat length',
      unit: 'cm',
      required: false,
      min: 40,
      max: 80,
    },
  ],
};

export const DRESS_ALTERATION_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.DRESS,
  description: 'Dress alteration measurements',
  fields: [
    ...DRESS_TEMPLATE.fields,
    {
      name: 'originalBust',
      label: 'Original bust circumference',
      unit: 'cm',
      required: true,
      min: 70,
      max: 150,
    },
    {
      name: 'originalWaist',
      label: 'Original waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'originalHip',
      label: 'Original hip circumference',
      unit: 'cm',
      required: true,
      min: 80,
      max: 160,
    },
    {
      name: 'alterationType',
      label: 'Type of alteration',
      unit: '',
      required: true,
      type: 'select',
      options: ['Shorten', 'Lengthen', 'Take in', 'Let out', 'Repair'],
    },
  ],
};

export const ONE_PIECE_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.DRESS,
  description: 'One-piece garment measurements',
  fields: [
    ...DRESS_TEMPLATE.fields,
    {
      name: 'style',
      label: 'Style preference',
      unit: '',
      required: false,
      type: 'select',
      options: ['Casual', 'Formal', 'Sporty', 'Elegant'],
    },
  ],
};

export const SUIT_ALTERATION_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.SUIT,
  description: 'Suit alteration measurements',
  fields: [
    ...SUIT_TEMPLATE.fields,
    {
      name: 'originalChest',
      label: 'Original chest circumference',
      unit: 'cm',
      required: true,
      min: 70,
      max: 150,
    },
    {
      name: 'originalWaist',
      label: 'Original waist circumference',
      unit: 'cm',
      required: true,
      min: 60,
      max: 140,
    },
    {
      name: 'alterationType',
      label: 'Type of alteration',
      unit: '',
      required: true,
      type: 'select',
      options: ['Shorten sleeves', 'Lengthen sleeves', 'Take in jacket', 'Let out jacket', 'Adjust trousers'],
    },
  ],
};

export const CUSTOM_DESIGN_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.DRESS,
  description: 'Custom design measurements',
  fields: [
    ...DRESS_TEMPLATE.fields,
    {
      name: 'designNotes',
      label: 'Design notes and preferences',
      unit: '',
      required: false,
      type: 'textarea',
    },
    {
      name: 'fabricPreference',
      label: 'Fabric preference',
      unit: '',
      required: false,
      type: 'select',
      options: ['Cotton', 'Silk', 'Wool', 'Linen', 'Synthetic'],
    },
  ],
};

export const REPAIR_TEMPLATE: MeasurementTemplate = {
  garmentType: GarmentType.DRESS,
  description: 'Repair measurements and notes',
  fields: [
    {
      name: 'repairType',
      label: 'Type of repair',
      unit: '',
      required: true,
      type: 'select',
      options: ['Tear repair', 'Button replacement', 'Zipper fix', 'Hem repair', 'Stain removal'],
    },
    {
      name: 'repairNotes',
      label: 'Repair notes',
      unit: '',
      required: true,
      type: 'textarea',
    },
    {
      name: 'urgency',
      label: 'Repair urgency',
      unit: '',
      required: false,
      type: 'select',
      options: ['Low', 'Normal', 'High', 'Urgent'],
    },
  ],
};

export const ORDER_TYPE_TEMPLATES: Record<OrderType, MeasurementTemplate> = {
  [OrderType.BESPOKE_SUIT]: BESPOKE_SUIT_TEMPLATE,
  [OrderType.DRESS_ALTERATION]: DRESS_ALTERATION_TEMPLATE,
  [OrderType.ONE_PIECE]: ONE_PIECE_TEMPLATE,
  [OrderType.SUIT_ALTERATION]: SUIT_ALTERATION_TEMPLATE,
  [OrderType.CUSTOM_DESIGN]: CUSTOM_DESIGN_TEMPLATE,
  [OrderType.REPAIR]: REPAIR_TEMPLATE,
};

export const MEASUREMENT_TEMPLATES: Record<GarmentType, MeasurementTemplate> = {
  [GarmentType.SHIRT]: SHIRT_TEMPLATE,
  [GarmentType.SUIT]: SUIT_TEMPLATE,
  [GarmentType.DRESS]: DRESS_TEMPLATE,
  [GarmentType.TROUSER]: TROUSER_TEMPLATE,
};

export function getMeasurementTemplate(garmentType: GarmentType): MeasurementTemplate {
  return MEASUREMENT_TEMPLATES[garmentType];
}

export function getOrderTypeTemplate(orderType: OrderType): MeasurementTemplate {
  return ORDER_TYPE_TEMPLATES[orderType];
}
