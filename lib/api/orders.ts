import { Order, OrderSearchParams, GarmentType, OrderStatus } from '../../types';
import { CreateOrderInput, UpdateOrderInput } from '../validations/order';
import {
  DEFAULT_LEAD_TIME_DAYS,
  LEAD_TIME_BY_GARMENT,
  URGENT_ORDER_LEAD_TIME_DAYS
} from '../constants/order-config';

const API_BASE_URL = '/api/orders';

export async function fetchOrders(params?: OrderSearchParams) {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          searchParams.append(key, value.toISOString());
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch orders');
  }

  return response.json();
}

export async function fetchOrderById(id: string) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch order');
  }

  return response.json();
}

export async function createOrder(data: CreateOrderInput) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

export async function updateOrder(id: string, data: UpdateOrderInput) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order');
  }

  return response.json();
}

export async function deleteOrder(id: string) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete order');
  }

  return response.json();
}

export async function updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order status');
  }

  return response.json();
}

export async function fetchOrderHistory(id: string) {
  const response = await fetch(`${API_BASE_URL}/${id}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch order history');
  }

  return response.json();
}

export function calculateEstimatedDelivery(garmentType: GarmentType, isUrgent: boolean): Date {
  const leadTime = isUrgent
    ? URGENT_ORDER_LEAD_TIME_DAYS
    : LEAD_TIME_BY_GARMENT[garmentType] || DEFAULT_LEAD_TIME_DAYS;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + leadTime);
  return deliveryDate;
}
