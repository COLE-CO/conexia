import api from './api';

export interface LineItem {
  concept: string;
  amount: number;
  category: 'ingreso' | 'gasto';
  subcategory: string;
}

export interface ReportData {
  company_name: string;
  period: string;
  items: LineItem[];
  total_income: number;
  total_expenses: number;
  net_result: number;
  ai_summary: string;
}

export interface SaveReportRequest {
  company_id: number;
  balance_id?: number;
  company_name: string;
  company_nit?: string;
  period: string;
  ai_summary: string;
  total_income: number;
  total_expenses: number;
  net_result: number;
  items: LineItem[];
}

export interface SavedReport {
  id: number;
  company_id: number;
  balance_id: number | null;
  company_name: string;
  period: string;
  ai_summary: string;
  total_income: number;
  total_expenses: number;
  net_result: number;
  storage_key: string;
  pdf_filename: string;
  created_at: string;
}

export interface ExportPDFRequest {
  company_name: string;
  company_nit?: string;
  period: string;
  items: LineItem[];
  total_income: number;
  total_expenses: number;
  net_result: number;
  ai_summary: string;
}

export async function generateReport(balanceId: number): Promise<ReportData> {
  const { data } = await api.post<ReportData>('/reports/generate', {
    balance_id: balanceId,
  });
  return data;
}

export async function exportReportPDF(payload: ExportPDFRequest): Promise<void> {
  const response = await api.post('/reports/export-pdf', payload, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;

  const disposition = response.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename=(.+)/);
  link.download = match ? match[1] : 'reporte.pdf';

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function saveReport(payload: SaveReportRequest): Promise<SavedReport> {
  const { data } = await api.post<SavedReport>('/reports/save', payload);
  return data;
}

export async function getSavedReportsByCompany(
  companyId: number
): Promise<SavedReport[]> {
  const { data } = await api.get<SavedReport[]>(`/reports/company/${companyId}`);
  return data;
}

export async function downloadSavedReport(reportId: number): Promise<void> {
  const { data } = await api.get<{ url: string }>(`/reports/${reportId}/download`);
  window.open(data.url, '_blank');
}

export async function deleteSavedReport(reportId: number): Promise<void> {
  await api.delete(`/reports/${reportId}`);
}

export async function getAllSavedReports(): Promise<SavedReport[]> {
  const { data } = await api.get<SavedReport[]>('/reports/all');
  return data;
}
