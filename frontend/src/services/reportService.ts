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

export interface GeneratePDFPayload {
  company_name: string;
  company_nit?: string;
  period: string;
  items: LineItem[];
  total_income: number;
  total_expenses: number;
  net_result: number;
  ai_summary: string;
}

export const generateReport = async (
  balanceId: number
): Promise<ReportData> => {
  const response = await api.post('/reports/generate', {
    balance_id: balanceId,
  });
  return response.data;
};

export const exportReportPDF = async (
  data: GeneratePDFPayload
): Promise<void> => {
  const response = await api.post('/reports/export-pdf', data, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `Reporte_${data.company_name}_${data.period}.pdf`.replace(/\s+/g, '_')
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
