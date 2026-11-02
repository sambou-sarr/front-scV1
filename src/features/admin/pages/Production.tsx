import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../admin.service';
import { SectionStickersTab } from '../components/SectionStickers';
import { Badge, Btn, Empty, ErrorBox, Icon, Kpi, Loading, Modal, Tabs, useAction, useToast } from '../components/ui';
import { useData } from '../hooks/useData';
import { NouveauStickerModal } from '../components/ProductionModals';
import { FORMULE_TONE, ago, fdate } from '../lib/format';
import { CARD, download, phoneStickerSVG, stickerSVG, svgDataUrl, svgToPng } from '../lib/print';
import { qrPayload } from '../../../lib/qr';
import type { Carte, ModeleCarte, QrLien, StatutCarte, StatutSticker, Sticker } from '../../../types/admin';
import { carteStatusOptions, FN, LBL, PS, SS, TITLE, TONE, VAL } from '../lib/production';

/*
  Production : tout ce qu'il faut pour imprimer, encoder, paramétrer et tester.
  • Cartes (Evolis) : modèle actif par formule en aperçu, adresse à encoder dans la puce NFC, suivi imprimée → encodée → testée → livrée.
  • Stickers à fonction : paramètres (Wi-Fi, liens…), QR dynamique à régler, fichier vectoriel.
  • Stickers téléphone 30 mm : copie du QR de la fiche, personnalisation, fichier.
  • QR dynamiques : cible modifiable à distance, scans.
  L'aperçu des cartes utilise le modèle actif configuré pour leur formule.
*/
type Vue = { type: 'carte'; c: Carte; modele: ModeleCarte | null } | { type: 'sticker'; x: Sticker };
type Creation = null | 'sticker';
type CardStatusFilter = StatutCarte | 'tous';
type StickerStatusFilter = StatutSticker | 'tous';

const CARD_FILTER_LABELS: Record<CardStatusFilter, string> = {
  tous: 'Tous les statuts',
  a_imprimer: PS.a_imprimer,
  imprimee: PS.imprimee,
  encodee: PS.encodee,
  testee: PS.testee,
  livree: PS.livree,
  annulee: PS.annulee,
};
const STICKER_FILTER_LABELS: Record<StickerStatusFilter, string> = {
  tous: 'Tous les statuts',
  a_parametrer: SS.a_parametrer,
  parametre: SS.parametre,
  teste: SS.teste,
  imprime: SS.imprime,
  livre: SS.livre,
  annule: SS.annule,
};

const wifiParams = (p: Sticker['parametres']) => ({
  ssid: String(p?.ssid ?? ''), password: String(p?.password ?? ''), security: (p?.security as 'WPA' | 'WEP' | 'aucune' | undefined) ?? 'WPA', hidden: p?.hidden === true,
});

const stickerFile = (x: Sticker): string => x.kind === 'telephone'
  ? phoneStickerSVG({ url: x.ficheUrl ?? '', qrColor: x.personnalisation?.couleur_qr, bg: x.personnalisation?.fond, ring: x.personnalisation?.texte === 'aucun' ? '' : x.personnalisation?.texte, ringColor: '#0b0b0c' })
  : stickerSVG({
    sizeCm: x.tailleMm / 10, shape: x.forme ?? undefined, theme: x.theme ?? undefined, title: TITLE[x.fonction ?? 'lien'],
    subtitle: String(x.parametres?.etablissement || (x.fonction === 'wifi' ? `Réseau : ${x.parametres?.ssid ?? ''}` : 'Scannez avec votre téléphone')),
    qrText: x.qrMode === 'wifi' ? qrPayload.wifi(wifiParams(x.parametres)) : (x.qr?.url ?? ''), nfc: x.options?.nfc,
  });

function CopyLink({ text }: { text: string }) {
  const toast = useToast();
  return <button type="button" className="link small" onClick={() => navigator.clipboard.writeText(text).then(() => toast('Copié'), () => toast('Copie impossible', 'err'))}>Copier</button>;
}
const client = (f: { entreprise: string; nom: string } | null) => f?.entreprise || f?.nom || '—';

