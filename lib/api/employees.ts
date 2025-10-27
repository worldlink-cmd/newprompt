import { Employee, EmployeeSearchParams } from '../../types';

const API_BASE = '/api/employees';

// Fetch employees with filters
export async function fetchEmployees(params: EmployeeSearchParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append('search', params.search);
  if (params.role) searchParams.append('role', params.role);
  if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  return response.json();
}

// Fetch a single employee
export async function fetchEmployee(id: string) {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch employee: ${response.statusText}`);
  }

  return response.json();
}

// Create a new employee
export async function createEmployee(data: any) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create employee');
  }

  return response.json();
}

// Update an employee
export async function updateEmployee(id: string, data: any) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update employee');
  }

  return response.json();
}

// Delete an employee
export async function deleteEmployee(id: string) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete employee');
  }

  return response.json();
}
