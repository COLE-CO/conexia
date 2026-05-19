export type TrafficLight = 'red' | 'yellow' | 'gray';

export interface PaymentFormState {
  concept: string;
  description: string;
  amount: string;
  due_date: string;
}

export const initialPaymentForm: PaymentFormState = {
  concept: '',
  description: '',
  amount: '',
  due_date: '',
};

export const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function getTrafficLight(status: string, dueDate: string): TrafficLight {
  if (status === 'pagado') return 'gray';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return due < today ? 'red' : 'yellow';
}
