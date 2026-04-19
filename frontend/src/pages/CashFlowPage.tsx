import { useState } from 'react';

import CashFlowSkeleton from '../features/cash-flow/components/CashFlowSkeleton';
import CashFlowSummary from '../features/cash-flow/components/CashFlowSummary';
import CashFlowToasts from '../features/cash-flow/components/CashFlowToasts';
import MonthlyClosingPanel from '../features/cash-flow/components/MonthlyClosingPanel';
import MovementsTimeline from '../features/cash-flow/components/MovementsTimeline';
import NewAccountCard from '../features/cash-flow/components/NewAccountCard';
import NewMovementCard from '../features/cash-flow/components/NewMovementCard';
import { useCashFlowData } from '../features/cash-flow/hooks/useCashFlowData';
import { useMonthlyClosing } from '../features/cash-flow/hooks/useMonthlyClosing';

type ActiveTab = 'movements' | 'monthly';

export default function CashFlowPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('movements');

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

  const monthlyClosing = useMonthlyClosing({ accounts });

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

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Secciones del flujo de caja"
          className="inline-flex rounded-xl border border-neutral-border bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'movements'}
            onClick={() => setActiveTab('movements')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'movements'
                ? 'bg-primary text-white'
                : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Movimientos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'monthly'}
            onClick={() => setActiveTab('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'monthly'
                ? 'bg-primary text-white'
                : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Cierre Mensual
          </button>
        </div>

        {loading ? (
          <CashFlowSkeleton />
        ) : activeTab === 'movements' ? (
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
        ) : (
          <MonthlyClosingPanel
            accounts={accounts}
            selectedAccountId={monthlyClosing.selectedAccountId}
            setSelectedAccountId={monthlyClosing.setSelectedAccountId}
            year={monthlyClosing.year}
            setYear={monthlyClosing.setYear}
            month={monthlyClosing.month}
            setMonth={monthlyClosing.setMonth}
            summary={monthlyClosing.summary}
            closings={monthlyClosing.closings}
            loading={monthlyClosing.loading}
            closing={monthlyClosing.closing}
            error={monthlyClosing.error}
            onCloseMonth={monthlyClosing.handleCloseMonth}
          />
        )}
      </div>
    </div>
  );
}
