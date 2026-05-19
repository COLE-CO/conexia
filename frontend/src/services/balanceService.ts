import api from './api';

export interface Balance {
  id: number;
  company_id: number;
  original_filename: string;
  storage_key: string;
  file_type: string;
  year: number;
  month?: number;
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

export const downloadBalance = async (balanceId: number): Promise<void> => {
  const response = await api.get(`/balances/${balanceId}/download`);
  const downloadUrl = response.data.download_url;
  window.open(downloadUrl, '_blank');
};

export const viewBalance = async (balanceId: number): Promise<string> => {
  const response = await api.get(`/balances/${balanceId}/download`);
  return response.data.download_url;
};