export default function Production() {
  const [sum, rSum, eSum] = useData(() => adminApi.productionSummary());
  const [cartes, rC, eC] = useData(() => adminApi.listCartes());
  const [stickers, rS, eS] = useData(() => adminApi.listStickers());
  const [qr, rQ, eQ] = useData(() => adminApi.listQr());
  const [sec, rSec, eSec] = useData(() => adminApi.listSectionStickers());
  const [modeles, rM, eM] = useData(() => adminApi.listModelesCartes());
  const [tab, setTab] = useState<'cartes' | 'fonction' | 'telephone' | 'qr' | 'sections'>('cartes');
  const [cardStatus, setCardStatus] = useState<CardStatusFilter>('tous');
  const [stickerStatus, setStickerStatus] = useState<StickerStatusFilter>('tous');
  const [vue, setVue] = useState<Vue | null>(null), [creation, setCreation] = useState<Creation>(null), [busy, setBusy] = useState<string | null>(null);
  const run = useAction();

  const refresh = () => { rSum(); rC(); rS(); rQ(); rSec(); rM(); };
  const err = eSum || eC || eS || eQ || eM;
  if (err) return <ErrorBox message={err} onRetry={refresh} />;
  if (!sum || !cartes || !stickers || !qr || !modeles) return <Loading />;

  const fonc = stickers.stickers.filter((x) => x.kind === 'fonction'), tel = stickers.stickers.filter((x) => x.kind === 'telephone');
  const cartesFiltrees = cartes.cartes.filter(c => cardStatus === 'tous' || c.statut === cardStatus);
  const foncFiltrees = fonc.filter(x => stickerStatus === 'tous' || x.statut === stickerStatus);
  const telFiltrees = tel.filter(x => stickerStatus === 'tous' || x.statut === stickerStatus);
  const getFile = async (key: string, make: () => Promise<string>, name: string) => { setBusy(key); try { download(await make(), name); } finally { setBusy(null); } };
  const setCarte = (c: Carte, statut: StatutCarte) => run(() => adminApi.updateCarte(c.id, { statut }), `Carte /${c.fiche?.slug ?? c.id} : ${PS[statut]}`).then((r) => r && refresh());
  const setSticker = (x: Sticker, statut: StatutSticker) => run(() => adminApi.updateSticker(x.id, { statut }), `Sticker : ${SS[statut]}`).then((r) => r && refresh());
  const statutSelect = <S extends string>(value: S, labels: Record<S, string>, onChange: (s: S) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value as S)}>{Object.entries(labels).map(([k, l]) => <option key={k} value={k}>{l as string}</option>)}</select>
  );

  return (
    <>
      <header className="ph row">
        <div><p className="eyebrow">Atelier</p><h1>Production</h1><p className="lede">Les commandes de cartes affichent l’aperçu du modèle actif par formule et l’adresse à encoder dans la puce. Les stickers arrivent classés par fonction, avec tout ce qu’il faut pour les paramétrer.</p></div>
        <div className="ph-actions"><Btn icon="plus" onClick={() => setCreation('sticker')}>Nouveau sticker</Btn></div>
      </header>

      <section className="kpis">
        <Kpi icon="card" label="Cartes à imprimer" value={sum.cartesAImprimer} sub={CARD.format.split(' · ')[0]} tone={sum.cartesAImprimer ? 'hot' : undefined} onClick={() => setTab('cartes')} />
        <Kpi icon="gear" label="Stickers à paramétrer" value={sum.stickersAParametrer.fonction + sum.stickersAParametrer.telephone} sub={`${sum.stickersAParametrer.fonction} à fonction · ${sum.stickersAParametrer.telephone} téléphone`}
          tone={sum.stickersAParametrer.fonction + sum.stickersAParametrer.telephone ? 'warn' : undefined} onClick={() => setTab('fonction')} />
        <Kpi icon="zap" label="QR dynamiques sans cible" value={sum.qrSansCible} sub="à régler avant impression" tone={sum.qrSansCible ? 'down' : undefined} onClick={() => setTab('qr')} />
        <Kpi icon="eye" label="Scans des QR dynamiques" value={sum.scansQr} sub="cumul" />
      </section>
      <Tabs value={tab} onChange={setTab} tabs={[['cartes', 'Cartes · Evolis', cartes.cartes.length], ['fonction', 'Stickers à fonction', fonc.length], ['telephone', 'Stickers 30 mm', tel.length], ['qr', 'QR dynamiques', qr.qr.length], ['sections', 'Stickers par section', (sec?.demandes ?? []).filter((d) => d.statut === 'demande').length]]} />

      {tab === 'cartes' && <>
        <label className="prod-status-filter">Filtrer les cartes par statut
          <select aria-label="Filtrer les cartes par statut" value={cardStatus} onChange={e => setCardStatus(e.target.value as CardStatusFilter)}>
            {Object.entries(CARD_FILTER_LABELS).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
          </select>
        </label>
        {cartesFiltrees.length ? <div className="table-wrap"><table className="adm-tbl">
        <thead><tr><th>Client</th><th>Carte</th><th>Puce NFC : adresse à encoder</th><th>Modèle actif</th><th>Statut</th></tr></thead>
        <tbody>{cartesFiltrees.map((c) => (
          <tr key={c.id}>
            <td data-l="Client">{c.fiche?.id ? <Link to={`/admin/fiches/${c.fiche.id}`}><b>{client(c.fiche)}</b></Link> : <b>{client(c.fiche)}</b>}<small>{c.fiche?.nom} · {fdate(c.createdAt)}</small>
              {c.adresseLivraison && <small>Livraison : {c.adresseLivraison}</small>}
              {c.telephoneLivraison && <small>Tél. livraison : {c.telephoneLivraison}</small>}
              {c.notesClient && <small>Précisions client : {c.notesClient}</small>}
              {c.montantFcfa != null && <small>À encaisser à la livraison : {c.montantFcfa.toLocaleString('fr-FR')} FCFA</small>}
            </td>
            <td data-l="Carte"><Badge tone={FORMULE_TONE[c.tier]}>{c.tier}</Badge><small>/{c.fiche?.slug}</small></td>
            <td data-l="Puce NFC"><code className="nfc">{c.nfcUrl}</code><CopyLink text={c.nfcUrl} />
              {c.adresseChangee && <small className="adm-red">L’adresse de la fiche a changé : la puce déjà écrite ne mène plus à la fiche. À ré-encoder.</small>}</td>
            <td data-l="Modèle actif"><div className="row-a left">
              <Btn icon="eye" onClick={() => setVue({ type: 'carte', c, modele: modeles.modeles.find(m => m.tier === c.tier && m.actif) ?? null })}>Aperçu</Btn>
              <small>{modeles.modeles.find(m => m.tier === c.tier && m.actif)?.nom ?? `Aucun modèle actif pour ${c.tier}`}</small>
            </div>
            </td>
            <td data-l="Statut"><select aria-label={`Statut de la carte ${c.id}`} value={c.statut} onChange={(e) => setCarte(c, e.target.value as StatutCarte)}>
              <option value={c.statut}>{PS[c.statut]}</option>
              {carteStatusOptions(c.statut).slice(1).map((statut) => <option key={statut} value={statut}>{PS[statut]}</option>)}
            </select></td>
          </tr>))}
        </tbody></table></div> : <Empty>{cartes.cartes.length ? 'Aucune carte pour ce statut.' : 'Aucune demande de carte à produire.'}</Empty>}
          </>}

          {tab === 'fonction' && <>
            <label className="prod-status-filter">Filtrer les stickers par statut
              <select aria-label="Filtrer les stickers par statut" value={stickerStatus} onChange={e => setStickerStatus(e.target.value as StickerStatusFilter)}>
                {Object.entries(STICKER_FILTER_LABELS).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
              </select>
            </label>
            {foncFiltrees.length ? <div className="prod-list">{foncFiltrees.map((x) => { const [fl, fi] = FN[x.fonction ?? 'lien']; return (
        <article key={x.id} className="prod-card">
          <header><span className="prod-ic"><Icon n={fi} /></span>
            <div><b>{fl} · {x.tailleMm / 10} cm {x.forme === 'carre' ? 'carré' : 'rond'} × {x.quantite}</b>
              <small>{client(x.fiche)} · {ago(x.createdAt)}{x.options?.nfc ? ' · puce NFC' : ''}{x.options?.anti_metal ? ' · anti-métal' : ''} · thème {x.theme}</small></div>
            <Badge tone={TONE(x.statut)}>{SS[x.statut]}</Badge></header>
          <div className="prod-params"><p className="eyebrow">À paramétrer</p>
            <dl>{Object.entries(x.parametres ?? {}).map(([k, v]) => <div key={k}><dt>{LBL[k] ?? k}</dt><dd>{VAL(v)}{typeof v === 'string' && v && <CopyLink text={v} />}</dd></div>)}</dl>
            <p className="prod-qr">{x.qrMode === 'wifi'
              ? <><Icon n="zap" s={15} />QR Wi-Fi direct : <code>{qrPayload.wifi(wifiParams(x.parametres))}</code></>
              : <><Icon n="zap" s={15} />QR dynamique <code>{x.qr?.url.replace('https://', '')}</code> → {x.qr?.targetUrl ? <a href={x.qr.targetUrl} target="_blank" rel="noreferrer">{x.qr.targetUrl}</a> : <b className="adm-red">cible à régler (onglet QR dynamiques)</b>}</>}</p>
          </div>
          <footer><Btn icon="eye" onClick={() => setVue({ type: 'sticker', x })}>Aperçu</Btn>
            <Btn kind="dark" icon="down" onClick={() => download(svgDataUrl(stickerFile(x)), `sticker-${x.fonction}-${x.tailleMm / 10}cm.svg`)}>Fichier vectoriel</Btn>
            {statutSelect(x.statut, SS, (s) => setSticker(x, s))}</footer>
        </article>); })}</div> : <Empty>{fonc.length ? 'Aucun sticker à fonction pour ce statut.' : 'Aucun sticker à fonction. Crée-en un avec « Nouveau sticker ».'}</Empty>}
        </>}

        {tab === 'telephone' && <>
          <label className="prod-status-filter">Filtrer les stickers par statut
            <select aria-label="Filtrer les stickers par statut" value={stickerStatus} onChange={e => setStickerStatus(e.target.value as StickerStatusFilter)}>
              {Object.entries(STICKER_FILTER_LABELS).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
            </select>
          </label>
          {telFiltrees.length ? <div className="table-wrap"><table className="adm-tbl">
        <thead><tr><th>Client</th><th>Fiche copiée</th><th>Personnalisation</th><th>Quantité</th><th>Fichier</th><th>Statut</th></tr></thead>
        <tbody>{telFiltrees.map((x) => (
          <tr key={x.id}>
            <td data-l="Client"><b>{client(x.fiche)}</b><small>{fdate(x.createdAt)}</small></td>
            <td data-l="Fiche"><code className="nfc">{x.ficheUrl?.replace('https://', '')}</code></td>
            <td data-l="Personnalisation"><span className="sw" style={{ background: x.personnalisation?.couleur_qr }} /><span className="sw" style={{ background: x.personnalisation?.fond }} /><small>« {x.personnalisation?.texte || 'Scannez-moi'} »</small></td>
            <td data-l="Quantité">{x.quantite}</td>
            <td data-l="Fichier"><div className="row-a left"><Btn icon="eye" onClick={() => setVue({ type: 'sticker', x })}>Aperçu</Btn>
              <Btn kind="dark" icon="down" disabled={busy === `t${x.id}`} onClick={() => getFile(`t${x.id}`, () => svgToPng(stickerFile(x), 33, 600), `sticker-30mm-${x.ficheSlug}-600dpi.png`)}>PNG 600 dpi</Btn></div></td>
            <td data-l="Statut">{statutSelect(x.statut, SS, (s) => setSticker(x, s))}</td>
          </tr>))}</tbody></table></div> : <Empty>{tel.length ? 'Aucun sticker 30 mm pour ce statut.' : 'Aucun sticker 30 mm.'}</Empty>}
          </>}

      {tab === 'sections' && <SectionStickersTab data={sec?.demandes ?? null} error={eSec} onChanged={refresh} />}
      {tab === 'qr' && (qr.qr.length ? <div className="table-wrap"><table className="adm-tbl">
        <thead><tr><th>Code</th><th>Sticker</th><th>Cible (modifiable à distance)</th><th>Actif</th><th>Scans</th></tr></thead>
        <tbody>{qr.qr.map((q) => <QrRow key={q.code} q={q}
          onSave={(b, msg) => run(() => adminApi.updateQr(q.code, b), msg).then((r) => r && refresh())} />)}</tbody></table></div> : <Empty>Aucun QR dynamique.</Empty>)}

      {vue && <Apercu vue={vue} onClose={() => setVue(null)} />}
      {creation === 'sticker' && <NouveauStickerModal onClose={() => setCreation(null)} onCreated={refresh} />}
    </>
  );
}

function QrRow({ q, onSave }: { q: QrLien; onSave: (b: { targetUrl?: string | null; actif?: boolean }, msg: string) => void }) {
  const [v, setV] = useState(q.targetUrl ?? '');
  useEffect(() => setV(q.targetUrl ?? ''), [q.targetUrl]);
  const t = v.trim();
  const inchange = t === (q.targetUrl ?? ''), invalide = !!t && !/^https?:\/\//i.test(t);
  return (
    <tr className={q.actif ? '' : 'off'}>
      <td data-l="Code"><code className="nfc">{q.url.replace('https://', '')}</code>
        <Link className="adm-btn adm-btn-ghost" to={`/admin/qrcodes?${new URLSearchParams({ url: q.url, nom: q.label || q.code })}`}>
          <Icon n="qr" s={16} />Générer un QR code
        </Link>
      </td>
      <td data-l="Sticker"><b>{q.label || '—'}</b>{q.sticker && <small>{q.sticker.tailleMm / 10} cm</small>}</td>
      <td data-l="Cible"><div className="row-a left"><input value={v} placeholder="https://… (à régler)" onChange={(e) => setV(e.target.value)} aria-invalid={invalide} />
        <Btn kind="red" disabled={inchange || invalide} onClick={() => onSave({ targetUrl: t || null }, t ? 'Cible enregistrée : le sticker ouvre la nouvelle adresse' : 'Cible retirée')}>Enregistrer</Btn></div>
        {invalide && <small className="adm-red">L’adresse doit commencer par http:// ou https://</small>}</td>
      <td data-l="Actif"><label className="toggle"><input type="checkbox" checked={q.actif} aria-label={`Activer ${q.code}`} onChange={(e) => onSave({ actif: e.target.checked }, e.target.checked ? 'QR activé' : 'QR désactivé')} /><span /></label></td>
      <td data-l="Scans"><b>{q.scans}</b><small>{q.lastScanAt ? `dernier ${ago(q.lastScanAt)}` : 'jamais scanné'}</small></td>
    </tr>
  );
}

function Apercu({ vue, onClose }: { vue: Vue; onClose: () => void }) {
  const recto = vue.type === 'carte' ? vue.modele?.rectoUrl : null;
  const verso = vue.type === 'carte' ? vue.modele?.versoUrl : null;
  return (
    <Modal title={vue.type === 'carte' ? `Carte /${vue.c.fiche?.slug ?? ''}` : 'Aperçu du sticker'} onClose={onClose} wide>
      {vue.type === 'carte' ? <div className="prod-prev">
        {vue.modele ? <>
          <figure>{recto ? <img src={recto} alt="Recto" /> : <p className="adm-red"><b>Recto indisponible</b></p>}<figcaption>Recto · modèle actif {vue.modele.nom}</figcaption></figure>
          <figure>{verso ? <img src={verso} alt="Verso" /> : <p className="adm-red"><b>Verso indisponible</b></p>}<figcaption>Verso · modèle actif {vue.modele.nom}</figcaption></figure>
        </> : <p className="adm-red"><b>Aucun modèle actif configuré pour la formule {vue.c.tier}.</b></p>}
        <p className="adm-muted small">{CARD.printer}. Carte {vue.c.tier}. Encodage NFC : enregistrement NDEF de type URI avec l’adresse ci-dessus. Tester la lecture NFC et le QR avec un téléphone avant livraison.</p></div>
        : <div className="prod-prev one"><img src={svgDataUrl(stickerFile(vue.x))} alt="Sticker" />
          <p className="adm-muted small">Fichier vectoriel à la taille réelle, fond perdu et trait de coupe « CutContour » (magenta) pour la découpe.</p></div>}
    </Modal>
  );
}