import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../admin.service';
import { errMsg } from '../../../lib/apiError';
import { Badge, Btn, ConfirmModal, Empty, Field, Icon, Seg, useAction, useToast } from '../components/ui';
import { useData, useDebounced } from '../hooks/useData';
import type { QrApercu, QrContenu, QrDots, QrEye, QrFormat, QrRenderInput, QrStyle, QrStyleItem } from '../../../types/admin';

const FORMATS: readonly (readonly [QrFormat, string])[] = [['png', 'PNG'], ['svg', 'SVG'], ['jpeg', 'JPEG'], ['webp', 'WebP'], ['pdf', 'PDF']];
const FORMAT_AIDE: Record<QrFormat, string> = {
  png: 'Image, fond transparent possible.', svg: 'Vectoriel : net à toutes les tailles, idéal pour imprimer.',
  jpeg: 'Image légère, sans transparence.', webp: 'Image web moderne.', pdf: 'Prêt à imprimer (300 dpi).',
};
const DOTS: readonly (readonly [QrDots, string])[] = [['square', 'Carrés'], ['rounded', 'Arrondis'], ['dots', 'Ronds'], ['diamond', 'Losanges']];
const EYES: readonly (readonly [QrEye, string])[] = [['square', 'Carré'], ['rounded', 'Arrondi'], ['circle', 'Rond']];
const MAX_LOGO = 1_000_000; // octets (le back accepte ~1 Mo d'image)

// Réglages du style tels qu'ils sont saisis dans le formulaire.
interface StyleForm {
  foreground: string; background: string; transparent: boolean;
  gradient: boolean; gType: 'linear' | 'radial'; gFrom: string; gTo: string; gAngle: number;
  dots: QrDots; frame: QrEye; pupil: QrEye; eyeColor: boolean; frameColor: string; pupilColor: string;
  logo: string | null; logoPct: number; logoShape: 'square' | 'circle';
  label: string; size: number; margin: number;
}
const DEFAULT_STYLE: StyleForm = {
  foreground: '#000000', background: '#ffffff', transparent: false,
  gradient: false, gType: 'linear', gFrom: '#1d4ed8', gTo: '#9333ea', gAngle: 45,
  dots: 'square', frame: 'square', pupil: 'square', eyeColor: false, frameColor: '#000000', pupilColor: '#000000',
  logo: null, logoPct: 20, logoShape: 'square',
  label: '', size: 1024, margin: 4,
};

const toStyle = (f: StyleForm): QrStyle => ({
  size: f.size, margin: f.margin,
  foreground: f.foreground, background: f.transparent ? 'transparent' : f.background,
  gradient: f.gradient ? { type: f.gType, from: f.gFrom, to: f.gTo, ...(f.gType === 'linear' ? { angle: f.gAngle } : {}) } : null,
  dots: f.dots,
  eyes: { frame: f.frame, pupil: f.pupil, frameColor: f.eyeColor ? f.frameColor : null, pupilColor: f.eyeColor ? f.pupilColor : null },
  logo: f.logo ? { dataUrl: f.logo, sizePct: f.logoPct, shape: f.logoShape } : null,
  label: f.label.trim() ? { text: f.label.trim() } : null,
});

// Reconstruit le formulaire depuis un style enregistré (les valeurs absentes reprennent les défauts).
const fromStyle = (s: QrStyle): StyleForm => ({
  ...DEFAULT_STYLE,
  foreground: s.foreground ?? DEFAULT_STYLE.foreground,
  background: s.background && s.background !== 'transparent' ? s.background : DEFAULT_STYLE.background,
  transparent: s.background === 'transparent',
  gradient: !!s.gradient, gType: s.gradient?.type ?? 'linear', gFrom: s.gradient?.from ?? DEFAULT_STYLE.gFrom, gTo: s.gradient?.to ?? DEFAULT_STYLE.gTo, gAngle: s.gradient?.angle ?? 45,
  dots: s.dots ?? 'square', frame: s.eyes?.frame ?? 'square', pupil: s.eyes?.pupil ?? 'square',
  eyeColor: !!(s.eyes?.frameColor || s.eyes?.pupilColor),
  frameColor: s.eyes?.frameColor ?? s.foreground ?? '#000000', pupilColor: s.eyes?.pupilColor ?? s.foreground ?? '#000000',
  logo: s.logo?.dataUrl ?? null, logoPct: s.logo?.sizePct ?? 20, logoShape: s.logo?.shape ?? 'square',
  label: s.label?.text ?? '', size: s.size ?? 1024, margin: s.margin ?? 4,
});

