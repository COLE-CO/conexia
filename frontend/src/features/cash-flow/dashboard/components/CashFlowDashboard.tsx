import type { FC } from 'react';
import { useCashFlowData } from '../hooks/useCashFlowData';
import { useCashFlowDashboard } from '../hooks/useCashFlowDashboard';
import CashFlowDashboardHeader from './CashFlowDashboardHeader';
import CashFlowMetricsGrid from './CashFlowMetricsGrid';
import CashFlowChartsRow from './CashFlowChartsRow';
import CashFlowAccountsGrid from './CashFlowAccountsGrid';
import CashFlowActivityPanel from './CashFlowActivityPanel';

interface CashFlowDashboardProps {
  currentDateText: string;
  fullName?: string;
  onIrAMovimientos: () => void;
  onIrACierres: () => void;
  onVerCuenta?: (cuentaId: string) => void;
}

/**
 * CashFlowDashboard
 *
 * Dashboard principal del módulo Flujo de Caja. Orquesta el fetch de datos,
 * el cálculo de métricas y la renderización de todos los sub-componentes.
 *
 * Estructura de la página:
 * 1. Header con saludo y acceso rápido a "Registrar movimiento"
 * 2. Tarjetas de métricas clave (saldo, ingresos, egresos, balance)
 * 3. Fila de gráficos (flujo de caja en el tiempo + distribución por cuenta)
 * 4. Saldos por cuenta (grid de tarjetas individuales)
 * 5. Panel de actividad: movimientos recientes + estado de cierres
 */
const CashFlowDashboard: FC<CashFlowDashboardProps> = ({
  currentDateText,
  fullName,
  onIrAMovimientos,
  onIrACierres,
  onVerCuenta,
}) => {
  // TODO: Conectar periodo con un selector de período cuando sea necesario
  const periodo = 'mes_actual';

  const { cuentas, movimientos, cierres, loading } = useCashFlowData(periodo);
  const metrics = useCashFlowDashboard(cuentas, movimientos, cierres);

  return (
    <>
      <CashFlowDashboardHeader
        currentDateText={currentDateText}
        fullName={fullName}
        onIrAMovimientos={onIrAMovimientos}
      />

      <CashFlowMetricsGrid metrics={metrics} loading={loading} />

      <CashFlowChartsRow metrics={metrics} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <CashFlowAccountsGrid
          cuentas={metrics.cuentas}
          loading={loading}
          onVerCuenta={onVerCuenta}
        />

        <CashFlowActivityPanel
          movimientosRecientes={metrics.movimientosRecientes}
          ultimosCierres={metrics.ultimosCierres}
          loading={loading}
          onVerTodos={onIrAMovimientos}
          onIrACierres={onIrACierres}
        />
      </div>
    </>
  );
};

export default CashFlowDashboard;
