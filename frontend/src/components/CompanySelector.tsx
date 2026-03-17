import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { getCompanies } from '../services/companyService';
import type { Company } from '../services/companyService';
import { Building2, ChevronDown } from 'lucide-react';

export default function CompanySelector() {
  const { activeCompany, setActiveCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-surface border border-neutral-border hover:bg-neutral-bg transition-colors duration-200 cursor-pointer"
      >
        <Building2 size={16} className="text-secondary" />
        <span className="text-sm font-medium text-neutral-text">
          {activeCompany ? activeCompany.name : 'Seleccionar empresa'}
        </span>
        <ChevronDown size={14} className="text-neutral-muted" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-surface border border-neutral-border rounded-lg shadow-lg z-50">
          {companies.length === 0 ? (
            <p className="text-sm text-neutral-muted p-3">No hay empresas registradas</p>
          ) : (
            companies.map(company => (
              <button
                key={company.id}
                onClick={() => {
                  setActiveCompany(company);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg
                  ${activeCompany?.id === company.id
                    ? 'bg-primary text-white'
                    : 'text-neutral-text hover:bg-neutral-bg'}
                `}
              >
                {company.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}