interface ContentForm {
  type: 'lien' | 'wifi';
  url: string; utmOn: boolean; utmSource: string; utmMedium: string; utmCampaign: string;
  ssid: string; password: string; encryption: 'WPA' | 'WEP' | 'nopass'; hidden: boolean;
}
const DEFAULT_CONTENT: ContentForm = { type: 'lien', url: '', utmOn: false, utmSource: '', utmMedium: '', utmCampaign: '', ssid: '', password: '', encryption: 'WPA', hidden: false };

// Mêmes règles que le back (qrcode.schemas.ts) : on n'appelle l'API que si le contenu est valide.
function buildContenu(c: ContentForm): { contenu: QrContenu | null; hint: string } {
  if (c.type === 'lien') {
    const url = c.url.trim();
    if (!url) return { contenu: null, hint: 'Saisis un lien pour voir le QR code.' };
    if (!/^https?:\/\/\S+\.\S+/i.test(url)) return { contenu: null, hint: 'Le lien doit commencer par http:// ou https://.' };
    const utm: Record<string, string> = {};
    if (c.utmOn) { if (c.utmSource.trim()) utm.source = c.utmSource.trim(); if (c.utmMedium.trim()) utm.medium = c.utmMedium.trim(); if (c.utmCampaign.trim()) utm.campaign = c.utmCampaign.trim(); }
    return { contenu: { type: 'lien', url, ...(Object.keys(utm).length ? { utm } : {}) }, hint: '' };
  }
  const ssid = c.ssid.trim();
  if (!ssid) return { contenu: null, hint: 'Saisis le nom du réseau Wi-Fi.' };
  if (c.encryption !== 'nopass') {
    const n = c.password.length;
    if (!n) return { contenu: null, hint: 'Saisis le mot de passe du réseau.' };
    if (c.encryption === 'WPA' && (n < 8 || n > 63)) return { contenu: null, hint: 'Un mot de passe WPA fait entre 8 et 63 caractères.' };
    if (c.encryption === 'WEP' && ![5, 10, 13, 26].includes(n)) return { contenu: null, hint: 'Une clé WEP fait 5, 10, 13 ou 26 caractères.' };
  }
  return { contenu: { type: 'wifi', ssid, encryption: c.encryption, ...(c.encryption !== 'nopass' ? { password: c.password } : {}), ...(c.hidden ? { hidden: true } : {}) }, hint: '' };
}

const Color = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <Field label={label}><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="qr-color" /></Field>
);
const Toggle = ({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: string }) => (
  <label className="toggle"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span />{children}</label>
);

