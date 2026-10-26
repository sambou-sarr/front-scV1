// Formulaire de devis V5 — deux étapes (le projet, puis les coordonnées), en fenêtre par-dessus la page.
// Envoi : utils/lead.ts → fonction lead-intake (même circuit que la page Contact).
// Ouverture : quote.open({...}) depuis un bouton, lien « ?devis=video,visite-3d » ou ancre « #devis ».
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '../Icons';
import sendLead from '../../utils/lead';
import track from '../../utils/track';
import { STUDIO } from '../../data/studio';
import { SECTORS } from '../../data/secteurs';
import { POLES, PRESTATIONS, PRESTA } from '../../data/prestations';
import { conseiller } from '../../data/conseiller';
import { quote, useQuote } from './quoteStore';
import type { Delai, LeadPayload, Pole, Production, Profil, Stade } from '../../types/v5';

const PRODUCTIONS: [Production, string][] = [['reel', 'Tournage réel'], ['ia', 'Avec l’IA'], ['mixte', 'Les deux'], ['indecis', 'À conseiller']];
const DELAIS: [Delai, string][] = [['urgent', 'Moins de 2 semaines'], ['mois', 'Ce mois-ci'], ['trimestre', 'Dans les 3 mois'], ['libre', 'Pas de date']];
const PROFILS: [Profil, string][] = [['promoteur', 'Promoteur'], ['agence', 'Agence immobilière'], ['proprietaire', 'Propriétaire ou gestionnaire']];
const STADES: [Stade, string][] = [['avant-lancement', 'Avant le lancement'], ['chantier', 'Chantier en cours'], ['commercialisation', 'En commercialisation'], ['livraison', 'Livré ou en location']];
const PREFS = ['WhatsApp', 'Appel', 'E-mail'];
const POLE_ORDER: Pole[] = ['contenu', 'digital', 'impression', 'ia', 'immobilier'];
const SECTOR_LIST = SECTORS as { id: string; name: string }[];

type Step = 'projet' | 'contact' | 'envoi' | 'ok' | 'mailto' | 'erreur';
interface Coords { name: string; phone: string; email: string; company: string; city: string; sector: string; message: string; prefer: string; optin: boolean; website: string }
const EMPTY: Coords = { name: '', phone: '', email: '', company: '', city: '', sector: '', message: '', prefer: 'WhatsApp', optin: false, website: '' };

const poleOf = (ids: string[], fallback?: Pole): Pole => {
  if (fallback) return fallback;
  if (ids.some((id) => PRESTA[id]?.pole === 'immobilier')) return 'immobilier';
  return PRESTA[ids[0]]?.pole ?? 'contenu';
};

function Radios<T extends string>({ name, label, value, options, onChange }: { name: string; label: string; value: T | ''; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <fieldset className="qf-radios">
      <legend>{label}</legend>
      <div>{options.map(([v, l]) => (
        <label key={v} className={value === v ? 'on' : undefined}><input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />{l}</label>
      ))}</div>
    </fieldset>
  );
}

