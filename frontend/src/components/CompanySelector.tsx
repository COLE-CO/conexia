import { useEffect, useState, useRef } from 'react';
import { useCompany } from '../context/CompanyContext';
import { getCompanies } from '../services/companyService';
import type { Company } from '../services/companyService';
import { Building2, ChevronDown, Search, X } from 'lucide-react';

export default function CompanySelector() {
  const { activeCompany, setActiveCompany, clearActiveCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
       
      setSearch('');
    }
  }, [isOpen]);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-surface border border-neutral-border hover:bg-neutral-bg transition-colors duration-200 cursor-pointer min-w-[180px]"
      >
        <Building2 size={16} className="text-secondary flex-shrink-0" />
        <span className="text-sm font-medium text-neutral-text flex-1 text-left truncate">
          {activeCompany ? activeCompany.name : 'Todas las empresas'}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-muted transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-surface border border-neutral-border rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Buscador */}
            <div className="p-2 border-b border-neutral-border">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-bg border border-neutral-border focus-within:border-secondary transition-colors duration-200">
                <Search
                  size={14}
                  className="text-neutral-muted flex-shrink-0"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar empresa..."
                  className="flex-1 bg-transparent text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-neutral-muted hover:text-neutral-text"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-52 overflow-y-auto">
              {/* Todas las empresas */}
              <button
                onClick={() => {
                  clearActiveCompany();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors duration-200
                  ${!activeCompany ? 'bg-primary text-white' : 'text-neutral-text hover:bg-neutral-bg'}
                `}
              >
                <Building2
                  size={14}
                  className={
                    !activeCompany ? 'text-white' : 'text-neutral-muted'
                  }
                />
                <span className="font-medium">Todas las empresas</span>
              </button>

              <div className="border-t border-neutral-border" />

              {filtered.length === 0 ? (
                <p className="text-sm text-neutral-muted p-4 text-center">
                  No se encontraron empresas
                </p>
              ) : (
                filtered.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setActiveCompany(company);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors duration-200
                      ${
                        activeCompany?.id === company.id
                          ? 'bg-primary text-white'
                          : 'text-neutral-text hover:bg-neutral-bg'
                      }
                    `}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${activeCompany?.id === company.id ? 'bg-white/20 text-white' : 'bg-neutral-bg text-neutral-muted'}
                    `}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{company.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
