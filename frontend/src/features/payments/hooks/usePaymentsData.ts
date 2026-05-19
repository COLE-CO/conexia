import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import {
  getPayments,
  createPayment,
  updatePayment,
  markPaymentAsPaid,
  deletePayment,
} from '../../../services/paymentsService';
import type { Payment } from '../../../services/paymentsService';
import { initialPaymentForm, type PaymentFormState } from '../types';

interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const getApiDetail = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null) return null;
  if (!('response' in error)) return null;
  const response = (error as { response?: { data?: { detail?: unknown } } })
    .response;
  if (!response?.data) return null;
  return typeof response.data.detail === 'string' ? response.data.detail : null;
};

export function usePaymentsData() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [paymentForm, setPaymentForm] =
    useState<PaymentFormState>(initialPaymentForm);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] =
    useState<PaymentFormState>(initialPaymentForm);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const fetched = await getPayments();
        if (!cancelled) setPayments(fetched);
      } catch {
        if (!cancelled) {
          setError('No fue posible cargar los pagos.');
          showToast('error', 'No fue posible cargar los pagos.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSavePayment =
    paymentForm.concept.trim() &&
    paymentForm.description.trim() &&
    paymentForm.amount &&
    Number(paymentForm.amount) > 0 &&
    paymentForm.due_date;

  const handleCreatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSavePayment) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const created = await createPayment({
        concept: paymentForm.concept.trim(),
        description: paymentForm.description.trim(),
        amount: Number(paymentForm.amount),
        due_date: paymentForm.due_date,
      });

      const refreshed = await getPayments();
      setPayments(refreshed);
      setPaymentForm(initialPaymentForm);
      showToast('success', `Pago "${created.concept}" creado correctamente.`);
    } catch (err: unknown) {
      const detail = getApiDetail(err);
      setError(detail || 'No se pudo crear el pago.');
      showToast('error', detail || 'No se pudo crear el pago.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (payment: Payment) => {
    setEditingPayment(payment);
    setEditForm({
      concept: payment.concept,
      description: payment.description,
      amount: String(payment.amount),
      due_date: payment.due_date,
    });
  };

  const cancelEditing = () => {
    setEditingPayment(null);
    setEditForm(initialPaymentForm);
  };

  const handleUpdatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPayment) return;

    setSaving(true);

    try {
      await updatePayment(editingPayment.id, {
        concept: editForm.concept.trim(),
        description: editForm.description.trim(),
        amount: Number(editForm.amount),
        due_date: editForm.due_date,
      });

      const refreshed = await getPayments();
      setPayments(refreshed);
      cancelEditing();
      showToast('success', 'Pago actualizado correctamente.');
    } catch (err: unknown) {
      const detail = getApiDetail(err);
      showToast('error', detail || 'No se pudo actualizar el pago.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await markPaymentAsPaid(id);
      const refreshed = await getPayments();
      setPayments(refreshed);
      showToast('success', 'Pago marcado como pagado.');
    } catch (err: unknown) {
      const detail = getApiDetail(err);
      showToast('error', detail || 'No se pudo marcar como pagado.');
    }
  };

  const requestDelete = (id: number) => setDeletingId(id);
  const cancelDelete = () => setDeletingId(null);

  const confirmDelete = async () => {
    if (deletingId === null) return;

    try {
      await deletePayment(deletingId);
      const refreshed = await getPayments();
      setPayments(refreshed);
      setDeletingId(null);
      showToast('success', 'Pago eliminado correctamente.');
    } catch (err: unknown) {
      const detail = getApiDetail(err);
      showToast('error', detail || 'No se pudo eliminar el pago.');
      setDeletingId(null);
    }
  };

  return {
    payments,
    loading,
    paymentForm,
    setPaymentForm,
    editingPayment,
    editForm,
    setEditForm,
    deletingId,
    saving,
    error,
    canSavePayment,
    toasts,
    dismissToast,
    handleCreatePayment,
    startEditing,
    cancelEditing,
    handleUpdatePayment,
    handleMarkPaid,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
