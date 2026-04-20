import { useEffect, useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import {
  getCompanies,
  createCompany,
  deleteCompany,
} from '../services/companyService';
import type { Company } from '../services/companyService';
import { Building2, Search, ArrowRight, Plus, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

function CompanyGuardSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
      <div className="w-full max-w-lg animate-pulse">
        {/* Ícono + título */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-neutral-border rounded-2xl mb-4" />
          <div className="h-7 w-56 bg-neutral-border rounded-lg mb-2" />
          <div className="h-4 w-72 bg-neutral-border rounded" />
        </div>

        {/* Barra búsqueda + botón */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-11 bg-neutral-border rounded-xl" />
          <div className="h-11 w-36 bg-neutral-border rounded-xl" />
        </div>

        {/* Lista */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-5 py-4 ${i !== 3 ? 'border-b border-neutral-border' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-border flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 bg-neutral-border rounded" />
                <div className="h-3 w-24 bg-neutral-border rounded" />
              </div>
              <div className="h-4 w-4 bg-neutral-border rounded" />
            </div>
          ))}
        </div>

        {/* Counter */}
        <div className="h-3 w-32 bg-neutral-border rounded mx-auto mt-4" />
      </div>
    </div>
  );
}

export default function CompanyGuard({ children }: Props) {
  const { activeCompany, setActiveCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNit, setNewNit] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim()) {
      setCreateError('El nombre es obligatorio.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createCompany({
        name: newName.trim(),
        nit: newNit.trim() || undefined,
      });
      setCompanies((prev) => [...prev, created]);
      setShowCreate(false);
      setNewName('');
      setNewNit('');
    } catch {
      setCreateError('Error al crear la empresa. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCompany(confirmDelete.id);
      setCompanies((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
      setDeleteConfirmText('');
    } catch (e: unknown) {
      setDeleteError(
        e instanceof Error ? e.message : 'Error al eliminar la empresa.'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <CompanyGuardSkeleton />;

  if (!activeCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Building2 size={26} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-text font-hubot mb-1">
              Selecciona una empresa
            </h2>
            <p className="text-sm text-neutral-muted">
              Elige el cliente con el que vas a trabajar en esta sesión
            </p>
          </div>

          {/* Buscador + botón crear */}
          <div className="flex gap-2 mb-4">
            {companies.length > 3 && (
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-surface border border-neutral-border focus-within:border-secondary transition-colors duration-200 shadow-sm">
                <Search size={16} className="text-neutral-muted flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar empresa..."
                  className="flex-1 bg-transparent text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none"
                  autoFocus
                />
              </div>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors duration-200 shadow-sm whitespace-nowrap"
            >
              <Plus size={16} /> Nueva empresa
            </button>
          </div>

          {/* Lista */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-sm overflow-hidden max-h-72 overflow-y-auto">
            {companies.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Building2 size={28} className="text-neutral-muted" />
                <p className="text-sm font-medium text-neutral-text">
                  No hay empresas registradas
                </p>
                <p className="text-xs text-neutral-muted">
                  Crea la primera empresa para comenzar
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-neutral-muted">
                  No se encontraron resultados para "{search}"
                </p>
              </div>
            ) : (
              filtered.map((company, index) => (
                <div
                  key={company.id}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-neutral-bg transition-colors duration-150 group
                    ${index !== filtered.length - 1 ? 'border-b border-neutral-border' : ''}
                  `}
                >
                  <button
                    onClick={() => setActiveCompany(company)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-150">
                      <span className="text-sm font-bold text-primary">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-text">
                        {company.name}
                      </p>
                      {company.nit && (
                        <p className="text-xs text-neutral-muted">
                          NIT: {company.nit}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCompany(company)}
                      className="text-neutral-muted group-hover:text-primary transition-colors duration-150"
                    >
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(company)}
                      className="p-1.5 rounded-lg text-neutral-muted hover:text-red-400 hover:bg-red-50 transition-colors duration-150"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-center text-xs text-neutral-muted mt-4">
            {companies.length}{' '}
            {companies.length === 1 ? 'empresa registrada' : 'empresas registradas'}
          </p>
        </div>

        {/* Modal crear empresa */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-neutral-text font-hubot">
                  Nueva empresa
                </h3>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                    setNewName('');
                    setNewNit('');
                  }}
                  className="text-neutral-muted hover:text-neutral-text"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs text-neutral-muted mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: AgroSur S.A.S"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-neutral-muted mb-1 block">NIT (opcional)</label>
                <input
                  type="text"
                  value={newNit}
                  onChange={(e) => setNewNit(e.target.value)}
                  placeholder="Ej: 900123456-1"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary"
                />
              </div>

              {createError && <p className="text-xs text-red-400 mb-4">{createError}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                    setNewName('');
                    setNewNit('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear empresa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmar eliminar */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-text">Eliminar empresa</h3>
                  <p className="text-xs text-neutral-muted">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-sm text-neutral-text mb-4">
                ¿Seguro que deseas eliminar{' '}
                <span className="font-semibold">{confirmDelete.name}</span>? Se perderán todos sus datos asociados.
              </p>

              <div className="mb-5">
                <label className="text-xs text-neutral-muted mb-1 block">
                  Escribe <span className="font-bold text-neutral-text">CONFIRMAR</span> para continuar
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="CONFIRMAR"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-red-400 font-mono"
                />
              </div>

              <div className="flex gap-3">
                {deleteError && <p className="text-xs text-red-400 mb-4">{deleteError}</p>}
                <button
                  onClick={() => {
                    setConfirmDelete(null);
                    setDeleteConfirmText('');
                    setDeleteError(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirmText !== 'CONFIRMAR'}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
