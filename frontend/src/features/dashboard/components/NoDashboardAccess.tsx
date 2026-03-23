interface NoDashboardAccessProps {
  fullName?: string;
  role?: string;
  onLogout: () => void;
}

export default function NoDashboardAccess({
  fullName,
  role,
  onLogout,
}: NoDashboardAccessProps) {
  return (
    <div className="min-h-screen bg-neutral-bg p-8">
      <div className="max-w-3xl mx-auto bg-neutral-surface p-8 rounded-2xl shadow-sm border border-neutral-border">
        <h1 className="text-2xl font-bold text-primary font-hubot tracking-tight mb-1">
          Dashboard Operativo
        </h1>
        <p className="text-sm text-neutral-muted mb-6">
          Para este rol se mostrará el resumen del módulo COLE/CO en una
          próxima iteración.
        </p>
        <div className="bg-neutral-bg border border-neutral-border p-5 rounded-xl mb-6 space-y-2">
          <p className="text-sm text-neutral-text">
            <span className="text-neutral-muted">Usuario:</span>{' '}
            <span className="font-medium">{fullName}</span>
          </p>
          <p className="text-sm text-neutral-text">
            <span className="text-neutral-muted">Rol:</span>{' '}
            <span className="uppercase font-bold text-primary text-xs tracking-wide">
              {role}
            </span>
          </p>
          <p className="text-sm text-neutral-text">
            <span className="text-neutral-muted">Estado:</span>{' '}
            <span className="text-green-600 font-medium">Sesión activa</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-semibold"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
