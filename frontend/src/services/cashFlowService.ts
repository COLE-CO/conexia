import api from './api';

export type CashMovementType = 'ingreso' | 'egreso';

export interface CashAccount {
  id: number;
  name: string;
  description?: string;
  current_balance: string;
  created_at: string;
}

export interface CreateCashAccountPayload {
  name: string;
  description?: string;
  initial_balance: number;
}

export interface CashMovement {
  id: number;
  concept: string;
  description: string;
  amount: string;
  movement_date: string;
  movement_type: CashMovementType;
  account_id: number;
  account_name: string;
  created_at: string;
}

export interface CreateCashMovementPayload {
  concept: string;
  description: string;
  amount: number;
  movement_date: string;
  movement_type: CashMovementType;
  account_id: number;
}

export const getCashAccounts = async (): Promise<CashAccount[]> => {
  const response = await api.get('/cash-flow/accounts');
  return response.data;
};

export const createCashAccount = async (
  payload: CreateCashAccountPayload
): Promise<CashAccount> => {
  const response = await api.post('/cash-flow/accounts', payload);
  return response.data;
};

export const getCashMovements = async (): Promise<CashMovement[]> => {
  const response = await api.get('/cash-flow/movements');
  return response.data;
};

export const createCashMovement = async (
  payload: CreateCashMovementPayload
): Promise<CashMovement> => {
  const response = await api.post('/cash-flow/movements', payload);
  return response.data;
};

export interface MonthlySummary {
  account_id: number;
  account_name: string;
  year: number;
  month: number;
  opening_balance: string;
  total_income: string;
  total_expenses: string;
  closing_balance: string;
  is_closed: boolean;
  closed_at: string | null;
}

export interface MonthlyClosing {
  id: number;
  account_id: number;
  year: number;
  month: number;
  opening_balance: string;
  total_income: string;
  total_expenses: string;
  closing_balance: string;
  is_closed: boolean;
  closed_at: string | null;
  created_at: string;
}

export const getMonthlySummary = async (
  accountId: number,
  year: number,
  month: number
): Promise<MonthlySummary> => {
  const response = await api.get('/cash-flow/monthly-summary', {
    params: { account_id: accountId, year, month },
  });
  return response.data;
};

export const closeMonth = async (
  accountId: number,
  year: number,
  month: number
): Promise<MonthlyClosing> => {
  const response = await api.post('/cash-flow/monthly-close', {
    account_id: accountId,
    year,
    month,
  });
  return response.data;
};

export const getMonthlyClosings = async (
  accountId: number
): Promise<MonthlyClosing[]> => {
  const response = await api.get('/cash-flow/monthly-closings', {
    params: { account_id: accountId },
  });
  return response.data;
};
