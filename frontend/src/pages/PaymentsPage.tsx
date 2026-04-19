import PaymentsSkeleton from '../features/payments/components/PaymentsSkeleton';
import PaymentsToasts from '../features/payments/components/PaymentsToasts';
import NewPaymentCard from '../features/payments/components/NewPaymentCard';
import PaymentsTable from '../features/payments/components/PaymentsTable';
import EditPaymentModal from '../features/payments/components/EditPaymentModal';
import DeleteConfirmDialog from '../features/payments/components/DeleteConfirmDialog';
import { usePaymentsData } from '../features/payments/hooks/usePaymentsData';

export default function PaymentsPage() {
  const {
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
  } = usePaymentsData();

  return (
    <div className="min-h-screen bg-neutral-bg px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PaymentsToasts toasts={toasts} onDismiss={dismissToast} />

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
            Gestion de Pagos
          </h1>
          <p className="text-sm text-neutral-muted">
            Registra y supervisa las obligaciones financieras pendientes de la
            empresa.
          </p>
        </header>

        {loading ? (
          <PaymentsSkeleton />
        ) : (
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <NewPaymentCard
              paymentForm={paymentForm}
              onChange={setPaymentForm}
              error={error}
              saving={saving}
              canSave={!!canSavePayment}
              onSubmit={handleCreatePayment}
            />

            <PaymentsTable
              payments={payments}
              onMarkPaid={handleMarkPaid}
              onEdit={startEditing}
              onDelete={requestDelete}
            />
          </section>
        )}

        {editingPayment && (
          <EditPaymentModal
            editForm={editForm}
            onChange={setEditForm}
            saving={saving}
            onSubmit={handleUpdatePayment}
            onCancel={cancelEditing}
          />
        )}

        {deletingId !== null && (
          <DeleteConfirmDialog
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </div>
  );
}
