import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, FormEvent, PointerEvent as ReactPointerEvent } from 'react';
import { STUDIO, DESIGNER } from '../../data/studio';
import { Icon } from '../Icons';
import { QR, ficheUrl, slugify } from '../../lib/qr';
import { renderCard, download, CARD } from '../../lib/print';
import type { PrintFiles, Tier } from '../../lib/print';
import { cssVars } from '../../lib/css';
import sendLead from '../../utils/lead';
import type { LeadBase } from '../../utils/lead';
import track from '../../utils/track';

/*
  Carte qui s'écrit en direct — page Cartes : <CardStudio designer /> (configurateur par niveau).
  V6 : la page Contact a son propre formulaire simple (components/contact/ContactForm.tsx) ;
  le mode « withIntent » (prise de contact sur la carte) est supprimé.
  Sans `designer` : formulaire court « Recevoir ma maquette » (non utilisé actuellement).
      RÈGLE (toutes les cartes, Contact compris) : RECTO = le logo (ou le nom de l'entreprise) ; le QR n'est jamais au recto.
      VERSO = les coordonnées + un QR code discret en bas à droite.
      Essentielle : design Support Connecté (aperçu produit).
      Pro         : logo au recto, coordonnées au verso, design Pro (liseré rouge).
      Signature   : + fond du recto et fond du verso (pré-chargés ou importés), couleur d'accent,
                    couleur de tous les textes, taille du logo, zoom / cadrage / assombrissement.
  La carte se retourne toute seule : verso quand on tape ses coordonnées, recto quand on règle le logo.
  Consentement marketing séparé, non pré-coché, horodaté (loi n° 2008-08, art. 16).
*/
interface Fields { name: string; role: string; company: string; phone: string; email: string }
type FieldKey = keyof Fields;
interface Design {
  bg: string; upload: string | null; uploadName: string; uploadData: string; logo: string | null; logoName: string; logoData: string; logoSize: number;
  accent: string; ink: string | null; zoom: number; posX: number; posY: number; dim: number;
  back: string; backUpload: string | null; backUploadName: string; backUploadData: string; backDim: number;
}
type Errors = Partial<Record<FieldKey | 'reach' | 'file', string>>;
type FileKind = 'logo' | 'back' | 'bg';
type State = 'edit' | 'encoding' | 'done' | 'done-attach' | 'fail';
const EMPTY: Fields = { name: '', role: '', company: '', phone: '', email: '' };
const D0: Design = { bg: 'noir', upload: null, uploadName: '', uploadData: '', logo: null, logoName: '', logoData: '', logoSize: 62,
  accent: '#c9a25b', ink: null, zoom: 100, posX: 50, posY: 50, dim: 40,
  back: 'noir', backUpload: null, backUploadName: '', backUploadData: '', backDim: 55 };
const MAX = 5 * 1024 * 1024, INLINE = 1.5 * 1024 * 1024;
const INK = { light: '#ffffff', dark: '#1b1712' };

