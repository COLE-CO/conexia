import { useEffect, useState } from 'react';

import { getCompanies } from '../../../services/companyService';
import { getDeadlinesByCompany } from '../../../services/deadlineService';
import type { DeadlineWithCompany } from '../types';

export function useDashboardData(canSeeFamilyOfficeDashboard: boolean) {
  const [deadlines, setDeadlines] = useState<DeadlineWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!canSeeFamilyOfficeDashboard) {
        setDeadlines([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const companies = await getCompanies();
        const deadlinesByCompany = await Promise.all(
          companies.map(async (company) => {
            const companyDeadlines = await getDeadlinesByCompany(company.id);
            return companyDeadlines.map((deadline) => ({
              ...deadline,
              companyName: company.name,
            }));
          })
        );

        if (!cancelled) setDeadlines(deadlinesByCompany.flat());
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el resumen operativo.');
          setDeadlines([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [canSeeFamilyOfficeDashboard]);

  return { deadlines, loading, error };
}
