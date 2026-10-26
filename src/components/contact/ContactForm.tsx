import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { C_FORM, CONTACT } from '../../data/contact';
import { STUDIO } from '../../data/studio';
import { Icon } from '../Icons';
import sendLead from '../../utils/lead';
import type { LeadBase } from '../../utils/lead';
import track from '../../utils/track';

/*
  V6 — Formulaire de contact simple (remplace la carte qui s'écrit en direct sur cette page).
  Objet pré-sélectionné par l'adresse : /contact?sujet=devis|demo|qr|question|autre#formulaire
  ou par l'événement « lead:preset » (cartes du hero). Envoi : utils/lead.ts → fonction lead-intake.
  Consentement marketing séparé, non pré-coché, horodaté (loi n° 2008-08, art. 16). Champ piège anti-robot.
*/
interface Coords { name: string; company: string; phone: string; email: string; message: string; prefer: string; optin: boolean; website: string }
type TextField = 'name' | 'company' | 'phone' | 'email';
type Errors = Partial<Record<TextField | 'reach', string>>;
type State = 'edit' | 'sending' | 'ok' | 'mailto' | 'fail';

const EMPTY: Coords = { name: '', company: '', phone: '', email: '', message: '', prefer: 'Appel', optin: false, website: '' };
const fromUrl = (): string => {
  const q = new URLSearchParams(window.location.search).get('sujet');
  return q !== null && C_FORM.subjects.some((s) => s.id === q) ? q : 'devis';
};

export default function ContactForm({ id = 'formulaire' }: { id?: string }) {
  const [subject, setSubject] = useState(fromUrl);
  const [d, setD] = useState<Coords>(EMPTY);
  const [err, setErr] = useState<Errors>({});
  const [state, setState] = useState<State>('edit');

  useEffect(() => {
    const h = (e: Event) => { const { intent } = (e as CustomEvent<{ intent: string }>).detail; if (C_FORM.subjects.some((s) => s.id === intent)) { setSubject(intent); setState('edit'); } };
    window.addEventListener('lead:preset', h);
    return () => window.removeEventListener('lead:preset', h);
  }, []);

  const set = <K extends keyof Coords>(k: K, v: Coords[K]) => { setD((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: undefined, reach: undefined })); };
  const validate = () => {
    const e: Errors = {};
    if (d.name.trim().length < 2) e.name = C_FORM.errors.name;
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = C_FORM.errors.email;
    if (d.phone.trim() && d.phone.replace(/\D/g, '').length < 9) e.phone = C_FORM.errors.phone;
    if (!d.phone.trim() && !d.email.trim()) e.reach = C_FORM.errors.reach;
    setErr(e); return !Object.keys(e).length;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setState('sending');
    const S = C_FORM.subjects.find((s) => s.id === subject)!;
    const now = new Date().toISOString();
    const payload: LeadBase & Record<string, unknown> = {
      intent: S.intent, intentLabel: S.label, products: S.products, sector: '',
      name: d.name.trim(), company: d.company.trim(), phone: d.phone.trim(), email: d.email.trim(), city: '', prefer: d.prefer,
      message: d.message.trim(),
      consent_marketing: d.optin, consent_text: d.optin ? STUDIO.optin : '', consent_at: now,
      source: 'site', page: window.location.pathname, website: d.website,
    };
    try {
      const r = await sendLead(payload);
      track('contact_submit', { subject, mode: r.mode, optin: d.optin });
      setState(r.mode === 'mailto' ? 'mailto' : 'ok');
    } catch { setState('fail'); }
  };

  const field = (k: TextField, type = 'text', auto?: string) => (
    <label className={`fl${err[k] ? ' bad' : ''}`}>
      <input type={type} placeholder=" " autoComplete={auto} value={d[k]} maxLength={k === 'email' ? 160 : 120} onChange={(e) => set(k, e.target.value)} aria-invalid={!!err[k]} disabled={state === 'sending'} />
      <span>{C_FORM.fields[k]}</span>{err[k] && <em role="alert">{err[k]}</em>}
    </label>
  );

  return (
    <section className="cf" id={id}>
      <div className="wrap cf-grid">
        <div className="cf-head rv">
          <p className="label">{C_FORM.label}</p>
          <h2 className="h2">{C_FORM.title}<br /><em className="red">{C_FORM.red}</em></h2>
          <p className="cf-p">{C_FORM.text}</p>
          <ul className="cf-direct">
            <li><Icon id="i-phone" /><a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a></li>
            <li><Icon id="i-mail" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
          </ul>
        </div>

        {state === 'ok' || state === 'mailto' ? (
          <div className="cf-card cf-done" role="status">
            <span className="cf-ok"><Icon id="i-check" /></span>
            <b>{C_FORM.done.title}</b>
            <p>{state === 'mailto' ? C_FORM.done.mailto : C_FORM.done.text}</p>
            <button type="button" className="btn btn-line dark" onClick={() => { setD(EMPTY); setState('edit'); }}>{C_FORM.done.again}</button>
          </div>
        ) : (
          <form className="cf-card" onSubmit={submit} noValidate>
            <fieldset className="cf-subj">
              <legend>{C_FORM.subjectLabel}</legend>
              <div>{C_FORM.subjects.map((s) => (
                <label key={s.id} className={subject === s.id ? 'on' : undefined}><input type="radio" name="sujet" value={s.id} checked={subject === s.id} onChange={() => setSubject(s.id)} />{s.label}</label>
              ))}</div>
            </fieldset>
            <div className="cf-fields">
              {field('name', 'text', 'name')}
              {field('company', 'text', 'organization')}
              {field('phone', 'tel', 'tel')}
              {field('email', 'email', 'email')}
              <label className="fl ta">
                <textarea placeholder=" " rows={4} maxLength={2000} value={d.message} onChange={(e) => set('message', e.target.value)} disabled={state === 'sending'} />
                <span>{C_FORM.fields.message}</span>
              </label>
            </div>
            {err.reach && <p className="ld-err" role="alert">{err.reach}</p>}
            <fieldset className="cf-subj small">
              <legend>{C_FORM.preferLabel}</legend>
              <div>{C_FORM.prefers.map((p) => (
                <label key={p} className={d.prefer === p ? 'on' : undefined}><input type="radio" name="prefer" checked={d.prefer === p} onChange={() => set('prefer', p)} />{p}</label>
              ))}</div>
            </fieldset>
            <label className="cf-optin"><input type="checkbox" checked={d.optin} onChange={(e) => set('optin', e.target.checked)} /><span>{STUDIO.optin}</span></label>
            <input className="cf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={d.website} onChange={(e) => set('website', e.target.value)} />
            {state === 'fail' && <p className="ld-err" role="alert">{C_FORM.errors.fail}</p>}
            <p className="cf-hint">{C_FORM.hint}</p>
            <button type="submit" className="btn btn-red" disabled={state === 'sending'}>{state === 'sending' ? 'Envoi…' : C_FORM.send} <Icon id="arr" /></button>
          </form>
        )}
      </div>
    </section>
  );
}
