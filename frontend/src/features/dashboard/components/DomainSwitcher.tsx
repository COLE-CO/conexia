import type { FC } from 'react';
import type { DashboardDomain } from '../types';

interface DomainSwitcherProps {
  activeDashboardDomain: DashboardDomain;
  onChange: (domain: DashboardDomain) => void;
}

const DOMINIOS: {
  id: DashboardDomain;
  label: string;
  icono: React.ReactNode;
}[] = [
  {
    id: 'family_office',
    label: 'Family Office',
    icono: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: 'cole_co',
    label: 'Cole & Co',
    icono: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
];

const DomainSwitcher: FC<DomainSwitcherProps> = ({
  activeDashboardDomain,
  onChange,
}) => {
  return (
    <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-xl w-fit">
      {DOMINIOS.map((dominio) => {
        const activo = activeDashboardDomain === dominio.id;
        return (
          <button
            key={dominio.id}
            onClick={() => onChange(dominio.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activo
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {dominio.icono}
            {dominio.label}
          </button>
        );
      })}
    </div>
  );
};

export default DomainSwitcher;
