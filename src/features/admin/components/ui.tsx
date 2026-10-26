import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { errMsg } from '../../../lib/apiError';

// ---------- Icônes (traits) ----------
const P = {
  dash: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  users: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4',
  plus: 'M12 5v14M5 12h14', back: 'M15 5l-7 7 7 7', x: 'M6 6l12 12M18 6 6 18', out: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
  ext: 'M14 4h6v6M20 4l-8 8M18 14v6H4V6h6', menu: 'M4 7h16M4 12h16M4 17h16', trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2', check: 'M5 12.5l4.5 4.5L19 7.5', zap: 'M13 3 5 13h6l-1 8 8-10h-6z',
  copy: 'M9 9h11v11H9zM5 15V4h11', refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5', sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
  file: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5', down: 'M12 4v11M7 10l5 5 5-5M5 20h14', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  wa: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zM9 8.5c0 3 2.5 6.5 6.5 6.5l1-1.5-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.5 2.6h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
  shield: 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z',
};
export type IconName = keyof typeof P;
export const Icon = ({ n, s = 18 }: { n: IconName; s?: number }) => (
  <svg className="ic" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
);

// ---------- Éléments simples ----------
export const Badge = ({ tone = 'grey', children }: { tone?: string; children?: ReactNode }) => <span className={`badge b-${tone}`}>{children}</span>;
export const Empty = ({ children }: { children?: ReactNode }) => <p className="empty">{children}</p>;
export const Loading = () => <div className="loading"><span /><span /><span /></div>;
type BtnProps = { kind?: 'red' | 'dark' | 'ghost'; icon?: IconName } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { children?: ReactNode };
export const Btn = ({ kind = 'ghost', icon, children, ...p }: BtnProps) => <button type="button" className={`adm-btn adm-btn-${kind}`} {...p}>{icon && <Icon n={icon} s={16} />}{children}</button>;
export const Field = ({ label, children, hint }: { label: string; children?: ReactNode; hint?: string }) => <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="panel err-box"><p className="err">{message}</p>{onRetry && <Btn icon="refresh" onClick={onRetry}>Réessayer</Btn>}</div>;
}

export function Kpi({ label, value, sub, tone, icon, onClick }: { label: string; value: ReactNode; sub?: string; tone?: string; icon?: IconName; onClick?: () => void }) {
  return (
    <button type="button" className={`kpi${tone ? ' k-' + tone : ''}`} onClick={onClick} disabled={!onClick}>
      <span className="kpi-l">{icon && <Icon n={icon} s={15} />}{label}</span><b>{value}</b>{sub && <small>{sub}</small>}
    </button>
  );
}

/** Choix parmi quelques options (boutons segmentés). */
export function Seg<K extends string>({ value, onChange, options }: { value: K; onChange: (k: K) => void; options: readonly (readonly [K, string])[] }) {
  return <div className="adm-seg" role="group">{options.map(([k, l]) => <button key={k} type="button" className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}</div>;
}

/** Histogramme simple : la dernière barre est mise en avant. */
export function Bars({ data, format }: { data: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars" role="img" aria-label="Histogramme">
      {data.map((d, i) => (
        <div key={d.label + i} className={`bar${i === data.length - 1 ? ' last' : ''}`}>
          <span className="bar-v">{d.value ? (format ? format(d.value) : d.value) : ''}</span>
          <i style={{ height: `${Math.max(d.value ? 6 : 2, (d.value / max) * 100)}%` }} />
          <span className="bar-l">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Onglets avec compteur. */
export function Tabs<K extends string>({ tabs, value, onChange }: { tabs: readonly (readonly [K, string, number?])[]; value: K; onChange: (k: K) => void }) {
  return <div className="adm-tabs" role="tablist">{tabs.map(([k, l, n]) => <button key={k} type="button" role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}{n !== undefined && <em>{n}</em>}</button>)}</div>;
}

export function Pager({ page, totalPages, total, noun, onPage }: { page: number; totalPages: number; total: number; noun: string; onPage: (p: number) => void }) {
  return (
    <div className="pager">
      <span className="adm-muted small">{total} {noun}{total > 1 ? 's' : ''}</span>
      {totalPages > 1 && <div className="row-a">
        <Btn disabled={page <= 1} onClick={() => onPage(page - 1)}>Précédent</Btn>
        <span className="small">Page {page} / {totalPages}</span>
        <Btn disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Suivant</Btn>
      </div>}
    </div>
  );
}

// ---------- Fenêtres ----------
export function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children?: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-h"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Fermer"><Icon n="x" /></button></div>
        <div className="modal-b">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ title, children, confirmLabel, danger, onConfirm, onClose }: { title: string; children?: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => Promise<unknown> | void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <div className="form">
        {children}
        <div className="form-a">
          <Btn onClick={onClose}>Annuler</Btn>
          <Btn kind={danger ? 'red' : 'dark'} disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>{confirmLabel}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Notifications ----------
export type Toast = (text: string, tone?: 'ok' | 'err') => void;
const ToastCtx = createContext<Toast>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children?: ReactNode }) {
  const [items, setItems] = useState<{ id: number; text: string; tone: string }[]>([]);
  const push = useCallback<Toast>((text, tone = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, text, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), tone === 'err' ? 5000 : 3000);
  }, []);
  return <ToastCtx.Provider value={push}>{children}<div className="toasts" aria-live="polite">{items.map((t) => <div key={t.id} className={`toast t-${t.tone}`}>{t.text}</div>)}</div></ToastCtx.Provider>;
}

/** Lance une action : message de succès éventuel, erreur de l'API affichée en notification. Renvoie undefined si elle échoue. */
export function useAction() {
  const toast = useToast();
  return useCallback(async <T,>(fn: () => Promise<T>, ok?: string): Promise<T | undefined> => {
    try { const r = await fn(); if (ok) toast(ok); return r; } catch (e) { toast(errMsg(e), 'err'); return undefined; }
  }, [toast]);
}

/** Copie dans le presse-papiers. */
export function CopyBtn({ text, label = 'Copier' }: { text: string; label?: string }) {
  const toast = useToast();
  return <Btn icon="copy" onClick={() => navigator.clipboard.writeText(text).then(() => toast('Copié'), () => toast('Copie impossible : sélectionne le texte à la main.', 'err'))}>{label}</Btn>;
}
