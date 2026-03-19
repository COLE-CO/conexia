import api from './api';

export interface Company {
  id: number;
  name: string;
  nit?: string;
  logo_url?: string;
}

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/companies');
  return response.data;
};

export const getCompany = async (id: number): Promise<Company> => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (
  data: Omit<Company, 'id'>
): Promise<Company> => {
  const response = await api.post('/companies', data);
  return response.data;
};

export const updateCompany = async (
  id: number,
  data: Partial<Company>
): Promise<Company> => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/companies/${id}`);
};
