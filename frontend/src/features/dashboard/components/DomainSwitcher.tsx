import { Briefcase, Building2 } from 'lucide-react';

import type { DashboardDomain } from '../types';

interface DomainSwitcherProps {
  activeDashboardDomain: DashboardDomain;
  onChange: (domain: DashboardDomain) => void;
}

export default function DomainSwitcher({
  activeDashboardDomain,
  onChange,
}: DomainSwitcherProps) {
  return (
    <div className="mb-6 inline-flex items-center gap-1 p-1 bg-neutral-surface border border-neutral-border rounded-xl">
      <button
        onClick={() => onChange('family_office')}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeDashboardDomain === 'family_office'
            ? 'bg-primary text-white shadow-sm'
            : 'text-neutral-muted hover:text-neutral-text'
        }`}
      >
        <Briefcase size={14} />
        Family Office
      </button>
      <button
        onClick={() => onChange('cole_co')}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeDashboardDomain === 'cole_co'
            ? 'bg-primary text-white shadow-sm'
            : 'text-neutral-muted hover:text-neutral-text'
        }`}
      >
        <Building2 size={14} />
        COLE-CO
      </button>
    </div>
  );
}
