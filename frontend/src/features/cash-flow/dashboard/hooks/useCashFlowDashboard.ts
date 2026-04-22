import { useMemo } from 'react';
import type {
  CierreResumen,
  CuentaResumen,
  MovimientoResumen,
  CashFlowDashboardMetrics,
  PuntoFlujo,
} from '../types';

/**
 * useCashFlowDashboard
 *
 * Deriva todas las métricas del dashboard a partir de los datos crudos
 * de cuentas, movimientos y cierres. Sin efectos secundarios, puro cálculo.
 */
export function useCashFlowDashboard(
  cuentas: CuentaResumen[],
  movimientos: MovimientoResumen[],
  cierres: CierreResumen[]
): CashFlowDashboardMetrics {
  return useMemo(() => {
    const saldoTotalDisponible = cuentas.reduce((sum, c) => sum + c.saldo, 0);

    const ingresosPeriodo = movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);

    const egresosPeriodo = movimientos
      .filter((m) => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);

    const balanceNeto = ingresosPeriodo - egresosPeriodo;

    const cuentasActivas = cuentas.length;

    const cierresPendientes = cierres.filter(
      (c) => c.estado === 'abierto'
    ).length;

    // Últimos 5 movimientos ordenados por fecha descendente
    const movimientosRecientes = [...movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);

    // Últimos cierres por cuenta (el más reciente de cada cuenta)
    const ultimosCierresPorCuenta = new Map<string, CierreResumen>();
    for (const cierre of cierres) {
      const existing = ultimosCierresPorCuenta.get(cierre.cuentaId);
      if (
        !existing ||
        cierre.año > existing.año ||
        (cierre.año === existing.año && cierre.mes > existing.mes)
      ) {
        ultimosCierresPorCuenta.set(cierre.cuentaId, cierre);
      }
    }
    const ultimosCierres = Array.from(ultimosCierresPorCuenta.values());

    // Puntos de flujo: agrupa movimientos por fecha para el gráfico de línea
    const puntosPorFecha = new Map<string, PuntoFlujo>();
    const sortedMovimientos = [...movimientos].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    let saldoAcumulado = saldoTotalDisponible;
    // Calculamos saldo base yendo hacia atrás
    for (const m of movimientos) {
      if (m.tipo === 'ingreso') saldoAcumulado -= m.monto;
      else saldoAcumulado += m.monto;
    }

    for (const mov of sortedMovimientos) {
      const fecha = new Date(mov.fecha);
      const key = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!puntosPorFecha.has(key)) {
        puntosPorFecha.set(key, {
          fecha: key,
          ingresos: 0,
          egresos: 0,
          saldo: saldoAcumulado,
        });
      }

      const punto = puntosPorFecha.get(key)!;
      if (mov.tipo === 'ingreso') {
        punto.ingresos += mov.monto;
        saldoAcumulado += mov.monto;
      } else {
        punto.egresos += mov.monto;
        saldoAcumulado -= mov.monto;
      }
      punto.saldo = saldoAcumulado;
    }

    const puntosFlujo = Array.from(puntosPorFecha.values());

    return {
      saldoTotalDisponible,
      ingresosPeriodo,
      egresosPeriodo,
      balanceNeto,
      cuentasActivas,
      cierresPendientes,
      cuentas,
      movimientosRecientes,
      ultimosCierres,
      puntosFlujo,
      totalMovimientos: movimientos.length,
    };
  }, [cuentas, movimientos, cierres]);
}
