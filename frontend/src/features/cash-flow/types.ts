import type { CashMovementType } from '../../services/cashFlowService';

export type CashFlowFilterType = 'all' | CashMovementType;
export type CashFlowPeriodDays = 7 | 30 | 90 | 'all';

export interface CashFlowFiltersState {
  search: string;
  type: CashFlowFilterType;
  accountId: string;
  periodDays: CashFlowPeriodDays;
}

export interface CashFlowPeriodSummary {
  incomes: number;
  expenses: number;
  net: number;
}

export interface MovementFormState {
  concept: string;
  description: string;
  amount: string;
  movement_date: string;
  movement_type: CashMovementType;
  account_id: string;
}

export interface AccountFormState {
  name: string;
  description: string;
  initial_balance: string;
}

export const initialFiltersState: CashFlowFiltersState = {
  search: '',
  type: 'all',
  accountId: 'all',
  periodDays: 30,
};

export const initialMovementForm: MovementFormState = {
  concept: '',
  description: '',
  amount: '',
  movement_date: '',
  movement_type: 'ingreso',
  account_id: '',
};

export const initialAccountForm: AccountFormState = {
  name: '',
  description: '',
  initial_balance: '',
};

export const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
