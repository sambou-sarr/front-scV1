// QR codes réels (bibliothèque qrcode-generator, niveau de correction H : un logo au centre reste lisible).
import qrcode from "qrcode-generator";
import { ENV } from "./env";

export type QrLevel = "L" | "M" | "Q" | "H";
export interface QrMatrix {
  n: number;
  dark: (row: number, col: number) => boolean;
}

export function qrMatrix(text: string, level: QrLevel = "H"): QrMatrix | null {
  try {
    const q = qrcode(0, level);
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    return { n, dark: (r: number, c: number) => q.isDark(r, c) };
  } catch (e) {
    return null;
  }
}

// Chemin SVG des modules (1 unité = 1 module), marge de 4 modules
export function qrPath(m: QrMatrix, quiet = 4): string {
  let d = "";
  for (let r = 0; r < m.n; r++)
    for (let c = 0; c < m.n; c++)
      if (m.dark(r, c)) d += `M${c + quiet} ${r + quiet}h1v1h-1z`;
  return d;
}

// Contenus normalisés (formats reconnus par les appareils photo des téléphones)
const esc = (s: string = "") => String(s).replace(/([\\;,:"])/g, "\\$1");
export const qrPayload = {
  url: (u: string) => u,
  wifi: ({
    ssid,
    password,
    security = "WPA",
    hidden = false,
  }: {
    ssid: string;
    password: string;
    security?: "WPA" | "WEP" | "aucune";
    hidden?: boolean;
  }) =>
    `WIFI:T:${security === "aucune" ? "nopass" : security};S:${esc(ssid)};${security === "aucune" ? "" : `P:${esc(password)};`}${hidden ? "H:true;" : ""};`,
  whatsapp: (phone: string, msg?: string) =>
    `https://wa.me/${String(phone || "").replace(/\D/g, "")}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`,
};

// Adresses stables encodées dans les supports imprimés (jamais d'adresse technique)
export const BASE = ENV.VITE_BASE_URL;
export const ficheUrl = (slug: string) => `${BASE}/f/${slug}`;
export const shortUrl = (code: string) => `${BASE}/q/${code}`;
export const slugify = (s: string = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
export const newCode = () =>
  Array.from(
    { length: 6 },
    () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)]
  ).join("");

// Composant d'affichage
export interface QRProps {
  text?: string;
  size?: number;
  dark?: string;
  light?: string;
  logo?: string;
  className?: string;
}
export function QR({
  text,
  size = 120,
  dark = "#0c0c0c",
  light = "#fff",
  logo,
  className = "",
}: QRProps) {
  const m = text ? qrMatrix(text) : null;
  if (!m)
    return (
      <svg
        className={`qr-fb ${className}`}
        viewBox="0 0 10 10"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <rect width="10" height="10" fill={light} />
        <path
          d="M1 1h3v3H1zM6 1h3v3H6zM1 6h3v3H1zM6 6h1v1H6zM8 8h1v1H8zM7 7h1v1H7z"
          fill={dark}
        />
      </svg>
    );
  const n = m.n + 8,
    hole = Math.round(m.n * 0.24),
    s0 = 4 + Math.floor((m.n - hole) / 2);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${n} ${n}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code"
    >
      <rect width={n} height={n} fill={light} />
      <path d={qrPath(m)} fill={dark} />
      {logo && (
        <>
          <rect
            x={s0 - 0.5}
            y={s0 - 0.5}
            width={hole + 1}
            height={hole + 1}
            rx="1"
            fill={light}
          />
          <image
            href={logo}
            x={s0}
            y={s0}
            width={hole}
            height={hole}
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      )}
    </svg>
  );
}