export default function QrCodes() {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const run = useAction();
  const [content, setContent] = useState<ContentForm>(() => ({
    ...DEFAULT_CONTENT,
    url: searchParams.get('url') ?? '',
  }));
  const [style, setStyle] = useState<StyleForm>(DEFAULT_STYLE);
  const [nom, setNom] = useState(() => searchParams.get('nom') ?? '');
  const [format, setFormat] = useState<QrFormat>('png');
  const [preview, setPreview] = useState<QrApercu | null>(null);
  const [previewErr, setPreviewErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [current, setCurrent] = useState<QrStyleItem | null>(null); // style enregistré chargé dans le formulaire
  const [styleName, setStyleName] = useState('');
  const [toDelete, setToDelete] = useState<QrStyleItem | null>(null);
  const [styles, reloadStyles, stylesErr] = useData(() => adminApi.qrListStyles());
  const fileRef = useRef<HTMLInputElement>(null);

  const setC = (p: Partial<ContentForm>) => setContent((c) => ({ ...c, ...p }));
  const setS = (p: Partial<StyleForm>) => setStyle((s) => ({ ...s, ...p }));

  const { contenu, hint } = useMemo(() => buildContenu(content), [content]);
  const body: QrRenderInput | null = useMemo(() => (contenu ? { contenu, style: toStyle(style), ...(nom.trim() ? { nom: nom.trim() } : {}) } : null), [contenu, style, nom]);
  const key = useDebounced(body ? JSON.stringify(body) : '', 450);

  // Aperçu en direct : on ignore les réponses devenues périmées.
  useEffect(() => {
    if (!key) { setPreview(null); setPreviewErr(''); setLoading(false); return; }
    let on = true; setLoading(true);
    adminApi.qrApercu(JSON.parse(key) as QrRenderInput)
      .then((r) => { if (on) { setPreview(r); setPreviewErr(''); } })
      .catch((e: unknown) => { if (on) { setPreview(null); setPreviewErr(errMsg(e)); } })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [key]);

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) return toast('Logo : PNG, JPEG, WebP ou SVG uniquement.', 'err');
    if (file.size > MAX_LOGO) return toast('Logo trop lourd (1 Mo maximum).', 'err');
    const r = new FileReader();
    r.onload = () => { setS({ logo: String(r.result) }); };
    r.onerror = () => toast('Lecture du logo impossible.', 'err');
    r.readAsDataURL(file);
  };

  const download = async () => {
    if (!body) return;
    setDownloading(true);
    const r = await run(() => adminApi.qrTelecharger(body, format));
    setDownloading(false);
    if (!r) return;
    const url = URL.createObjectURL(r.blob);
    const a = document.createElement('a');
    a.href = url; a.download = r.filename ?? `qrcode.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const applyStyle = async (it: QrStyleItem) => {
    const r = await run(() => adminApi.qrGetStyle(it.id));
    if (!r) return;
    setStyle(fromStyle(r.style.style)); setCurrent(it); setStyleName(it.nom);
    toast(`Style « ${it.nom} » appliqué`);
  };
  const saveNew = async () => {
    const nomStyle = styleName.trim();
    if (!nomStyle) return toast('Donne un nom au style.', 'err');
    const r = await run(() => adminApi.qrCreateStyle({ nom: nomStyle, style: toStyle(style) }), 'Style enregistré');
    if (r) { setCurrent({ id: r.style.id, nom: r.style.nom, avecLogo: !!style.logo, createdAt: r.style.createdAt, updatedAt: r.style.updatedAt }); reloadStyles(); }
  };
  const updateCurrent = async () => {
    if (!current) return;
    const r = await run(() => adminApi.qrUpdateStyle(current.id, { nom: styleName.trim() || current.nom, style: toStyle(style) }), 'Style mis à jour');
    if (r) { setCurrent({ ...current, nom: r.style.nom, avecLogo: !!style.logo }); reloadStyles(); }
  };
  const remove = async (it: QrStyleItem) => {
    const r = await run(() => adminApi.qrDeleteStyle(it.id), 'Style supprimé');
    setToDelete(null);
    if (r !== undefined) { if (current?.id === it.id) setCurrent(null); reloadStyles(); }
  };

  return (
    <>
      <header className="ph"><p className="eyebrow">Outils</p><h1>QR codes</h1>
        <p className="lede">Crée un QR code pour un lien ou un réseau Wi-Fi, personnalise-le, puis télécharge-le. Le contenu n’est jamais enregistré : seuls les styles peuvent l’être.</p></header>

      <div className="qr-layout">
        <div className="qr-form">
          <section className="panel">
            <div className="panel-h"><h2>Contenu</h2></div>
            <div className="form">
              <Seg value={content.type} onChange={(type) => setC({ type })} options={[['lien', 'Lien'], ['wifi', 'Wi-Fi']]} />
              {content.type === 'lien' ? <>
                <Field label="Adresse du lien"><input type="url" inputMode="url" placeholder="https://exemple.com" value={content.url} onChange={(e) => setC({ url: e.target.value })} /></Field>
                <Toggle checked={content.utmOn} onChange={(utmOn) => setC({ utmOn })}>Ajouter un suivi (UTM)</Toggle>
                {content.utmOn && <div className="f2 qr-utm">
                  <Field label="Source"><input placeholder="flyer" value={content.utmSource} onChange={(e) => setC({ utmSource: e.target.value })} /></Field>
                  <Field label="Support"><input placeholder="print" value={content.utmMedium} onChange={(e) => setC({ utmMedium: e.target.value })} /></Field>
                  <Field label="Campagne"><input placeholder="salon-2026" value={content.utmCampaign} onChange={(e) => setC({ utmCampaign: e.target.value })} /></Field>
                </div>}
              </> : <>
                <div className="f2">
                  <Field label="Nom du réseau (SSID)"><input maxLength={32} value={content.ssid} onChange={(e) => setC({ ssid: e.target.value })} /></Field>
                  <Field label="Sécurité"><select value={content.encryption} onChange={(e) => setC({ encryption: e.target.value as ContentForm['encryption'] })}>
                    <option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP (ancien)</option><option value="nopass">Réseau ouvert</option></select></Field>
                </div>
                {content.encryption !== 'nopass' && <Field label="Mot de passe" hint="Il n’est ni enregistré ni renvoyé par le serveur."><input type="text" autoComplete="off" maxLength={63} value={content.password} onChange={(e) => setC({ password: e.target.value })} /></Field>}
                <Toggle checked={content.hidden} onChange={(hidden) => setC({ hidden })}>Réseau masqué</Toggle>
              </>}
              <Field label="Nom du fichier" hint="Facultatif. Sert uniquement à nommer le téléchargement."><input maxLength={80} placeholder="flyer-salon" value={nom} onChange={(e) => setNom(e.target.value)} /></Field>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h"><h2>Apparence</h2>{current && <Badge tone="dark">Style : {current.nom}</Badge>}</div>
            <div className="form">
              <div className="qr-colors">
                <Color label="Couleur du code" value={style.foreground} onChange={(foreground) => setS({ foreground })} />
                {!style.transparent && <Color label="Fond" value={style.background} onChange={(background) => setS({ background })} />}
              </div>
              <div className="row-a left"><Toggle checked={style.transparent} onChange={(transparent) => setS({ transparent })}>Fond transparent</Toggle>
                <Toggle checked={style.gradient} onChange={(gradient) => setS({ gradient })}>Dégradé</Toggle></div>
              {style.gradient && <div className="qr-sub">
                <Seg value={style.gType} onChange={(gType) => setS({ gType })} options={[['linear', 'Linéaire'], ['radial', 'Radial']]} />
                <div className="qr-colors"><Color label="Départ" value={style.gFrom} onChange={(gFrom) => setS({ gFrom })} /><Color label="Arrivée" value={style.gTo} onChange={(gTo) => setS({ gTo })} /></div>
                {style.gType === 'linear' && <Field label={`Angle : ${style.gAngle}°`}><input type="range" min={0} max={360} step={5} value={style.gAngle} onChange={(e) => setS({ gAngle: Number(e.target.value) })} /></Field>}
              </div>}

              <div className="field"><span>Forme des points</span><Seg value={style.dots} onChange={(dots) => setS({ dots })} options={DOTS} /></div>
              <div className="f2">
                <div className="field"><span>Cadre des coins</span><Seg value={style.frame} onChange={(frame) => setS({ frame })} options={EYES} /></div>
                <div className="field"><span>Centre des coins</span><Seg value={style.pupil} onChange={(pupil) => setS({ pupil })} options={EYES} /></div>
              </div>
              <Toggle checked={style.eyeColor} onChange={(eyeColor) => setS({ eyeColor })}>Couleur propre aux coins</Toggle>
              {style.eyeColor && <div className="qr-colors qr-sub"><Color label="Cadre" value={style.frameColor} onChange={(frameColor) => setS({ frameColor })} /><Color label="Centre" value={style.pupilColor} onChange={(pupilColor) => setS({ pupilColor })} /></div>}

              <div className="field"><span>Logo</span>
                <div className="row-a left">
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ''; }} />
                  <Btn icon="plus" onClick={() => fileRef.current?.click()}>{style.logo ? 'Changer le logo' : 'Ajouter un logo'}</Btn>
                  {style.logo && <>{/* aperçu miniature */}<img className="qr-logo-prev" src={style.logo} alt="Logo" /><Btn icon="trash" onClick={() => setS({ logo: null })}>Retirer</Btn></>}
                </div>
              </div>
              {style.logo && <div className="f2 qr-sub">
                <Field label={`Taille : ${style.logoPct} %`} hint="Au-delà de 25 %, le code se lit moins bien."><input type="range" min={5} max={30} value={style.logoPct} onChange={(e) => setS({ logoPct: Number(e.target.value) })} /></Field>
                <div className="field"><span>Forme</span><Seg value={style.logoShape} onChange={(logoShape) => setS({ logoShape })} options={[['square', 'Carré'], ['circle', 'Rond']]} /></div>
              </div>}

              <Field label="Texte sous le QR code"><input maxLength={80} placeholder="Scannez-moi" value={style.label} onChange={(e) => setS({ label: e.target.value })} /></Field>
              <div className="f2">
                <Field label="Taille (pixels)"><input type="number" min={128} max={4000} step={64} value={style.size} onChange={(e) => setS({ size: Math.min(4000, Math.max(128, Number(e.target.value) || 1024)) })} /></Field>
                <Field label={`Marge : ${style.margin} modules`}><input type="range" min={0} max={10} value={style.margin} onChange={(e) => setS({ margin: Number(e.target.value) })} /></Field>
              </div>
            </div>
          </section>
        </div>

        <aside className="qr-side">
          <section className="panel qr-preview">
            <div className="panel-h"><h2>Aperçu</h2>{loading && <small>Mise à jour…</small>}</div>
            <div className={`qr-canvas${style.transparent ? ' checker' : ''}`}>
              {preview ? <img src={preview.dataUrl} alt={`QR code : ${preview.contenu}`} style={{ opacity: loading ? 0.5 : 1 }} />
                : <p className="adm-muted small qr-ph">{previewErr ? '' : hint || (loading ? 'Génération…' : '')}</p>}
            </div>
            {previewErr && <p className="err">{previewErr}</p>}
            {preview && <p className="adm-muted small qr-contenu">{preview.contenu}</p>}
            {preview?.avertissements.map((w) => <p key={w} className="note-gold qr-warn">{w}</p>)}
            <div className="qr-dl">
              <Seg value={format} onChange={setFormat} options={FORMATS} />
              <p className="adm-muted small">{FORMAT_AIDE[format]}</p>
              <Btn kind="red" icon="down" disabled={!body || !!previewErr || downloading} onClick={download}>{downloading ? 'Préparation…' : `Télécharger en ${format.toUpperCase()}`}</Btn>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h"><h2>Styles enregistrés</h2>{styles && <small>{styles.styles.length} / 20</small>}</div>
            {stylesErr ? <p className="err">{stylesErr}</p> : !styles ? <p className="adm-muted small">Chargement…</p> : styles.styles.length ? (
              <ul className="qr-styles">{styles.styles.map((s) => (
                <li key={s.id} className={current?.id === s.id ? 'on' : ''}>
                  <button type="button" className="qr-style-name" onClick={() => applyStyle(s)}><b>{s.nom}</b>{s.avecLogo && <small>avec logo</small>}</button>
                  <button type="button" className="icon-btn" aria-label={`Supprimer ${s.nom}`} onClick={() => setToDelete(s)}><Icon n="trash" s={16} /></button>
                </li>))}</ul>
            ) : <Empty>Aucun style enregistré.</Empty>}
            <div className="form qr-save">
              <Field label="Enregistrer l’apparence actuelle" hint="Couleurs, forme, logo et texte. Jamais le lien ni le mot de passe."><input maxLength={80} placeholder="Charte bleue" value={styleName} onChange={(e) => setStyleName(e.target.value)} /></Field>
              <div className="row-a left">
                <Btn kind="dark" icon="check" onClick={saveNew}>Nouveau style</Btn>
                {current && <Btn icon="refresh" onClick={updateCurrent}>Mettre à jour « {current.nom} »</Btn>}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {toDelete && <ConfirmModal title="Supprimer ce style ?" confirmLabel="Supprimer" danger onClose={() => setToDelete(null)} onConfirm={() => remove(toDelete)}>
        <p>Le style « {toDelete.nom} » sera supprimé définitivement. Les QR codes déjà téléchargés ne changent pas.</p></ConfirmModal>}
    </>
  );
}
