import api from './api';

export type PaymentStatus = 'pendiente' | 'pagado';

export interface Payment {
  id: number;
  concept: string;
  description: string;
  amount: string;
  due_date: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentPayload {
  concept: string;
  description: string;
  amount: number;
  due_date: string;
}

export interface UpdatePaymentPayload {
  concept?: string;
  description?: string;
  amount?: number;
  due_date?: string;
}

export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get('/payments/');
  return response.data;
};

export const createPayment = async (
  payload: CreatePaymentPayload
): Promise<Payment> => {
  const response = await api.post('/payments/', payload);
  return response.data;
};

export const updatePayment = async (
  id: number,
  payload: UpdatePaymentPayload
): Promise<Payment> => {
  const response = await api.put(`/payments/${id}`, payload);
  return response.data;
};

export const markPaymentAsPaid = async (id: number): Promise<Payment> => {
  const response = await api.patch(`/payments/${id}/mark-paid`);
  return response.data;
};

export const deletePayment = async (id: number): Promise<void> => {
  await api.delete(`/payments/${id}`);
};
