/*
  Fichiers prêts à imprimer — générés dans le navigateur au moment où le client valide.
  • Cartes : format Evolis CR80, 1012 × 638 px à 300 dpi (bord à bord), recto + verso, PNG sans perte
    avec la résolution 300 dpi inscrite dans le fichier (chunk pHYs) + fiche d'encodage NFC (URL à écrire dans la puce).
  • Stickers : SVG vectoriel à la taille réelle en millimètres, fond perdu 2 mm et trait de coupe « CutContour »,
    + PNG 300 dpi (8, 12, 17 cm) ou 600 dpi (sticker téléphone 30 mm).
  Même fichier dans le site (src/lib/print.ts) et dans le back-office (admin/src/lib/print.ts).
*/
import { qrMatrix } from './qr';

export type Tier = 'essentielle' | 'pro' | 'signature';
/** Réglages du configurateur (CardStudio) + images de fond prédéfinies résolues (bgImg, backImg). */
export interface CardDesign {
  bg?: string; upload?: string | null; bgImg?: string; logo?: string | null; logoSize?: number; accent?: string; ink?: string | null;
  zoom?: number; posX?: number; posY?: number; dim?: number; back?: string; backUpload?: string | null; backImg?: string; backDim?: number;
}
export interface CardFields { name?: string; role?: string; company?: string; phone?: string; email?: string }
export interface PrintFiles { recto: string; verso: string; fiche: { format: string; imprimante: string; nfc: { type: string; url: string }; qr_verso: string; niveau: Tier } }
type Stops = [number, string][];
type Ctx = CanvasRenderingContext2D;

export const CARD = { w: 1012, h: 638, dpi: 300, format: 'CR80 · 85,60 × 53,98 mm · 1012 × 638 px · 300 dpi · PNG', printer: 'Evolis (impression bord à bord, ruban couleur YMCKO)' };