export default function CardStudio({ id = 'creer-ma-carte', designer = false }: { id?: string; designer?: boolean }) {
  const [tier, setTier] = useState<Tier>(designer ? 'signature' : 'pro');
  const [d, setD] = useState<Fields>(EMPTY);
  const [ds, setDs] = useState<Design>(D0);
  const [focus, setFocus] = useState<FieldKey | null>(null);
  const [back, setBack] = useState(false);
  const [optin, setOptin] = useState(false);
  const [err, setErr] = useState<Errors>({});
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<State>('edit');
  const [print, setPrint] = useState<PrintFiles | null>(null); // fichiers d'impression générés à la validation (BAT)
  const card = useRef<HTMLDivElement>(null), started = useRef(false), urls = useRef<string[]>([]);
  const T = STUDIO.tiers.find((t) => t.id === tier)!;
  const ess = tier === 'essentielle', sig = tier === 'signature', pro = tier === 'pro';
  const P = DESIGNER.presets.find((p) => p.id === ds.bg);
  const PB = DESIGNER.presets.find((p) => p.id === (ds.back === 'same' ? ds.bg : ds.back));

  useEffect(() => {
    // Les boutons des niveaux (TiersSection, HandTrio) choisissent le niveau : événement « studio:tier »
    const t = (e: Event) => { const x = (e as CustomEvent<string>).detail; const found = STUDIO.tiers.find((y) => y.id === x); if (found) { setTier(found.id); setState('edit'); } };
    window.addEventListener('studio:tier', t);
    return () => { window.removeEventListener('studio:tier', t); urls.current.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  const set = (k: FieldKey, v: string) => {
    if (!started.current) { started.current = true; track('studio_start', { tier }); }
    setD((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: undefined, reach: undefined }));
  };
  const onFieldFocus = (k: FieldKey) => { setFocus(k); setBack(true); }; // les coordonnées sont au verso
  const setDesign = <K extends keyof Design>(k: K, v: Design[K], face?: 'front' | 'back') => { setDs((x) => ({ ...x, [k]: v })); if (face === 'front') setBack(false); if (face === 'back') setBack(true); };
  const pickTier = (x: Tier) => { setTier(x); track('studio_tier', { tier: x }); if (x === 'essentielle') setBack(false); };

  const readFile = (f: File | undefined, kind: FileKind) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr((e) => ({ ...e, file: DESIGNER.fileErr.type })); return; }
    if (f.size > MAX) { setErr((e) => ({ ...e, file: DESIGNER.fileErr.size })); return; }
    setErr((e) => ({ ...e, file: undefined }));
    const url = URL.createObjectURL(f); urls.current.push(url);
    const apply = (data: string) => setDs((x): Design => (kind === 'logo' ? { ...x, logo: url, logoName: f.name, logoData: data }
      : kind === 'back' ? { ...x, back: 'upload', backUpload: url, backUploadName: f.name, backUploadData: data }
        : { ...x, upload: url, uploadName: f.name, uploadData: data, bg: 'upload', zoom: 100, posX: 50, posY: 50 }));
    if (f.size <= INLINE) { const r = new FileReader(); r.onload = () => apply(r.result as string); r.readAsDataURL(f); } else apply(''); // readAsDataURL → chaîne
    setBack(kind === 'back'); track('studio_upload', { kind });
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(false); if (sig) readFile(e.dataTransfer.files[0], back ? 'back' : 'bg'); else if (pro && !back) readFile(e.dataTransfer.files[0], 'logo'); };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(hover: none)').matches || !card.current) return;
    const r = card.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.current.style.setProperty('--ry', `${x * 18}deg`); card.current.style.setProperty('--rx', `${-y * 12}deg`);
    card.current.style.setProperty('--gx', `${(x + .5) * 100}%`); card.current.style.setProperty('--gy', `${(y + .5) * 100}%`);
  };
  const leave = () => { if (!card.current) return; card.current.style.setProperty('--ry', '0deg'); card.current.style.setProperty('--rx', '0deg'); };

  const validate = () => {
    const e: Errors = {};
    if (!d.name.trim()) e.name = STUDIO.errors.name;
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = STUDIO.errors.email;
    if (d.phone.trim() && d.phone.replace(/\D/g, '').length < 9) e.phone = STUDIO.errors.phone;
    if (!d.phone.trim() && !d.email.trim()) e.reach = STUDIO.errors.reach;
    setErr(e); return !Object.keys(e).length;
  };

  const inkFront = ds.ink || (sig ? INK[ds.upload ? 'light' : P?.ink || 'light'] : '#ffffff');
  const inkBack = ds.ink || (sig ? INK[(ds.back === 'upload' || (ds.back === 'same' && ds.upload)) ? 'light' : PB?.ink || 'light'] : '#ffffff');

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBack(false); setState('encoding');
    const fondVerso = ds.back === 'same' ? 'comme le recto' : ds.back === 'upload' ? `image importée (${ds.backUploadName})` : DESIGNER.presets.find((p) => p.id === ds.back)?.label;
    const design = designer && !ess ? {
      recto: 'logo', logo: ds.logoName || 'aucun (nom de l’entreprise)', taille_logo: ds.logoSize,
      ...(sig ? { fond: ds.upload ? `image importée (${ds.uploadName})` : P?.label, fond_verso: fondVerso, accent: ds.accent, couleur_textes: ds.ink || 'auto',
        zoom: ds.zoom, cadrage: `${ds.posX} % / ${ds.posY} %`, assombrir: ds.dim, assombrir_verso: ds.backDim,
        fond_fichier: ds.uploadData || undefined, fond_verso_fichier: ds.backUploadData || undefined } : {}),
      logo_fichier: ds.logoData || undefined,
    } : null;
    const files = [ds.logoName, sig && ds.uploadName, sig && ds.backUploadName].filter((x): x is string => Boolean(x));
    const now = new Date().toISOString();
    const payload: LeadBase & Record<string, unknown> = {
      intent: 'maquette',
      intentLabel: `${designer ? DESIGNER.send[tier] : 'Maquette'} — carte ${T.label}`,
      products: [`Carte ${T.label}`], sector: '', name: d.name.trim(), company: d.company.trim(), role: d.role.trim(),
      phone: d.phone.trim(), email: d.email.trim(), city: '', prefer: '',
      message: [`Fonction : ${d.role.trim() || '—'}`,
        design ? `Design : recto logo (${design.logo}, taille ${design.taille_logo} %)${sig ? ` · fond ${design.fond} · verso ${design.fond_verso} · accent ${design.accent} · textes ${design.couleur_textes}` : ''}` : null,
        design && files.length ? `Fichiers : ${files.join(', ')} (joints à cet e-mail)` : null,
        `Consentement marketing : ${optin ? 'OUI' : 'NON'} (${now})`].filter(Boolean).join('\n'),
      design, consent_marketing: optin, consent_text: optin ? STUDIO.optin : '', consent_at: now, source: designer ? 'configurateur' : 'card-studio', page: window.location.pathname,
    };
    // Fichiers prêts à imprimer (Evolis, 300 dpi) : exactement la carte que le client vient de valider
    const pf = await renderCard({ tier, ds: { ...ds, bgImg: P?.img, backImg: PB?.img }, fields: { name: d.name.trim(), role: d.role.trim(), company: d.company.trim(), phone: d.phone.trim(), email: d.email.trim() }, url: ficheUrl(slug), logoFallback: '/images/logo-blanc.webp' });
    payload.print = { slug, url_fiche: ficheUrl(slug), recto: pf.recto, verso: pf.verso, fiche: pf.fiche };
    setPrint(pf);
    await new Promise((r) => setTimeout(r, 600));
    try { const r = await sendLead(payload); track('studio_submit', { tier, optin, intent: payload.intent, mode: r.mode }); setState(r.mode === 'mailto' && files.length ? 'done-attach' : 'done'); }
    catch (e) { setState('fail'); }
  };

  const v = (k: FieldKey) => d[k].trim();
  const Line = ({ k, className, icon }: { k: FieldKey; className: string; icon?: string }) => (
    <span className={`cs-l ${className}${v(k) ? '' : ' ph'}${focus === k ? ' typing' : ''}`}>
      {icon && <Icon id={icon} />}<span className="cs-t">{v(k) || STUDIO.fields.find((f) => f.k === k)!.ph}</span>
    </span>
  );
  // Adresse de la fiche réservée dès la saisie : le QR du verso et la puce NFC pointeront dessus (unicité vérifiée par le serveur)
  const slug = slugify(d.name || d.company) || 'votre-fiche';
  const photoF = sig && (ds.upload || P?.img);
  const bgFront: CSSProperties | undefined = photoF ? { backgroundImage: `url(${ds.upload || P?.img})`, backgroundSize: `${ds.zoom}% auto`, backgroundPosition: `${ds.posX}% ${ds.posY}%` } : undefined;
  const backImg = ds.back === 'upload' ? ds.backUpload : ds.back === 'same' ? (ds.upload || P?.img) : PB?.img;
  const bgBack: CSSProperties | undefined = sig && backImg ? { backgroundImage: `url(${backImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;
  const backPreset = ds.back === 'same' ? (ds.upload ? 'upload' : ds.bg) : ds.back;
  const sendLabel = designer ? DESIGNER.send[tier] : STUDIO.send;
  const done = state === 'done' || state === 'done-attach';
  const H = designer ? DESIGNER : STUDIO;
  const fileBtn = (kind: FileKind, label: string, has: string | null) => (
    <label className="cs-filebtn"><input type="file" accept="image/*" onChange={(e) => { readFile(e.target.files?.[0], kind); e.target.value = ''; }} />
      {has ? <img src={has} alt="" /> : <Icon id="i-card" />}<span>{has ? DESIGNER.replace : label}</span></label>
  );

  return (
    <section className={`studio${designer ? ' designer' : ''}`} id={id}>
      <div className="wrap cs-grid">
        <div className="cs-left">
          <p className="label">{H.label}</p>
          <h2 className="h2">{H.title} <em className="red">{H.red}</em></h2>
          <p className="cs-p">{H.text}</p>

          <div className="cs-tiers" role="radiogroup" aria-label="Niveau de carte">
            {STUDIO.tiers.map((t) => <button key={t.id} type="button" role="radio" aria-checked={tier === t.id} className={tier === t.id ? 'on' : ''} onClick={() => pickTier(t.id)}>{t.label}</button>)}
          </div>
          <p className="cs-note">{designer && ess ? DESIGNER.essNote : T.note}</p>

          {designer && (
            <div className={`cs-design${!ess ? ' open' : ''}`} aria-hidden={ess}>
              <div className="cs-dz">
                <p className="cs-dk"><Icon id="i-pen" />{DESIGNER.panel} · {T.label}</p>
                <div className="cs-faces"><button type="button" className={!back ? 'on' : ''} onClick={() => setBack(false)}>{DESIGNER.faceFront}</button><button type="button" className={back ? 'on' : ''} onClick={() => setBack(true)}>{DESIGNER.faceBack}</button></div>

                {!back ? (<>
                  <p className="cs-sk">{DESIGNER.logoLabel}</p>
                  <div className="cs-logo-ctl">{fileBtn('logo', DESIGNER.uploadLogo, ds.logo)}{ds.logo && <button type="button" className="cs-mini" onClick={() => setDs((x) => ({ ...x, logo: null, logoName: '', logoData: '' }))}>{DESIGNER.remove}</button>}</div>
                  <label className="cs-sl"><span>{DESIGNER.logoSize}</span><input type="range" min="30" max="95" value={ds.logoSize} onChange={(e) => setDesign('logoSize', Number(e.target.value), 'front')} style={cssVars({ '--p': (ds.logoSize - 30) / 65 })} /></label>
                  <p className="cs-hint">{DESIGNER.logoHint}</p>
                  {sig && (<>
                    <p className="cs-sk">{DESIGNER.bgLabel}</p>
                    <div className="cs-presets" role="radiogroup" aria-label={DESIGNER.bgLabel}>
                      {DESIGNER.presets.map((p) => <button key={p.id} type="button" role="radio" aria-checked={ds.bg === p.id} className={`pz pz-${p.id}${ds.bg === p.id ? ' on' : ''}`} onClick={() => setDesign('bg', p.id, 'front')} style={p.img ? { backgroundImage: `url(${p.img})` } : undefined}><span>{p.label}</span></button>)}
                      <label className={`pz pz-up${ds.bg === 'upload' ? ' on' : ''}`} style={ds.upload ? { backgroundImage: `url(${ds.upload})` } : undefined}><input type="file" accept="image/*" onChange={(e) => { readFile(e.target.files?.[0], 'bg'); e.target.value = ''; }} /><Icon id="i-scan" /><span>{ds.upload ? DESIGNER.replace : DESIGNER.upload}</span></label>
                    </div>
                    {photoF && <div className="cs-tune"><p className="cs-sk">{DESIGNER.tuneLabel}</p>
                      {([['zoom', DESIGNER.zoom, 100, 250], ['posX', DESIGNER.posX, 0, 100], ['posY', DESIGNER.posY, 0, 100], ['dim', DESIGNER.dim, 0, 85]] as const).map(([k, l, a, b]) => (
                        <label key={k} className="cs-sl"><span>{l}</span><input type="range" min={a} max={b} value={ds[k]} onChange={(e) => setDesign(k, Number(e.target.value), 'front')} style={cssVars({ '--p': (ds[k] - a) / (b - a) })} /></label>))}</div>}
                  </>)}
                </>) : (<>
                  {sig ? (<>
                    <p className="cs-sk">{DESIGNER.backLabel}</p>
                    <div className="cs-presets" role="radiogroup" aria-label={DESIGNER.backLabel}>
                      <button type="button" role="radio" aria-checked={ds.back === 'same'} className={`pz pz-same${ds.back === 'same' ? ' on' : ''}`} onClick={() => setDesign('back', 'same', 'back')}><span>{DESIGNER.sameAsFront}</span></button>
                      {DESIGNER.presets.map((p) => <button key={p.id} type="button" role="radio" aria-checked={ds.back === p.id} className={`pz pz-${p.id}${ds.back === p.id ? ' on' : ''}`} onClick={() => setDesign('back', p.id, 'back')} style={p.img ? { backgroundImage: `url(${p.img})` } : undefined}><span>{p.label}</span></button>)}
                      <label className={`pz pz-up${ds.back === 'upload' ? ' on' : ''}`} style={ds.backUpload ? { backgroundImage: `url(${ds.backUpload})` } : undefined}><input type="file" accept="image/*" onChange={(e) => { readFile(e.target.files?.[0], 'back'); e.target.value = ''; }} /><Icon id="i-scan" /><span>{ds.backUpload ? DESIGNER.replace : DESIGNER.upload}</span></label>
                    </div>
                    {backImg && <label className="cs-sl"><span>{DESIGNER.backDim}</span><input type="range" min="0" max="90" value={ds.backDim} onChange={(e) => setDesign('backDim', Number(e.target.value), 'back')} style={cssVars({ '--p': ds.backDim / 90 })} /></label>}
                  </>) : <p className="cs-hint">Verso Pro : vos coordonnées et votre QR code, sur le design Pro. Fonds et couleurs personnalisables en Signature.</p>}
                </>)}

                {sig && (
                  <div className="cs-row2">
                    <div><p className="cs-sk">{DESIGNER.accentLabel}</p>
                      <div className="cs-swatches" role="radiogroup" aria-label={DESIGNER.accentLabel}>
                        {DESIGNER.accents.map((c) => <button key={c} type="button" role="radio" aria-checked={ds.accent === c} className={ds.accent === c ? 'on' : ''} style={cssVars({ '--c': c })} onClick={() => setDesign('accent', c)} aria-label={c} />)}
                        <label className="cs-color" aria-label="Accent personnalisé"><input type="color" value={ds.accent} onChange={(e) => setDesign('accent', e.target.value)} /></label></div></div>
                    <div><p className="cs-sk">{DESIGNER.inkLabel}</p>
                      <div className="cs-swatches" role="radiogroup" aria-label={DESIGNER.inkLabel}>
                        <button type="button" role="radio" aria-checked={!ds.ink} className={`auto${!ds.ink ? ' on' : ''}`} onClick={() => setDesign('ink', null)}>{DESIGNER.inkAuto}</button>
                        {DESIGNER.inks.map((c) => <button key={c} type="button" role="radio" aria-checked={ds.ink === c} className={ds.ink === c ? 'on' : ''} style={cssVars({ '--c': c })} onClick={() => setDesign('ink', c)} aria-label={c} />)}
                        <label className="cs-color" aria-label="Couleur des textes personnalisée"><input type="color" value={ds.ink || '#ffffff'} onChange={(e) => setDesign('ink', e.target.value)} /></label></div></div>
                  </div>
                )}
                <p className="cs-hint">{DESIGNER.fileHint} {DESIGNER.drop}.</p>
                {err.file && <p className="ld-err" role="alert">{err.file}</p>}
                <button type="button" className="cs-mini" onClick={() => setDs(D0)}>{DESIGNER.reset}</button>
              </div>
            </div>
          )}

          {done ? (
            <div className="cs-done" role="status">
              <span className="cs-done-ic"><Icon id="i-check" /></span>
              <div><b>{STUDIO.done.title}</b><span>{STUDIO.done.text}</span><small>{STUDIO.done.promise}</small>{state === 'done-attach' && <small className="cs-attach">{DESIGNER.attach}</small>}
                {print && <div className="cs-print"><p><Icon id="i-check" />Votre carte est prête à imprimer · {CARD.format}</p><div>{([['recto', 'Recto'], ['verso', 'Verso']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => download(print[k], `carte-${slug}-${k}-300dpi.png`)}><img src={print[k]} alt={`${l} prêt à imprimer`} /><span>{l} · télécharger</span></button>)}</div></div>}</div>
              <button className="btn btn-line dark" onClick={() => setState('edit')}>{STUDIO.done.edit}</button>
            </div>
          ) : (
            <form className="cs-form" onSubmit={submit} noValidate>
              {STUDIO.fields.map((f) => (
                <label key={f.k} className={`fl${err[f.k] ? ' bad' : ''}${f.k === 'name' || f.k === 'email' ? ' wide' : ''}`}>
                  <input type={f.type || 'text'} placeholder=" " autoComplete={f.auto} value={d[f.k]} maxLength={48}
                    onChange={(e) => set(f.k, e.target.value)} onFocus={() => onFieldFocus(f.k)} onBlur={() => setFocus(null)} aria-invalid={!!err[f.k]} disabled={state === 'encoding'} />
                  <span>{f.label}{f.req ? ' *' : ''}</span>{err[f.k] && <em role="alert">{err[f.k]}</em>}
                </label>
              ))}
              {err.reach && <p className="ld-err wide" role="alert">{err.reach}</p>}
              {state === 'fail' && <p className="ld-err wide" role="alert">L’envoi a échoué. Réessayez ou appelez-nous.</p>}
              <label className="cs-opt wide"><input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)} /><span className="cs-box" aria-hidden="true"><Icon id="i-check" /></span><span>{STUDIO.optin}</span></label>
              <p className="cs-info wide">{STUDIO.info}</p>
              <button type="submit" className="btn btn-red wide" disabled={state === 'encoding'}>{state === 'encoding' ? 'Encodage…' : sendLabel} <Icon id="arr" /></button>
            </form>
          )}
        </div>

        <div className="cs-right">
            <div className={`cs-card t-${tier} dz-mode${back ? ' back' : ''}${state === 'encoding' ? ' enc' : ''}${done ? ' ok' : ''}${drag ? ' drag' : ''}`}
              ref={card} onPointerMove={move} onPointerLeave={leave} aria-label="Aperçu de votre carte"
              onDragOver={(e) => { if (sig || pro) { e.preventDefault(); setDrag(true); } }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
              style={cssVars({ '--acc': sig ? ds.accent : undefined, '--inkF': inkFront, '--inkB': inkBack })}>
              <div className="cs-rot">
                <>
                  {/* RECTO : le logo */}
                  <div className={`cs-face cs-front face-logo${sig ? ` pr-${ds.upload ? 'upload' : ds.bg}` : ''}`}>
                    {sig && <span className="cs-bg" style={bgFront} aria-hidden="true" />}
                    {photoF && <span className="cs-dim" style={{ opacity: ds.dim / 100 }} aria-hidden="true" />}
                    <span className="cs-nfc"><Icon id="nfc" /></span>
                    <div className="cs-logo-zone" style={cssVars({ '--ls': ds.logoSize })}>
                      {ess ? <img src="/images/logo-blanc.webp" alt="Support Connecté" /> : ds.logo ? <img src={ds.logo} alt="" /> : <span className={`cs-logo-txt${v('company') || v('name') ? '' : ' ph'}`}>{v('company') || v('name') || 'Votre logo'}</span>}
                    </div>
                    <span className="cs-rule front" />
                    <span className="cs-beam" aria-hidden="true" /><span className="cs-glare" aria-hidden="true" />
                    <span className="cs-dropzone" aria-hidden="true"><Icon id="i-scan" />{DESIGNER.drop}</span>
                  </div>
                  {/* VERSO : coordonnées + QR discret en bas à droite */}
                  <div className={`cs-face cs-back face-info${sig ? ` pr-${backPreset}` : ''}`}>
                    {sig && <span className="cs-bg" style={bgBack} aria-hidden="true" />}
                    {sig && backImg && <span className="cs-dim" style={{ opacity: ds.backDim / 100 }} aria-hidden="true" />}
                    <div className="cs-fields">
                      <Line k="name" className="cs-nm big" />
                      <Line k="role" className="cs-ro" />
                      <span className="cs-rule" />
                      {v('company') && <Line k="company" className="cs-ln co" icon="i-card" />}
                      <Line k="phone" className="cs-ln" icon="i-phone" />
                      <Line k="email" className="cs-ln" icon="i-mail" />
                    </div>
                    <span className="cs-qr sm"><QR text={ficheUrl(slug)} size={120} /></span>
                    <span className="cs-glare" aria-hidden="true" />
                    {sig && <span className="cs-dropzone" aria-hidden="true"><Icon id="i-scan" />{DESIGNER.drop}</span>}
                  </div>
                </>
              </div>
              <span className="cs-waves" aria-hidden="true"><i /><i /><i /></span>
            </div>
          <div className="cs-tools">
            <button type="button" className="cs-flip" onClick={() => setBack((b) => !b)}><Icon id="i-sync" />{back ? STUDIO.front : STUDIO.flip}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
