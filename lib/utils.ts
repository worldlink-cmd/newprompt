import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GarmentType, MeasurementUnit, OrderStatus, OrderPriority, OrderType } from 'types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateOrderNumber(): string {
  // TODO: Implement sequential order numbers per day to avoid collisions (Phase 4 enhancement)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp for uniqueness
  return `ORD-${year}${month}${day}-${timestamp}`;
}

export function generateCustomerNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp for uniqueness
  return `CUST-${year}${month}${day}-${timestamp}`;
}

export function generateEmployeeNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp for uniqueness
  return `EMP-${year}${month}${day}-${timestamp}`;
}

export function generateSupplierNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp for uniqueness
  return `SUP-${year}${month}${day}-${timestamp}`;
}

export function generateTransactionNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp for uniqueness
  return `TXN-${year}${month}${day}-${timestamp}`;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length (assuming international format)
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 10) {
    // International format: +XX XXX XXX XXXX
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  // Return as-is if format doesn't match common patterns
  return phone;
}

export function getCustomerFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatCustomerAddress(address?: string | null, city?: string | null, state?: string | null, postalCode?: string | null, country?: string | null): string {
  const parts = [address, city, state, postalCode, country].filter(Boolean);
  return parts.join(', ') || 'No address provided';
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

export function formatMeasurement(value: number, unit: MeasurementUnit): string {
  const unitLabel = unit === MeasurementUnit.CM ? 'cm' : 'inches';
  return `${value.toFixed(1)} ${unitLabel}`;
}

export function convertMeasurement(value: number, fromUnit: MeasurementUnit, toUnit: MeasurementUnit): number {
  if (fromUnit === toUnit) return value;
  if (fromUnit === MeasurementUnit.CM && toUnit === MeasurementUnit.INCH) {
    return value / 2.54;
  }
  if (fromUnit === MeasurementUnit.INCH && toUnit === MeasurementUnit.CM) {
    return value * 2.54;
  }
  return value;
}

export function getMeasurementVersionLabel(version: number, isLatest: boolean): string {
  return isLatest ? `Version ${version} (Current)` : `Version ${version}`;
}

export function formatMeasurementDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getGarmentTypeLabel(garmentType: GarmentType): string {
  switch (garmentType) {
    case GarmentType.SHIRT:
      return 'Shirt';
    case GarmentType.SUIT:
      return 'Suit';
    case GarmentType.DRESS:
      return 'Dress';
    case GarmentType.TROUSER:
      return 'Trouser';
    default:
      return garmentType;
  }
}

export function getOrderTypeLabel(orderType: OrderType): string {
  switch (orderType) {
    case OrderType.BESPOKE_SUIT:
      return 'Bespoke Suit';
    case OrderType.DRESS_ALTERATION:
      return 'Dress Alteration';
    case OrderType.ONE_PIECE:
      return 'One-piece';
    case OrderType.SUIT_ALTERATION:
      return 'Suit Alteration';
    case OrderType.CUSTOM_DESIGN:
      return 'Custom Design';
    case OrderType.REPAIR:
      return 'Repair';
    default:
      return orderType;
  }
}

export function calculateDeliveryDate(orderDate: Date, leadTimeDays: number = 7): Date {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + leadTimeDays);
  return deliveryDate;
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.RECEIVED:
      return 'Received';
    case OrderStatus.CUTTING:
      return 'Cutting';
    case OrderStatus.STITCHING:
      return 'Stitching';
    case OrderStatus.QUALITY_CHECK:
      return 'Quality Check';
    case OrderStatus.PRESSING:
      return 'Pressing';
    case OrderStatus.READY:
      return 'Ready';
    case OrderStatus.DELIVERED:
      return 'Delivered';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
}

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.RECEIVED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case OrderStatus.CUTTING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.STITCHING:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case OrderStatus.QUALITY_CHECK:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case OrderStatus.PRESSING:
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case OrderStatus.READY:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.DELIVERED:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getOrderPriorityLabel(priority: OrderPriority): string {
  switch (priority) {
    case OrderPriority.LOW:
      return 'Low';
    case OrderPriority.NORMAL:
      return 'Normal';
    case OrderPriority.HIGH:
      return 'High';
    case OrderPriority.URGENT:
      return 'Urgent';
    default:
      return priority;
  }
}

export function getOrderPriorityColor(priority: OrderPriority): string {
  switch (priority) {
    case OrderPriority.LOW:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case OrderPriority.NORMAL:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderPriority.HIGH:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case OrderPriority.URGENT:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function formatOrderDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