const loadImg = (src: string | null | undefined): Promise<HTMLImageElement | null> => new Promise((res) => { if (!src) return res(null); const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const fonts = async () => { try { await Promise.all(['600 40px Inter', '500 40px Inter', '500 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"'].map((f) => document.fonts.load(f))); } catch (e) { /* polices système */ } };

// Dégradé CSS (angle en degrés) → dégradé canvas
function cssGradient(ctx: Ctx, W: number, H: number, deg: number, stops: Stops): CanvasGradient {
  const a = (deg - 90) * Math.PI / 180, len = Math.abs(W * Math.cos(a)) + Math.abs(H * Math.sin(a));
  const cx = W / 2, cy = H / 2, dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g;
}
const PRESETS: Record<string, [number, Stops]> = {
  noir: [135, [[0, '#1d1d1f'], [.55, '#080808'], [1, '#161617']]],
  or: [125, [[0, '#f5e3ae'], [.35, '#d4b06a'], [.62, '#9c7835'], [1, '#e9d08e']]],
  rouge: [135, [[0, '#7a0c19'], [.45, '#b3132a'], [1, '#3d060c']]],
};
function drawCover(ctx: Ctx, img: HTMLImageElement, W: number, H: number, zoom = 100, px = 50, py = 50): void {
  const s = Math.max(W / img.width, H / img.height) * (zoom / 100), w = img.width * s, h = img.height * s;
  ctx.drawImage(img, (W - w) * (px / 100), (H - h) * (py / 100), w, h);
}
async function drawBackground(ctx: Ctx, W: number, H: number, preset: string | undefined, imgSrc?: string | null, o: { zoom?: number; posX?: number; posY?: number; dim?: number } = {}): Promise<void> {
  if (imgSrc) { const img = await loadImg(imgSrc); if (img) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawCover(ctx, img, W, H, o.zoom, o.posX, o.posY); if (o.dim) { ctx.fillStyle = `rgba(0,0,0,${o.dim / 100})`; ctx.fillRect(0, 0, W, H); } return; } }
  if (preset === 'motif') {
    ctx.fillStyle = '#141414'; ctx.fillRect(0, 0, W, H); const k = W / 340; ctx.save(); ctx.strokeStyle = '#1e1e1e'; ctx.lineWidth = 9 * k;
    for (let x = -H; x < W + H; x += 18 * k) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); }
    ctx.fillStyle = 'rgba(201,162,91,.4)'; for (let y = 3.5 * k; y < H; y += 14 * k) for (let x = 3.5 * k; x < W; x += 14 * k) { ctx.beginPath(); ctx.arc(x, y, 1.9 * k, 0, 7); ctx.fill(); }
    ctx.restore(); return;
  }
  const [deg, stops] = PRESETS[preset as string] || PRESETS.noir; ctx.fillStyle = cssGradient(ctx, W, H, deg, stops); ctx.fillRect(0, 0, W, H);
}
function drawQR(ctx: Ctx, text: string, x: number, y: number, size: number, { dark = '#111', light = '#fff', pad = .06 } = {}): void {
  ctx.fillStyle = light; roundRect(ctx, x, y, size, size, size * .05); ctx.fill();
  const m = qrMatrix(text, 'M'), inner = size * (1 - pad * 2), ox = x + size * pad, oy = y + size * pad;
  ctx.fillStyle = dark;
  if (!m) { ctx.font = `700 ${size * .2}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('QR', x + size / 2, y + size / 2); return; }
  const u = inner / m.n;
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.dark(r, c)) ctx.fillRect(Math.floor(ox + c * u), Math.floor(oy + r * u), Math.ceil(u), Math.ceil(u));
}
function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// letterSpacing absent des anciens navigateurs : propriété facultative pour garder le repli lettre par lettre
function spaced(ctx: Omit<Ctx, 'letterSpacing'> & { letterSpacing?: string }, text: string, x: number, y: number, em: number): void { // texte espacé (lettres capitales)
  if ('letterSpacing' in ctx) { ctx.letterSpacing = `${em}px`; ctx.fillText(text, x, y); ctx.letterSpacing = '0px'; return; }
  let cx = x; for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + em; }
}
function nfcIcon(ctx: Ctx, x: number, y: number, s: number, color: string): void { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * .09; ctx.lineCap = 'round'; [.28, .5, .72].forEach((r) => { ctx.beginPath(); ctx.arc(x, y + s / 2, s * r, -Math.PI / 3.2, Math.PI / 3.2); ctx.stroke(); }); ctx.restore(); }

// Chunk pHYs : la résolution (300 ou 600 dpi) est inscrite dans le PNG → taille réelle à l'ouverture
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b: Uint8Array): number => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
export function pngWithDpi(dataURL: string, dpi: number): string {
  const bin = atob(dataURL.split(',')[1]), src = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  const ppm = Math.round(dpi / .0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9); chunk.set([112, 72, 89, 115], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1; dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const out = new Uint8Array(src.length + 21); out.set(src.subarray(0, 33)); out.set(chunk, 33); out.set(src.subarray(33), 54);
  let s = ''; for (let i = 0; i < out.length; i += 32768) s += String.fromCharCode.apply(null, out.subarray(i, i + 32768) as unknown as number[]); // apply accepte un tableau typé
  return 'data:image/png;base64,' + btoa(s);
}

/* ---------------- Cartes (Evolis) ---------------- */
export async function renderCard({ tier, ds = {}, fields = {}, url, logoFallback }: { tier: Tier; ds?: CardDesign; fields?: CardFields; url: string; logoFallback: string }): Promise<PrintFiles> {
  await fonts();
  const W = CARD.w, H = CARD.h, sig = tier === 'signature', pro = tier === 'pro', ess = tier === 'essentielle';
  const inkF = ds.ink || (sig && !ds.upload && ds.bg === 'or' ? '#1b1712' : '#ffffff');
  const backSame = ds.back === 'same', backImg = sig ? (ds.back === 'upload' ? ds.backUpload : backSame ? (ds.upload || ds.bgImg) : ds.backImg) : null;
  const inkB = ds.ink || (sig && !backImg && (backSame ? ds.bg : ds.back) === 'or' ? '#1b1712' : '#ffffff');
  const acc = sig ? (ds.accent || '#c9a25b') : '#EF1733';
  const face = async (draw: (x: Ctx) => Promise<void> | void): Promise<string> => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d')!; await draw(x); return pngWithDpi(c.toDataURL('image/png'), CARD.dpi); };
  const frame = (x: Ctx) => { if (pro) { x.fillStyle = '#EF1733'; x.fillRect(0, 0, W * .024, H); } if (sig) { x.strokeStyle = acc; x.lineWidth = W * .0055; x.strokeRect(W * .00275, W * .00275, W - W * .0055, H - W * .0055); } };

  const recto = await face(async (x) => {
    await drawBackground(x, W, H, sig ? ds.bg : 'noir', sig ? (ds.upload || ds.bgImg) : null, { zoom: ds.zoom, posX: ds.posX, posY: ds.posY, dim: ds.dim });
    frame(x); nfcIcon(x, W - W * .065 - W * .03, W * .06, W * .05, inkF);
    const ls = (ds.logoSize || 62) / 100, zw = W * ls, zh = H * .72 * ls, zx = (W - zw) / 2, zy = (H - zh) / 2;
    const logo = await loadImg(ess ? logoFallback : ds.logo);
    if (logo) { const s = Math.min(zw / logo.width, zh / logo.height); x.drawImage(logo, zx + (zw - logo.width * s) / 2, zy + (zh - logo.height * s) / 2, logo.width * s, logo.height * s); }
    else { x.fillStyle = inkF; x.textAlign = 'center'; x.textBaseline = 'middle'; let fs = W * .0013 * (ds.logoSize || 62); x.font = `500 ${fs}px "Cormorant Garamond", Georgia, serif`; const t = fields.company || fields.name || ''; while (x.measureText(t).width > zw && fs > 20) { fs -= 2; x.font = `500 ${fs}px "Cormorant Garamond", Georgia, serif`; } x.fillText(t, W / 2, H / 2); }
    x.fillStyle = acc; x.fillRect((W - W * .09) / 2, H - W * .09 - W * .0045, W * .09, W * .0045);
  });

  const verso = await face(async (x) => {
    if (sig) await drawBackground(x, W, H, backSame ? ds.bg : ds.back, backImg, { dim: backImg ? (ds.backDim ?? 55) : 0 });
    else await drawBackground(x, W, H, 'noir');
    frame(x);
    const L = W * (pro ? .10 : .09); let y = W * .07; x.textBaseline = 'top'; x.textAlign = 'left'; x.fillStyle = inkB;
    x.font = `600 ${W * .046}px Inter, sans-serif`; spaced(x, (fields.name || '').toUpperCase(), L, y, W * .046 * .14); y += W * .046 * 1.25;
    if (fields.role) { x.globalAlpha = .8; x.font = `italic 500 ${W * .034}px "Cormorant Garamond", Georgia, serif`; x.fillText(fields.role, L, y + W * .01); x.globalAlpha = 1; y += W * .034 * 1.2 + W * .01; }
    y += W * .024; x.fillStyle = acc; x.fillRect(L, y, W * .10, W * .005); y += W * .005 + W * .024;
    x.font = `500 ${W * .033}px Inter, sans-serif`;
    [fields.company, fields.phone, fields.email].filter((t): t is string => Boolean(t)).forEach((t) => { x.fillStyle = acc; x.beginPath(); x.arc(L + W * .012, y + W * .018, W * .007, 0, 7); x.fill(); x.fillStyle = inkB; x.globalAlpha = .92; x.fillText(t, L + W * .035, y); x.globalAlpha = 1; y += W * .033 * 1.55; });
    const q = W * .17; drawQR(x, url, W - W * .06 - q, H - W * .06 - q, q);
  });
  return { recto, verso, fiche: { format: CARD.format, imprimante: CARD.printer, nfc: { type: 'NDEF · enregistrement URI', url }, qr_verso: url, niveau: tier } };
}

export function download(dataURL: string, name: string): void { const a = document.createElement('a'); a.href = dataURL; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
