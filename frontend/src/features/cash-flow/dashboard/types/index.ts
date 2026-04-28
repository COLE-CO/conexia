export type CashFlowPeriod =
  | 'mes_actual'
  | 'ultimos_30'
  | 'ultimos_90'
  | 'año_actual';

export interface CuentaResumen {
  id: string;
  nombre: string;
  descripcion?: string;
  saldo: number;
  ingresos: number;
  egresos: number;
  cierresPendientes: number;
}

export interface MovimientoResumen {
  id: string;
  concepto: string;
  descripcion?: string;
  cuenta: string;
  cuentaId: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
}

export interface CierreResumen {
  id: string;
  cuenta: string;
  cuentaId: string;
  periodo: string; // "Marzo 2026"
  mes: number;
  año: number;
  saldoInicial: number;
  ingresos: number;
  egresos: number;
  saldoCierre: number;
  estado: 'abierto' | 'cerrado';
  fechaCierre?: string;
}

export interface PuntoFlujo {
  fecha: string; // "01/03", "02/03", etc.
  ingresos: number;
  egresos: number;
  saldo: number;
}

export interface CashFlowDashboardMetrics {
  saldoTotalDisponible: number;
  ingresosPeriodo: number;
  egresosPeriodo: number;
  balanceNeto: number;
  cuentasActivas: number;
  cierresPendientes: number;
  cuentas: CuentaResumen[];
  movimientosRecientes: MovimientoResumen[];
  ultimosCierres: CierreResumen[];
  puntosFlujo: PuntoFlujo[];
  totalMovimientos: number;
}
