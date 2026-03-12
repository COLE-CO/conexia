import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { getCompanies } from '../services/companyService';
import type { Company } from '../services/companyService';
import { Building2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function CompanyGuard({ children }: Props) {
  const { activeCompany, setActiveCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <p className="text-neutral-muted animate-pulse">Cargando empresas...</p>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="bg-neutral-surface border border-neutral-border rounded-xl shadow-lg p-8 w-full max-w-md">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-secondary rounded-lg w-10 h-10 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-text font-hubot">
                Selecciona una empresa
              </h2>
              <p className="text-sm text-neutral-muted">
                Elige el cliente con el que vas a trabajar
              </p>
            </div>
          </div>

          {companies.length === 0 ? (
            <p className="text-sm text-neutral-muted text-center py-4">
              No hay empresas registradas en el sistema.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {companies.map(company => (
                <button
                  key={company.id}
                  onClick={() => setActiveCompany(company)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-neutral-border bg-neutral-bg hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200 text-sm font-medium text-neutral-text"
                >
                  {company.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}