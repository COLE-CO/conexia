import { useEffect, useState } from 'react';
import type { CierreResumen, CuentaResumen, MovimientoResumen } from '../types';

interface CashFlowRawData {
  cuentas: CuentaResumen[];
  movimientos: MovimientoResumen[];
  cierres: CierreResumen[];
  loading: boolean;
  error: string | null;
}

/**
 * useCashFlowData
 *
 * Centraliza el fetch de cuentas, movimientos y cierres del módulo de
 * Flujo de Caja. Reemplaza las llamadas directas a la API con los
 * hooks/servicios existentes en el módulo cash-flow.
 *
 * TODO: Conectar con los servicios reales del módulo cash-flow.
 * Por ahora retorna datos de ejemplo para validar la UI.
 */
export function useCashFlowData(periodo: string): CashFlowRawData {
  const [data, setData] = useState<CashFlowRawData>({
    cuentas: [],
    movimientos: [],
    cierres: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // TODO: Reemplazar con llamadas reales a los servicios de cash-flow
    // Ejemplo:
    //   const cuentas = await cashFlowService.getCuentas();
    //   const movimientos = await cashFlowService.getMovimientos({ periodo });
    //   const cierres = await cashFlowService.getCierres();

    const timer = setTimeout(() => {
      setData({
        cuentas: [
          {
            id: '1',
            nombre: 'Banco Bogotá',
            descripcion: 'cuenta prueba',
            saldo: 23000000,
            ingresos: 5000000,
            egresos: 1000000,
            cierresPendientes: 1,
          },
          {
            id: '2',
            nombre: 'Bancolombia',
            descripcion: 'Cuenta Bancolombia',
            saldo: 19750000,
            ingresos: 8000000,
            egresos: 3000000,
            cierresPendientes: 0,
          },
          {
            id: '3',
            nombre: 'Bancolombia Auxiliar',
            descripcion: 'Cuenta Secundaria Bancolombia',
            saldo: 12600000,
            ingresos: 2000000,
            egresos: 500000,
            cierresPendientes: 1,
          },
          {
            id: '4',
            nombre: 'Bancolombia Corriente',
            descripcion: 'Cuenta corriente de Bancolombia',
            saldo: 14800000,
            ingresos: 4000000,
            egresos: 1500000,
            cierresPendientes: 0,
          },
        ],
        movimientos: [
          {
            id: '1',
            concepto: 'Factura Messi',
            descripcion: 'Mejor jugador',
            cuenta: 'Banco Bogotá',
            cuentaId: '1',
            fecha: '2026-05-19',
            tipo: 'egreso',
            monto: 1000000,
          },
          {
            id: '2',
            concepto: 'Probando Pago Lejano',
            descripcion: 'Pago de prueba',
            cuenta: 'Bancolombia',
            cuentaId: '2',
            fecha: '2026-04-16',
            tipo: 'egreso',
            monto: 100000,
          },
          {
            id: '3',
            concepto: 'Ingreso cliente ABC',
            descripcion: 'Pago mensual de servicios',
            cuenta: 'Bancolombia',
            cuentaId: '2',
            fecha: '2026-04-10',
            tipo: 'ingreso',
            monto: 8000000,
          },
          {
            id: '4',
            concepto: 'Transferencia interna',
            descripcion: 'Traslado entre cuentas',
            cuenta: 'Bancolombia Corriente',
            cuentaId: '4',
            fecha: '2026-04-05',
            tipo: 'ingreso',
            monto: 4000000,
          },
          {
            id: '5',
            concepto: 'Pago nómina marzo',
            descripcion: 'Nómina mensual empleados',
            cuenta: 'Banco Bogotá',
            cuentaId: '1',
            fecha: '2026-03-31',
            tipo: 'egreso',
            monto: 500000,
          },
        ],
        cierres: [
          {
            id: '1',
            cuenta: 'Banco Bogotá',
            cuentaId: '1',
            periodo: 'Marzo 2026',
            mes: 3,
            año: 2026,
            saldoInicial: 17000000,
            ingresos: 10000000,
            egresos: 0,
            saldoCierre: 27000000,
            estado: 'abierto',
          },
          {
            id: '2',
            cuenta: 'Banco Bogotá',
            cuentaId: '1',
            periodo: 'Febrero 2026',
            mes: 2,
            año: 2026,
            saldoInicial: 20000000,
            ingresos: 0,
            egresos: 3000000,
            saldoCierre: 17000000,
            estado: 'cerrado',
            fechaCierre: '14 de abr de 2026',
          },
          {
            id: '3',
            cuenta: 'Bancolombia Auxiliar',
            cuentaId: '3',
            periodo: 'Marzo 2026',
            mes: 3,
            año: 2026,
            saldoInicial: 11000000,
            ingresos: 2000000,
            egresos: 400000,
            saldoCierre: 12600000,
            estado: 'abierto',
          },
        ],
        loading: false,
        error: null,
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [periodo]);

  return data;
}