export default function QuoteForm() {
  const { open, seq, preset, selected } = useQuote();
  const [step, setStep] = useState<Step>('projet');
  const [production, setProduction] = useState<Production>('indecis');
  const [delai, setDelai] = useState<Delai | ''>('');
  const [profil, setProfil] = useState<Profil | ''>('');
  const [stade, setStade] = useState<Stade | ''>('');
  const [prog, setProg] = useState({ nom: '', ville: '', lots: '' });
  const [d, setD] = useState<Coords>(EMPTY);
  const [more, setMore] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null);

  // Liens profonds : ?devis=video,visite-3d (campagnes, WhatsApp) ou #devis
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('devis');
    if (q !== null) quote.open({ services: q.split(',').filter((id) => PRESTA[id]), from: 'lien' });
    else if (window.location.hash === '#devis') quote.open({ from: 'ancre' });
  }, []);

  // À chaque ouverture (seq) : on repart de l'étape 1 avec le préréglage du bouton cliqué.
  useEffect(() => {
    if (!open) return;
    setStep('projet'); setMore(quote.get().selected.length === 0);
    const back = document.activeElement as HTMLElement | null;
    if (preset.production) setProduction(preset.production);
    if (preset.profil) setProfil(preset.profil);
    if (preset.stade) setStade(preset.stade);
    if (preset.pole === 'immobilier') setD((x) => ({ ...x, sector: x.sector || (preset.profil === 'promoteur' ? 'promoteurs' : 'immobilier') }));
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => box.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') quote.close(); };
    window.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; back?.focus?.({ preventScroll: true }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seq]);

  if (!open) return null;

  const pole = poleOf(selected, preset.pole);
  const immo = pole === 'immobilier' || profil !== '';
  const needsProduction = selected.some((id) => PRESTA[id]?.ia) || pole === 'contenu';
  const set = <K extends keyof Coords>(k: K, v: Coords[K]) => setD((x) => ({ ...x, [k]: v }));
  const okContact = d.name.trim().length > 1 && (d.phone.replace(/\D/g, '').length >= 9 || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()));
  const labels = selected.map((id) => PRESTA[id]?.label ?? id);
  const asked = (step === 'ok' || step === 'mailto' ? sent : labels).slice(0, 3).join(', ');
  const cons = conseiller(`Bonjour Support Connecté, ${asked ? `je souhaite un devis : ${asked}.` : 'je souhaite un devis.'}`);

  const toStep2 = () => { setStep('contact'); track('quote_step', { step: 2, pole, n: selected.length }); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!okContact || !selected.length) return;
    setStep('envoi');
    const summary = [
      needsProduction ? `Production : ${PRODUCTIONS.find(([v]) => v === production)?.[1]}` : null,
      delai ? `Échéance : ${DELAIS.find(([v]) => v === delai)?.[1]}` : null,
      profil ? `Profil : ${PROFILS.find(([v]) => v === profil)?.[1]}` : null,
      prog.nom ? `Programme / agence : ${prog.nom}${prog.ville ? ` (${prog.ville})` : ''}` : null,
      prog.lots ? `Nombre de lots : ${prog.lots}` : null,
      stade ? `Stade : ${STADES.find(([v]) => v === stade)?.[1]}` : null,
    ].filter(Boolean).join(' · ');
    const payload: LeadPayload = {
      intent: 'devis',
      intentLabel: `Devis — ${POLES[pole].label} : ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? ` (+${labels.length - 3})` : ''}`,
      products: labels, sector: d.sector || (pole === 'immobilier' ? (profil === 'promoteur' ? 'promoteurs' : 'immobilier') : ''),
      name: d.name.trim(), company: d.company.trim(), phone: d.phone.trim(), email: d.email.trim(), city: d.city.trim(), prefer: d.prefer,
      message: [d.message.trim(), summary].filter(Boolean).join('\n\n'),
      consent_marketing: d.optin, consent_text: d.optin ? STUDIO.optin : '', consent_at: new Date().toISOString(),
      source: 'site', page: window.location.pathname, website: d.website,
      pole, services: selected, production: needsProduction ? production : 'indecis', delai: delai || 'libre',
      ...(profil ? { profil } : {}),
      ...(immo ? { projet: { nom: prog.nom.trim(), ville: prog.ville.trim(), lots: prog.lots ? Number(prog.lots) : null, ...(stade ? { stade } : {}) } } : {}),
    };
    try {
      const r = await sendLead(payload);
      track('quote_submit', { pole, n: selected.length, profil: profil || '', production: payload.production, delai: payload.delai, mode: r.mode });
      setSent(labels);
      quote.done();
      setStep(r.mode === 'mailto' ? 'mailto' : 'ok');
    } catch {
      track('quote_error', { pole });
      setStep('erreur');
    }
  };

  return (
    <div className="qf-ov" onClick={(e) => { if (e.target === e.currentTarget) quote.close(); }}>
      <div className="qf" role="dialog" aria-modal="true" aria-labelledby="qf-t" tabIndex={-1} ref={box}>
        <header className="qf-h">
          <div>
            <p className="label">{step === 'contact' ? 'Étape 2 sur 2' : step === 'projet' ? 'Étape 1 sur 2' : 'Demande de devis'}</p>
            <h2 id="qf-t">{step === 'contact' ? 'Vos coordonnées' : step === 'projet' ? 'Votre projet' : step === 'erreur' ? 'L’envoi n’a pas abouti' : 'Demande envoyée'}</h2>
          </div>
          <button type="button" className="qf-x" aria-label="Fermer" onClick={() => quote.close()}>×</button>
        </header>

        {step === 'projet' && (
          <div className="qf-b">
            <div className="qf-sel">
              <p className="qf-k">Prestations choisies</p>
              {selected.length ? (
                <ul className="qf-chips">{selected.map((id) => (
                  <li key={id}><span>{PRESTA[id]?.label ?? id}</span><button type="button" aria-label={`Retirer ${PRESTA[id]?.label ?? id}`} onClick={() => quote.toggle(id)}>×</button></li>
                ))}</ul>
              ) : <p className="qf-hint">Choisissez au moins une prestation ci-dessous.</p>}
              <button type="button" className="qf-more" aria-expanded={more} onClick={() => setMore((x) => !x)}>{more ? 'Masquer la liste' : '+ Ajouter une prestation'}</button>
              {more && (
                <div className="qf-cat">{POLE_ORDER.map((p) => (
                  <details key={p} open={p === pole}>
                    <summary>{POLES[p].label}</summary>
                    <div>{PRESTATIONS.filter((x) => x.pole === p).map((x) => (
                      <button type="button" key={x.id} className={selected.includes(x.id) ? 'on' : undefined} aria-pressed={selected.includes(x.id)} onClick={() => quote.toggle(x.id)}>{x.label}</button>
                    ))}</div>
                  </details>
                ))}</div>
              )}
            </div>

            {immo && (
              <>
                <Radios name="profil" label="Vous êtes" value={profil} options={PROFILS} onChange={setProfil} />
                <div className="qf-grid">
                  <label>{profil === 'agence' ? 'Nom de l’agence' : 'Nom du programme'}<input value={prog.nom} maxLength={80} onChange={(e) => setProg({ ...prog, nom: e.target.value })} placeholder={profil === 'agence' ? 'Votre agence' : 'Ex. Résidence Les Palmiers'} /></label>
                  <label>Ville<input value={prog.ville} maxLength={60} onChange={(e) => setProg({ ...prog, ville: e.target.value })} placeholder="Saly, Mbour, Dakar…" /></label>
                  {profil === 'promoteur' && <label>Nombre de lots<input inputMode="numeric" value={prog.lots} maxLength={4} onChange={(e) => setProg({ ...prog, lots: e.target.value.replace(/\D/g, '') })} placeholder="Ex. 24" /></label>}
                </div>
                {profil === 'promoteur' && <Radios name="stade" label="Où en est le programme ?" value={stade} options={STADES} onChange={setStade} />}
              </>
            )}

            {needsProduction && <Radios name="production" label="Production" value={production} options={PRODUCTIONS} onChange={setProduction} />}
            <Radios name="delai" label="Pour quand ?" value={delai} options={DELAIS} onChange={setDelai} />

            <div className="qf-act">
              <button type="button" className="btn btn-red" disabled={!selected.length} onClick={toStep2}>Continuer <Icon id="arr" /></button>
            </div>
          </div>
        )}

        {(step === 'contact' || step === 'envoi') && (
          <form className="qf-b" onSubmit={submit} noValidate>
            <div className="qf-grid">
              <label>Nom et prénom *<input autoComplete="name" required value={d.name} maxLength={120} onChange={(e) => set('name', e.target.value)} /></label>
              <label>Téléphone (WhatsApp) *<input type="tel" autoComplete="tel" inputMode="tel" value={d.phone} maxLength={40} onChange={(e) => set('phone', e.target.value)} placeholder="+221 · · · · · · · · ·" /></label>
              <label>E-mail<input type="email" autoComplete="email" value={d.email} maxLength={160} onChange={(e) => set('email', e.target.value)} placeholder="vous@entreprise.sn" /></label>
              <label>Entreprise<input autoComplete="organization" value={d.company} maxLength={120} onChange={(e) => set('company', e.target.value)} /></label>
              <label>Ville<input autoComplete="address-level2" value={d.city} maxLength={60} onChange={(e) => set('city', e.target.value)} /></label>
              <label>Votre activité
                <select value={d.sector} onChange={(e) => set('sector', e.target.value)}>
                  <option value="">Choisir</option>
                  {SECTOR_LIST.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="autre">Autre</option>
                </select>
              </label>
            </div>
            <label className="qf-full">Votre message<textarea rows={3} value={d.message} maxLength={2000} onChange={(e) => set('message', e.target.value)} placeholder="Votre lieu, vos supports actuels, un exemple qui vous plaît…" /></label>
            <fieldset className="qf-radios small"><legend>Être recontacté par</legend><div>{PREFS.map((p) => (
              <label key={p} className={d.prefer === p ? 'on' : undefined}><input type="radio" name="prefer" checked={d.prefer === p} onChange={() => set('prefer', p)} />{p}</label>
            ))}</div></fieldset>
            <label className="qf-optin"><input type="checkbox" checked={d.optin} onChange={(e) => set('optin', e.target.checked)} /><span>{STUDIO.optin}</span></label>
            <input className="qf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={d.website} onChange={(e) => set('website', e.target.value)} name="website" />
            <p className="qf-hint">* Nom, et téléphone ou e-mail. Devis chiffré et détaillé, sans engagement.</p>
            <div className="qf-act">
              <button type="button" className="btn btn-line dark" onClick={() => setStep('projet')}>Retour</button>
              <button type="submit" className="btn btn-red" disabled={!okContact || step === 'envoi'}>{step === 'envoi' ? 'Envoi…' : 'Envoyer ma demande'} <Icon id="arr" /></button>
            </div>
          </form>
        )}

        {(step === 'ok' || step === 'mailto') && (
          <div className="qf-b qf-done">
            <span className="qf-ok" aria-hidden="true"><Icon id="i-check" /></span>
            <p>{step === 'mailto' ? 'Votre messagerie s’est ouverte avec la demande pré-remplie : il ne reste qu’à l’envoyer.' : 'Merci, votre demande est bien arrivée. Devis chiffré et détaillé, sans engagement.'}</p>
            <p className="qf-hint">Un conseiller vous recontacte {d.prefer === 'E-mail' ? 'par e-mail' : d.prefer === 'Appel' ? 'par téléphone' : 'sur WhatsApp'}.</p>
            <div className="qf-act">
              <a className="btn btn-line dark" href={cons.href} {...(cons.external ? { target: '_blank', rel: 'noreferrer' } : {})}><Icon id={cons.icon} />{cons.label}</a>
              <button type="button" className="btn btn-red" onClick={() => quote.close()}>Fermer</button>
            </div>
          </div>
        )}

        {step === 'erreur' && (
          <div className="qf-b qf-done">
            <p>Votre demande n’a pas pu partir. Vos informations sont conservées : réessayez, ou contactez-nous directement.</p>
            <div className="qf-act">
              <a className="btn btn-line dark" href={cons.href} {...(cons.external ? { target: '_blank', rel: 'noreferrer' } : {})}><Icon id={cons.icon} />{cons.label}</a>
              <button type="button" className="btn btn-red" onClick={() => setStep('contact')}>Réessayer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
