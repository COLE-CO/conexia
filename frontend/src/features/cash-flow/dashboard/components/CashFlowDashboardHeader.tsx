import type { FC } from 'react';

interface CashFlowDashboardHeaderProps {
  currentDateText: string;
  fullName?: string;
  onIrAMovimientos: () => void;
}

const CashFlowDashboardHeader: FC<CashFlowDashboardHeaderProps> = ({
  currentDateText,
  onIrAMovimientos,
}) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-primary font-hubot tracking-tight">
          Dashboard COLE&CO
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Resumen de cuentas, movimientos y cierres del flujo de caja ·{' '}
          {currentDateText}
        </p>
      </div>

      <button
        onClick={onIrAMovimientos}
        className="flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Registrar movimiento
      </button>
    </div>
  );
};

export default CashFlowDashboardHeader;
