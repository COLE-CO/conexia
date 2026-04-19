import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateMe } from '../services/authService';
import {
  Bell,
  CalendarClock,
  FileSpreadsheet,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

type AlertKey =
  | 'alert_deadlines_enabled'
  | 'alert_balances_enabled'
  | 'alert_reports_enabled';

const alertOptions: Array<{
  key: AlertKey;
  title: string;
  description: string;
  icon: typeof CalendarClock;
}> = [
  {
    key: 'alert_deadlines_enabled',
    title: 'Alertas de vencimientos',
    description:
      'Muestra recordatorios operativos sobre obligaciones y fechas clave.',
    icon: CalendarClock,
  },
  {
    key: 'alert_balances_enabled',
    title: 'Alertas de balances',
    description:
      'Habilita avisos relacionados con cargas y revisiones de balances.',
    icon: FileSpreadsheet,
  },
  {
    key: 'alert_reports_enabled',
    title: 'Alertas de reportes',
    description: 'Activa notificaciones sobre reportes y resúmenes generados.',
    icon: Sparkles,
  },
];

export default function SettingsPage() {
  const { user, patchUser, setUser, refreshUser } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reminderStartDays, setReminderStartDays] = useState(5);
  const [reminderEndDays, setReminderEndDays] = useState(7);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? '');
    setEmail(user.email);
    setReminderStartDays(user.reminder_window_start_days);
    setReminderEndDays(user.reminder_window_end_days);
  }, [user]);

  if (!user) return null;

  const handleToggleAlert = (key: AlertKey) => {
    patchUser({ [key]: !user[key] });
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    if (isAdmin && reminderStartDays > reminderEndDays) {
      setError('El inicio del rango no puede ser mayor al fin del rango.');
      setMessage(null);
      return;
    }

    if (isAdmin && (reminderStartDays < 0 || reminderEndDays < 0)) {
      setError('El rango de recordatorios no puede tener valores negativos.');
      setMessage(null);
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updatedUser = await updateMe({
        full_name: fullName.trim(),
        email: email.trim(),
        alert_deadlines_enabled: user.alert_deadlines_enabled,
        alert_balances_enabled: user.alert_balances_enabled,
        alert_reports_enabled: user.alert_reports_enabled,
        reminder_window_start_days: isAdmin
          ? reminderStartDays
          : user.reminder_window_start_days,
        reminder_window_end_days: isAdmin
          ? reminderEndDays
          : user.reminder_window_end_days,
      });

      setUser(updatedUser);
      setMessage('Configuración actualizada correctamente.');
    } catch {
      await refreshUser();
      setError('No fue posible guardar los cambios. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
              Configuración de perfil
            </h1>
            <p className="mt-1 text-sm text-neutral-muted">
              Administra tu información personal y el tipo de alertas que ves en
              la aplicación.
            </p>
          </div>
          <div className="rounded-full bg-secondary/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondary">
            Perfil activo
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-3xl border border-neutral-border bg-neutral-surface p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <UserRound size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-text">
                  Datos del perfil
                </h2>
                <p className="text-sm text-neutral-muted">
                  Nombre, correo y rol asociados al usuario autenticado.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                  <UserRound size={14} />
                  Nombre
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-neutral-border bg-white px-4 py-3 text-sm text-neutral-text outline-none transition-colors duration-200 focus:border-secondary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                  <Mail size={14} />
                  Correo
                </span>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-2xl border border-neutral-border bg-neutral-bg px-4 py-3 text-sm text-neutral-muted outline-none cursor-not-allowed"
                />
                <span className="mt-1 block text-xs text-neutral-muted">
                  El correo no se puede modificar desde esta sección.
                </span>
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-border bg-neutral-bg p-4">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                <ShieldCheck size={14} />
                Rol
              </span>
              <p className="text-sm font-semibold capitalize text-primary">
                {user.role.replaceAll('_', ' ')}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-border bg-neutral-surface p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-text">
                  Preferencias de alertas
                </h2>
                <p className="text-sm text-neutral-muted">
                  Los elementos vinculados a una alerta desactivada se ocultan
                  de inmediato.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {alertOptions.map(({ key, title, description, icon: Icon }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-neutral-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-bg text-neutral-text">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-text">
                          {title}
                        </p>
                        <p className="mt-1 text-xs text-neutral-muted">
                          {description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAlert(key)}
                      aria-label={`Alternar ${title}`}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                        user[key] ? 'bg-secondary' : 'bg-neutral-border'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                          user[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-neutral-border bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-bg text-neutral-text">
                    <CalendarClock size={18} />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-semibold text-neutral-text">
                      Rango de recordatorio por correo
                    </p>
                    <p className="mt-1 text-xs text-neutral-muted">
                      Define entre cuántos días antes del vencimiento se envía
                      el correo automático. El sistema envía una sola vez por
                      obligación.
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                          Desde (días)
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={reminderStartDays}
                          disabled={!isAdmin}
                          onChange={(event) =>
                            setReminderStartDays(Number(event.target.value))
                          }
                          className="w-full rounded-2xl border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text outline-none transition-colors duration-200 focus:border-secondary disabled:cursor-not-allowed disabled:bg-neutral-bg disabled:text-neutral-muted"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-muted">
                          Hasta (días)
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={reminderEndDays}
                          disabled={!isAdmin}
                          onChange={(event) =>
                            setReminderEndDays(Number(event.target.value))
                          }
                          className="w-full rounded-2xl border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text outline-none transition-colors duration-200 focus:border-secondary disabled:cursor-not-allowed disabled:bg-neutral-bg disabled:text-neutral-muted"
                        />
                      </label>
                    </div>

                    {!isAdmin && (
                      <p className="mt-2 text-xs text-neutral-muted">
                        Solo el usuario administrador puede modificar este
                        rango.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-3xl border border-neutral-border bg-neutral-surface p-5 shadow-sm">
          <div>
            {message && (
              <p className="text-sm font-medium text-secondary">{message}</p>
            )}
            {error && (
              <p className="text-sm font-medium text-danger">{error}</p>
            )}
            {!message && !error && (
              <p className="text-sm text-neutral-muted">
                Los cambios se aplicarán a tu sesión y se guardarán en tu
                perfil.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
