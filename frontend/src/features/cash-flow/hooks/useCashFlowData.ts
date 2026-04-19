import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import {
  createCashAccount,
  createCashMovement,
  getCashAccounts,
  getCashMovements,
} from '../../../services/cashFlowService';
import type {
  CashAccount,
  CashMovement,
  CashMovementType,
} from '../../../services/cashFlowService';
import {
  initialFiltersState,
  initialAccountForm,
  initialMovementForm,
  type AccountFormState,
  type CashFlowPeriodSummary,
  type CashFlowFiltersState,
  type MovementFormState,
} from '../types';

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

const sortMovements = (items: CashMovement[]) => {
  return [...items].sort((a, b) => {
    const first = new Date(a.movement_date).getTime();
    const second = new Date(b.movement_date).getTime();

    if (first === second) {
      return b.id - a.id;
    }

    return second - first;
  });
};

export function useCashFlowData() {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const [movementForm, setMovementForm] =
    useState<MovementFormState>(initialMovementForm);
  const [accountForm, setAccountForm] =
    useState<AccountFormState>(initialAccountForm);

  const [movementError, setMovementError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [movementSaving, setMovementSaving] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [filters, setFilters] =
    useState<CashFlowFiltersState>(initialFiltersState);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
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
        const [fetchedAccounts, fetchedMovements] = await Promise.all([
          getCashAccounts(),
          getCashMovements(),
        ]);

        if (!cancelled) {
          setAccounts(fetchedAccounts);
          setMovements(sortMovements(fetchedMovements));
        }
      } catch {
        if (!cancelled) {
          setMovementError(
            'No fue posible cargar la información del flujo de caja.'
          );
          showToast('error', 'No fue posible cargar flujo de caja.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, account) => {
      return acc + Number(account.current_balance);
    }, 0);
  }, [accounts]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 180);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [filters.search]);

  const movementsInPeriod = useMemo(() => {
    if (filters.periodDays === 'all') return movements;

    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - filters.periodDays);

    return movements.filter((movement) => {
      const movementDate = new Date(movement.movement_date);
      return movementDate >= threshold;
    });
  }, [movements, filters.periodDays]);

  const periodSummary = useMemo<CashFlowPeriodSummary>(() => {
    return movementsInPeriod.reduce(
      (acc, movement) => {
        const amount = Number(movement.amount);
        if (movement.movement_type === 'ingreso') {
          acc.incomes += amount;
        } else {
          acc.expenses += amount;
        }
        acc.net = acc.incomes - acc.expenses;
        return acc;
      },
      { incomes: 0, expenses: 0, net: 0 }
    );
  }, [movementsInPeriod]);

  const filteredMovements = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return movementsInPeriod.filter((movement) => {
      const matchType =
        filters.type === 'all' || movement.movement_type === filters.type;

      const matchAccount =
        filters.accountId === 'all' ||
        String(movement.account_id) === filters.accountId;

      const matchSearch =
        normalizedSearch.length === 0 ||
        movement.concept.toLowerCase().includes(normalizedSearch) ||
        movement.description.toLowerCase().includes(normalizedSearch);

      return matchType && matchAccount && matchSearch;
    });
  }, [movementsInPeriod, filters, debouncedSearch]);

  const canSaveMovement =
    movementForm.concept.trim() &&
    movementForm.description.trim() &&
    movementForm.amount &&
    Number(movementForm.amount) > 0 &&
    movementForm.movement_date &&
    movementForm.movement_type &&
    movementForm.account_id;

  const canSaveAccount =
    accountForm.name.trim() &&
    accountForm.initial_balance &&
    Number(accountForm.initial_balance) >= 0;

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSaveAccount) {
      setAccountError('Completa nombre y saldo inicial para crear la cuenta.');
      return;
    }

    setAccountError(null);
    setAccountSaving(true);

    try {
      const created = await createCashAccount({
        name: accountForm.name.trim(),
        description: accountForm.description.trim() || undefined,
        initial_balance: Number(accountForm.initial_balance),
      });

      setAccounts((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setAccountForm(initialAccountForm);

      if (!movementForm.account_id) {
        setMovementForm((prev) => ({
          ...prev,
          account_id: String(created.id),
        }));
      }
      showToast('success', `Cuenta ${created.name} creada correctamente.`);
    } catch (error: unknown) {
      const detail = getApiDetail(error);
      setAccountError(detail || 'No se pudo crear la cuenta.');
      showToast('error', detail || 'No se pudo crear la cuenta.');
    } finally {
      setAccountSaving(false);
    }
  };

  const handleCreateMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSaveMovement) {
      setMovementError(
        'Completa todos los campos obligatorios del movimiento.'
      );
      return;
    }

    setMovementError(null);
    setMovementSaving(true);

    try {
      const created = await createCashMovement({
        concept: movementForm.concept.trim(),
        description: movementForm.description.trim(),
        amount: Number(movementForm.amount),
        movement_date: movementForm.movement_date,
        movement_type: movementForm.movement_type,
        account_id: Number(movementForm.account_id),
      });

      setMovements((prev) => sortMovements([created, ...prev]));
      const refreshedAccounts = await getCashAccounts();
      setAccounts(refreshedAccounts);
      setMovementForm((prev) => ({
        ...initialMovementForm,
        movement_type: prev.movement_type as CashMovementType,
      }));
      showToast('success', `Movimiento registrado en ${created.account_name}.`);
    } catch (error: unknown) {
      const detail = getApiDetail(error);
      setMovementError(detail || 'No se pudo registrar el movimiento.');
      showToast('error', detail || 'No se pudo registrar el movimiento.');
    } finally {
      setMovementSaving(false);
    }
  };

  return {
    accounts,
    movements: filteredMovements,
    rawMovements: movements,
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
    periodSummary,
    toasts,
    dismissToast,
    handleCreateAccount,
    handleCreateMovement,
  };
}
