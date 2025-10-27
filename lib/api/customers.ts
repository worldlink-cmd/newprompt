import { Customer, CustomerSearchParams } from '../../types';
import { CreateCustomerInput, UpdateCustomerInput } from '../validations/customer';

export async function fetchCustomers(params: CustomerSearchParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.gender) searchParams.set('gender', params.gender);
  if (params.preferredContactMethod) searchParams.set('preferredContactMethod', params.preferredContactMethod);
  if (params.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/customers?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}

export async function fetchCustomerById(id: string) {
  const response = await fetch(`/api/customers/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Customer not found');
    }
    throw new Error('Failed to fetch customer');
  }

  return response.json();
}

export async function createCustomer(data: CreateCustomerInput) {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create customer');
  }

  return response.json();
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update customer');
  }

  return response.json();
}

export async function deleteCustomer(id: string) {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete customer');
  }

  return response.json();
}
