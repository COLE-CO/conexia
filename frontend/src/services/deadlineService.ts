import api from './api';

export type DeadlineStatus = 'pendiente' | 'cumplido';

export type DeadlineSource = 'manual' | 'calendar_dian_2026';

export type ObligationType =
  | 'retencion'
  | 'iva_bimestral'
  | 'iva_cuatrimestral'
  | 'anticipo_rst'
  | 'renta_pj'
  | 'exogena'
  | 'medios_magneticos'
  | 'supersociedades'
  | 'patrimonio'
  | 'ica_medellin'
  | 'ica_envigado'
  | 'ica_armenia'
  | 'ica_riohacha';

export interface Deadline {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  due_date: string;
  client_email?: string | null;
  amount?: string;
  reminder_sent_at?: string;
  status: DeadlineStatus;
  source: DeadlineSource;
  obligation_type?: ObligationType | null;
  period_label?: string | null;
  proof_filename?: string | null;
  proof_content_type?: string | null;
  proof_file_size?: number | null;
  proof_uploaded_at?: string | null;
}

export interface DeadlineProofDownload {
  url: string;
  filename: string;
}

export interface CreateDeadline {
  company_id: number;
  name: string;
  description?: string;
  due_date: string;
  client_email: string;
  amount?: string;
}

export interface UpdateDeadline {
  name?: string;
  description?: string;
  due_date?: string;
  client_email?: string;
  amount?: string;
}

export const getDeadlinesByCompany = async (
  companyId: number
): Promise<Deadline[]> => {
  const response = await api.get(`/deadlines/company/${companyId}`);
  return response.data;
};

export const createDeadline = async (
  data: CreateDeadline
): Promise<Deadline> => {
  const response = await api.post('/deadlines/', data);
  return response.data;
};

export const updateDeadline = async (
  id: number,
  data: UpdateDeadline
): Promise<Deadline> => {
  const response = await api.put(`/deadlines/${id}`, data);
  return response.data;
};

export const confirmDeadline = async (id: number): Promise<Deadline> => {
  const response = await api.patch(`/deadlines/${id}/confirm`);
  return response.data;
};

export const deleteDeadline = async (id: number): Promise<void> => {
  await api.delete(`/deadlines/${id}`);
};

export const uploadDeadlineProof = async (
  id: number,
  file: File
): Promise<Deadline> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/deadlines/${id}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDeadlineProofUrl = async (
  id: number
): Promise<DeadlineProofDownload> => {
  const response = await api.get(`/deadlines/${id}/proof`);
  return response.data;
};

export const deleteDeadlineProof = async (id: number): Promise<Deadline> => {
  const response = await api.delete(`/deadlines/${id}/proof`);
  return response.data;
};

export const regenerateDianCalendar = async (
  companyId: number
): Promise<{ created: number }> => {
  const response = await api.post(
    `/companies/${companyId}/regenerate-dian-calendar`
  );
  return response.data;
};

export const OBLIGATION_LABELS: Record<ObligationType, string> = {
  retencion: 'Retención en la fuente',
  iva_bimestral: 'IVA bimestral',
  iva_cuatrimestral: 'IVA cuatrimestral',
  anticipo_rst: 'Anticipo RST',
  renta_pj: 'Renta PJ',
  exogena: 'Exógena',
  medios_magneticos: 'Medios magnéticos',
  supersociedades: 'Supersociedades',
  patrimonio: 'Patrimonio',
  ica_medellin: 'ICA Medellín',
  ica_envigado: 'ICA Envigado',
  ica_armenia: 'ICA Armenia',
  ica_riohacha: 'ICA Riohacha',
};
