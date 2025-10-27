import { Measurement, MeasurementSearchParams, GarmentType } from 'types';
import { CreateMeasurementInput, UpdateMeasurementInput } from 'lib/validations/measurement';

const API_BASE = '/api/customers';

export async function fetchCustomerMeasurements(
  customerId: string,
  params?: MeasurementSearchParams
): Promise<Measurement[]> {
  const url = new URL(`${API_BASE}/${customerId}/measurements`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch measurements: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchMeasurementById(
  customerId: string,
  measurementId: string
): Promise<Measurement> {
  const response = await fetch(`${API_BASE}/${customerId}/measurements/${measurementId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch measurement: ${response.statusText}`);
  }
  return response.json();
}

export async function createMeasurement(
  customerId: string,
  data: CreateMeasurementInput
): Promise<Measurement> {
  const response = await fetch(`${API_BASE}/${customerId}/measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create measurement');
  }
  return response.json();
}

export async function updateMeasurement(
  customerId: string,
  measurementId: string,
  data: UpdateMeasurementInput
): Promise<Measurement> {
  const response = await fetch(`${API_BASE}/${customerId}/measurements/${measurementId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update measurement');
  }
  return response.json();
}

export async function deleteMeasurement(
  customerId: string,
  measurementId: string
): Promise<boolean> {
  const response = await fetch(`${API_BASE}/${customerId}/measurements/${measurementId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete measurement');
  }
  return true;
}

export async function fetchLatestMeasurements(
  customerId: string,
  garmentType?: GarmentType
): Promise<Measurement[]> {
  const url = new URL(`${API_BASE}/${customerId}/measurements/latest`, window.location.origin);
  if (garmentType) {
    url.searchParams.append('garmentType', garmentType);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch latest measurements: ${response.statusText}`);
  }
  return response.json();
}
