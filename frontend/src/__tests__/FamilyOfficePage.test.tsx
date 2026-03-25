import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import FamilyOfficePage from '../pages/FamilyOfficePage';
import {
  getBalancesByCompany,
  deleteBalance,
} from '../services/balanceService';
import { getCompanies } from '../services/companyService';
import { getDeadlinesByCompany } from '../services/deadlineService';

const setActiveCompanyMock = vi.fn();
const clearActiveCompanyMock = vi.fn();

vi.mock('../services/companyService', () => ({
  getCompanies: vi.fn(),
}));

vi.mock('../services/balanceService', () => ({
  getBalancesByCompany: vi.fn(),
  deleteBalance: vi.fn(),
}));

vi.mock('../services/deadlineService', () => ({
  getDeadlinesByCompany: vi.fn(),
  confirmDeadline: vi.fn(),
  deleteDeadline: vi.fn(),
}));

vi.mock('../context/CompanyContext', () => ({
  useCompany: () => ({
    activeCompany: activeCompanyState,
    setActiveCompany: setActiveCompanyMock,
    clearActiveCompany: clearActiveCompanyMock,
  }),
}));

const getCompaniesMock = vi.mocked(getCompanies);
const getBalancesByCompanyMock = vi.mocked(getBalancesByCompany);
const deleteBalanceMock = vi.mocked(deleteBalance);
const getDeadlinesByCompanyMock = vi.mocked(getDeadlinesByCompany);

let activeCompanyState: {
  id: number;
  name: string;
  nit?: string;
  logo_url?: string;
} | null;

function renderPage() {
  render(
    <MemoryRouter>
      <FamilyOfficePage />
    </MemoryRouter>
  );
}

function getDeleteButtonForBalance(fileName: string) {
  const title = screen.getByText(fileName);
  const card = title.closest('div[class*="rounded-2xl"]');

  if (!card) {
    throw new Error(`No se encontró la tarjeta del balance ${fileName}`);
  }

  const buttons = card.querySelectorAll('button');
  const deleteButton = buttons[buttons.length - 1];

  if (!deleteButton) {
    throw new Error(`No se encontró el botón de eliminar para ${fileName}`);
  }

  return deleteButton as HTMLButtonElement;
}

describe('FamilyOfficePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeCompanyState = { id: 1, name: 'ABC S.A.', nit: '900123' };
    getCompaniesMock.mockResolvedValue([
      { id: 1, name: 'ABC S.A.', nit: '900123' },
      { id: 2, name: 'XYZ S.A.S.', nit: '900456' },
    ]);
    getBalancesByCompanyMock.mockResolvedValue([
      {
        id: 10,
        company_id: 1,
        year: 2026,
        month: 3,
        file_name: 'balance-marzo.xlsx',
        file_url: '/balances/10',
        uploaded_at: '2026-03-20T10:00:00.000Z',
      },
    ]);
    getDeadlinesByCompanyMock.mockResolvedValue([]);
  });

  it('muestra la empresa activa y permite cambiarla desde el selector', async () => {
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByText('ABC S.A.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /abc s.a./i }));
    await user.click(screen.getByRole('button', { name: /xyz s.a.s./i }));

    expect(setActiveCompanyMock).toHaveBeenCalledWith({
      id: 2,
      name: 'XYZ S.A.S.',
      nit: '900456',
    });
  });

  it('solicita confirmacion antes de eliminar un balance y lo elimina al confirmar', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );

    renderPage();

    expect(await screen.findByText('balance-marzo.xlsx')).toBeInTheDocument();

    await user.click(getDeleteButtonForBalance('balance-marzo.xlsx'));

    await waitFor(() => {
      expect(deleteBalanceMock).toHaveBeenCalledWith(10);
    });

    expect(screen.queryByText('balance-marzo.xlsx')).not.toBeInTheDocument();
  });

  it('conserva el balance cuando el usuario cancela la eliminacion', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false)
    );

    renderPage();

    expect(await screen.findByText('balance-marzo.xlsx')).toBeInTheDocument();

    await user.click(getDeleteButtonForBalance('balance-marzo.xlsx'));

    expect(deleteBalanceMock).not.toHaveBeenCalled();
    expect(screen.getByText('balance-marzo.xlsx')).toBeInTheDocument();
  });
});
