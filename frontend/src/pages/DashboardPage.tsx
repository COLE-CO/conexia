import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useNavigate } from 'react-router-dom';

import ColeCoDashboard from '../features/dashboard/components/ColeCoDashboard';
import ChartsRow from '../features/dashboard/components/ChartsRow';
import DateRangeSelector from '../features/dashboard/components/DateRangeSelector';
import DomainSwitcher from '../features/dashboard/components/DomainSwitcher';
import FamilyOfficeHeader from '../features/dashboard/components/FamilyOfficeHeader';
import MetricsGrid from '../features/dashboard/components/MetricsGrid';
import NoDashboardAccess from '../features/dashboard/components/NoDashboardAccess';
import PriorityList from '../features/dashboard/components/PriorityList';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { useDashboardMetrics } from '../features/dashboard/hooks/useDashboardMetrics';
import type {
  DashboardDomain,
  DateRangeOption,
} from '../features/dashboard/types';

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { clearActiveCompany } = useCompany();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeOption>(10);
  const [adminDomain, setAdminDomain] =
    useState<DashboardDomain>('family_office');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateObligation = () => {
    clearActiveCompany();
    navigate('/family-office?tab=vencimientos&action=new-obligation');
  };

  const isAdmin = user?.role === 'admin';
  const isFamilyOfficeRole = user?.role === 'contador_family_office';
  const isColeCoRole = user?.role === 'contador_cole_co';

  const activeDashboardDomain: DashboardDomain = isAdmin
    ? adminDomain
    : isFamilyOfficeRole
      ? 'family_office'
      : 'cole_co';

  const canSeeFamilyOfficeDashboard =
    (isAdmin || isFamilyOfficeRole) &&
    activeDashboardDomain === 'family_office';

  const canSeeColeCoDashboard =
    (isAdmin || isColeCoRole) && activeDashboardDomain === 'cole_co';
  const { deadlines, loading, error } = useDashboardData(
    canSeeFamilyOfficeDashboard
  );
  const dashboard = useDashboardMetrics(deadlines, dateRange);
  const currentDateText = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!canSeeFamilyOfficeDashboard && !canSeeColeCoDashboard) {
    return (
      <NoDashboardAccess
        fullName={user?.full_name}
        role={user?.role}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isAdmin && (
          <DomainSwitcher
            activeDashboardDomain={activeDashboardDomain}
            onChange={setAdminDomain}
          />
        )}

        {canSeeColeCoDashboard && (
          <ColeCoDashboard
            currentDateText={currentDateText}
            fullName={user?.full_name}
            role={user?.role}
          />
        )}

        {canSeeFamilyOfficeDashboard && (
          <>
            <FamilyOfficeHeader
              currentDateText={currentDateText}
              onCreateObligation={handleCreateObligation}
            />

            <DateRangeSelector dateRange={dateRange} onChange={setDateRange} />
            <MetricsGrid
              loading={loading}
              dashboard={dashboard}
              dateRange={dateRange}
            />
            <ChartsRow
              loading={loading}
              dashboard={dashboard}
              deadlinesCount={deadlines.length}
            />
            <PriorityList
              loading={loading}
              error={error}
              dashboard={dashboard}
              dateRange={dateRange}
              onViewAll={() => navigate('/family-office?tab=vencimientos')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
