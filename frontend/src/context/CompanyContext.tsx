import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Company } from '../services/companyService';

interface CompanyContextType {
  activeCompany: Company | null;
  setActiveCompany: (company: Company) => void;
  clearActiveCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType>(
  {} as CompanyContextType
);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(
    () => {
      const saved = localStorage.getItem('activeCompany');
      return saved ? JSON.parse(saved) : null;
    }
  );

  const setActiveCompany = (company: Company) => {
    localStorage.setItem('activeCompany', JSON.stringify(company));
    setActiveCompanyState(company);
  };

  const clearActiveCompany = () => {
    localStorage.removeItem('activeCompany');
    setActiveCompanyState(null);
  };

  return (
    <CompanyContext.Provider
      value={{ activeCompany, setActiveCompany, clearActiveCompany }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCompany = () => useContext(CompanyContext);
