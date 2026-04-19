import CashFlowSkeleton from '../features/cash-flow/components/CashFlowSkeleton';
import CashFlowSummary from '../features/cash-flow/components/CashFlowSummary';
import CashFlowToasts from '../features/cash-flow/components/CashFlowToasts';
import MovementsTimeline from '../features/cash-flow/components/MovementsTimeline';
import NewAccountCard from '../features/cash-flow/components/NewAccountCard';
import NewMovementCard from '../features/cash-flow/components/NewMovementCard';
import { useCashFlowData } from '../features/cash-flow/hooks/useCashFlowData';

export default function CashFlowPage() {
  const {
    accounts,
    movements,
    rawMovements,
    loading,
    movementForm,
    setMovementForm,
    accountForm,
    setAccountForm,
    movementError,
    accountError,
    movementSaving,
    accountSaving,
    canSaveMovement,
    canSaveAccount,
    totalBalance,
    filters,
    setFilters,
    toasts,
    dismissToast,
    handleCreateAccount,
    handleCreateMovement,
  } = useCashFlowData();

  return (
    <div className="min-h-screen bg-neutral-bg px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <CashFlowToasts toasts={toasts} onDismiss={dismissToast} />

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
            Flujo de Caja
          </h1>
          <p className="text-sm text-neutral-muted">
            Registra ingresos y egresos por cuenta para mantener el control
            diario del efectivo.
          </p>
        </header>

        {loading ? (
          <CashFlowSkeleton />
        ) : (
          <>
            <CashFlowSummary accounts={accounts} totalBalance={totalBalance} />

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <NewAccountCard
                accountForm={accountForm}
                onChange={setAccountForm}
                accountError={accountError}
                accountSaving={accountSaving}
                canSaveAccount={!!canSaveAccount}
                onSubmit={handleCreateAccount}
              />

              <NewMovementCard
                movementForm={movementForm}
                onChange={setMovementForm}
                accounts={accounts}
                movementError={movementError}
                movementSaving={movementSaving}
                canSaveMovement={!!canSaveMovement}
                onSubmit={handleCreateMovement}
              />
            </section>

            <MovementsTimeline
              movements={movements}
              accounts={accounts}
              filters={filters}
              onFiltersChange={setFilters}
              totalMovements={rawMovements.length}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}
