'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { uploadFile } from '@/lib/admin-api';
import { cx } from '@/lib/utils';

/* ------------------------------ Toasts ------------------------------ */

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const ToastContext = createContext<(type: Toast['type'], message: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 text-sm shadow-card backdrop-blur-xl',
              t.type === 'success'
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border-red-400/30 bg-red-400/10 text-red-200',
            )}
          >
            {t.type === 'success' ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            )}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* --------------------------- Confirm dialog --------------------------- */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="glass-card w-full max-w-sm border-red-400/25 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/30 bg-red-400/10 text-red-400">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="font-display text-base font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost !px-4 !py-2 text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/90 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Fields ------------------------------ */

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'email' | 'url' | 'number' | 'date';
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="admin-label">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
      {hint && <span className="mt-1 block text-[11px] text-muted/70">{hint}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
  required,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="admin-label">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cx('input resize-y', mono && 'font-mono !text-[13px]')}
      />
      {hint && <span className="mt-1 block text-[11px] text-muted/70">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input appearance-none">
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-raised">
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-[11px] text-muted/70">{hint}</span>}
    </label>
  );
}

export function CheckboxField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line/15 bg-raised/40 p-3.5 transition-colors hover:border-neon/30">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--c-neon))]" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-[11px] text-muted/70">{hint}</span>}
      </span>
    </label>
  );
}

export function ListEditor({
  label,
  items,
  onChange,
  placeholder = 'Type and press Enter…',
  hint,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft('');
  };
  return (
    <div>
      <span className="admin-label">{label}</span>
      {items.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="chip !pr-1.5">
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label={`Remove ${item}`}
                className="ml-1 grid h-4 w-4 place-items-center rounded-full text-muted transition-colors hover:bg-red-400/20 hover:text-red-400"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button type="button" onClick={add} className="btn-ghost shrink-0 !px-3" aria-label={`Add to ${label}`}>
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {hint && <span className="mt-1 block text-[11px] text-muted/70">{hint}</span>}
    </div>
  );
}

export function FileUploadField({
  label,
  value,
  onChange,
  folder,
  accept,
  kind = 'image',
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  accept: string;
  kind?: 'image' | 'pdf';
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
      toast('success', 'File uploaded. Remember to save.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(msg);
      toast('error', msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="admin-label">{label}</span>
      {value ? (
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-line/15 bg-raised/40 p-3">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-14 w-20 rounded-lg border border-line/15 object-cover" />
          ) : (
            <span className="grid h-14 w-20 place-items-center rounded-lg border border-neon/25 bg-neon/10 font-mono text-[10px] font-bold text-neon">
              PDF
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[11px] text-muted">{value}</p>
            <div className="mt-1.5 flex gap-2">
              <a href={value} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-neon hover:underline">
                View ↗
              </a>
              <button type="button" onClick={() => onChange(null)} className="font-mono text-[11px] text-red-400 hover:underline">
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line/30 bg-raised/30 p-4 font-mono text-xs text-muted transition-colors hover:border-neon/40 hover:text-neon disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : kind === 'image' ? <ImagePlus className="h-4 w-4" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          {busy ? 'Uploading…' : `Upload ${kind === 'pdf' ? 'PDF' : 'image/PDF'} (max 10 MB)`}
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => void handle(e.target.files?.[0])} aria-label={`Upload ${label}`} />
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
      {hint && <span className="mt-1 block text-[11px] text-muted/70">{hint}</span>}
    </div>
  );
}

/* ------------------------------ Panels ------------------------------ */

export function AdminCard({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyRow({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-line/25 p-6 text-center text-xs text-muted">{message}</p>;
}

export function ItemRow({
  title,
  subtitle,
  badges,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line/12 bg-raised/40 p-3.5 transition-colors hover:border-neon/25">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && <p className="truncate font-mono text-[11px] text-muted">{subtitle}</p>}
        {badges && <div className="mt-1.5 flex flex-wrap gap-1.5">{badges}</div>}
      </div>
      <button type="button" onClick={onEdit} className="rounded-lg border border-line/20 px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-neon/50 hover:text-neon" aria-label={`Edit ${title}`}>
        Edit
      </button>
      <button type="button" onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-lg border border-line/20 text-muted transition-colors hover:border-red-400/50 hover:text-red-400" aria-label={`Delete ${title}`}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </li>
  );
}

export function SaveBar({
  saving,
  onSave,
  onCancel,
  dirty,
}: {
  saving: boolean;
  onSave: () => void;
  onCancel?: () => void;
  dirty?: boolean;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-6 flex items-center justify-end gap-2 border-t border-line/12 bg-base/85 px-5 py-3.5 backdrop-blur-xl sm:-mx-6 sm:px-6">
      {dirty !== undefined && (
        <span className="mr-auto font-mono text-[11px] text-muted">{dirty ? '● Unsaved changes' : '✓ All changes saved'}</span>
      )}
      {onCancel && (
        <button type="button" onClick={onCancel} className="btn-ghost !px-4 !py-2 text-xs" disabled={saving}>
          Cancel
        </button>
      )}
      <button type="button" onClick={onSave} disabled={saving} className="btn-primary !px-5 !py-2 text-xs disabled:cursor-wait disabled:opacity-60">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Check className="h-3.5 w-3.5" aria-hidden />}
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

/** Dot-path helpers for nested form state. */
export function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.');
  const clone = { ...obj };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cursor[k] = { ...(typeof cursor[k] === 'object' && cursor[k] !== null ? (cursor[k] as Record<string, unknown>) : {}) };
    cursor = cursor[k] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

export function useAdminSession() {
  // Redirect to login when any admin API call reports 401.
  useEffect(() => {
    const onUnauthorized = (e: Event) => {
      if ((e as CustomEvent).detail?.status === 401) {
        window.location.href = '/admin/login';
      }
    };
    window.addEventListener('dv-admin-unauthorized', onUnauthorized);
    return () => window.removeEventListener('dv-admin-unauthorized', onUnauthorized);
  }, []);
}
