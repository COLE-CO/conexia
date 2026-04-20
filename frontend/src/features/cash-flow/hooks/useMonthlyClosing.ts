import { useCallback, useEffect, useState } from 'react';

import {
  closeMonth,
  getMonthlyClosings,
  getMonthlySummary,
} from '../../../services/cashFlowService';
import type {
  CashAccount,
  MonthlyClosing,
  MonthlySummary,
} from '../../../services/cashFlowService';

const getDefaultPeriod = () => {
  const now = new Date();
  const prevMonth = now.getMonth(); // 0-based, so current month - 1
  const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = prevMonth === 0 ? 12 : prevMonth;
  return { year, month };
};

interface UseMonthlyClosingParams {
  accounts: CashAccount[];
}

export const useMonthlyClosing = ({ accounts }: UseMonthlyClosingParams) => {
  const defaults = getDefaultPeriod();

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [year, setYear] = useState(defaults.year);
  const [month, setMonth] = useState(defaults.month);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(String(accounts[0].id));
    }
  }, [accounts, selectedAccountId]);

  const fetchSummary = useCallback(async () => {
    const accountId = Number(selectedAccountId);
    if (!accountId || !year || !month) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getMonthlySummary(accountId, year, month);
      setSummary(data);
    } catch {
      setError('No se pudo cargar el resumen mensual.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, year, month]);

  const fetchClosings = useCallback(async () => {
    const accountId = Number(selectedAccountId);
    if (!accountId) return;

    try {
      const data = await getMonthlyClosings(accountId);
      setClosings(data);
    } catch {
      setClosings([]);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchClosings();
  }, [fetchClosings]);

  const handleCloseMonth = useCallback(async () => {
    const accountId = Number(selectedAccountId);
    if (!accountId) return;

    setClosing(true);
    setError(null);
    try {
      await closeMonth(accountId, year, month);
      await fetchSummary();
      await fetchClosings();
    } catch (err: unknown) {
      const detail =
        err instanceof Object && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      setError(detail ?? 'No se pudo cerrar el mes.');
    } finally {
      setClosing(false);
    }
  }, [selectedAccountId, year, month, fetchSummary, fetchClosings]);

  return {
    selectedAccountId,
    setSelectedAccountId,
    year,
    setYear,
    month,
    setMonth,
    summary,
    closings,
    loading,
    closing,
    error,
    handleCloseMonth,
  };
};
