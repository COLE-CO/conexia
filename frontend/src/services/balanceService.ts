import api from './api';

export interface Balance {
  id: number;
  company_id: number;
  year: number;
  month?: number;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export const getBalancesByCompany = async (
  companyId: number
): Promise<Balance[]> => {
  const response = await api.get(`/balances/company/${companyId}`);
  return response.data;
};

export const getBalance = async (balanceId: number): Promise<Balance> => {
  const response = await api.get(`/balances/${balanceId}`);
  return response.data;
};

export const uploadBalance = async (
  companyId: number,
  year: number,
  month: number | undefined,
  file: File
): Promise<Balance> => {
  const formData = new FormData();
  formData.append('company_id', String(companyId));
  formData.append('year', String(year));
  if (month) formData.append('month', String(month));
  formData.append('file', file);

  const response = await api.post('/balances/upload', formData);
  return response.data;
};

export const deleteBalance = async (balanceId: number): Promise<void> => {
  await api.delete(`/balances/${balanceId}`);
};
