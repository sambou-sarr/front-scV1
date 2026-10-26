// Sprite SVG unique, monté une fois dans App. Usage : <Icon id="arr" />
import type { CSSProperties } from "react";

export interface IconProps {
  id: string;
  className?: string;
  style?: CSSProperties;
}
export function Icon({ id, className, style }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#${id}`} />
    </svg>
  );
}

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="arr" viewBox="0 0 24 24">
          <path {...S} strokeWidth="2" d="M4 12h15m-6-6 6 6-6 6" />
        </symbol>
        <symbol id="nfc" viewBox="0 0 24 24">
          <g {...S} strokeWidth="2">
            <path d="M6 8.5a5 5 0 0 1 0 7" />
            <path d="M10 6a9 9 0 0 1 0 12" />
            <path d="M14 3.5a13 13 0 0 1 0 17" />
          </g>
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"
          />
        </symbol>
        <symbol id="i-wa" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2z"
          />
        </symbol>
        <symbol id="i-menu" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M7 2v8a2 2 0 0 0 2 2v10h2V12a2 2 0 0 0 2-2V2h-1.5v7h-1V2h-1v7h-1V2zm10 0c-2 0-3 2.5-3 6v5h2v9h2V2z"
          />
        </symbol>
        <symbol id="i-cal" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM5 9h14v11H5z"
          />
        </symbol>
        <symbol id="i-cart" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M3 4h2.5l2.2 11h10.6L20.5 7H7M9.5 20a1 1 0 1 0 0-.1M17 20a1 1 0 1 0 0-.1"
          />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="m12 2 3 6.6 7 .7-5.3 4.8 1.6 7L12 17.5 5.7 21l1.6-7L2 9.3l7-.7z"
          />
        </symbol>
        <symbol id="i-pen" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3"
          />
        </symbol>
        <symbol id="i-mob" viewBox="0 0 24 24">
          <path {...S} strokeWidth="1.8" d="M7 2.8h10v18.4H7zM11 18h2" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path {...S} strokeWidth="2.6" d="m5 12.5 4.5 4.5L19 7.5" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path {...S} strokeWidth="1.8" d="M4 5h16v11H9l-5 4z" />
        </symbol>
        <symbol id="i-burger" viewBox="0 0 24 24">
          <path {...S} strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
        </symbol>
        <symbol id="palm" viewBox="0 0 40 40">
          <path
            fill="#e8c77f"
            d="M20 38c.4-8 .6-14 1-19 1-.5 5-3.5 10-2-3-4-7.5-3-9.5-1.5 1-3 5-6 10-5.5-4-3-9-1.2-11 2 0-3-2-6.5-7-7 3 2 4.5 5 4.8 7.5C16.5 10 12 9 8 11c5 .2 8 3 9.4 5.5-2.4-.5-7.2.5-9.4 4 4.5-2 9-1.2 11-.5-.4 5-.6 11-1 18z"
          />
        </symbol>

        {/* Mini-piliers du hero */}
        <symbol id="p-link" viewBox="0 0 32 32">
          <g {...S} strokeWidth="1.4">
            <path d="M13 19l6-6" />
            <path d="M11 15l-3 3a4.2 4.2 0 0 0 6 6l3-3" />
            <path d="M21 17l3-3a4.2 4.2 0 0 0-6-6l-3 3" />
          </g>
        </symbol>
        <symbol id="p-people" viewBox="0 0 32 32">
          <g {...S} strokeWidth="1.4">
            <circle cx="13" cy="10" r="4.5" />
            <path d="M4 26c0-5 4-8 9-8s9 3 9 8" />
            <path d="M22 9.5a4 4 0 0 1 0 7.5M24 18.5c2.5 1 4 3.6 4 7" />
          </g>
        </symbol>
        <symbol id="p-chart" viewBox="0 0 32 32">
          <g {...S} strokeWidth="1.4">
            <circle cx="16" cy="16" r="12" />
            <path d="M11 21v-4M16 21v-8M21 21v-6" />
          </g>
        </symbol>

        {/* Secteurs */}
        <symbol id="s-resto" viewBox="0 0 36 36">
          <path
            {...S}
            strokeWidth="1.5"
            d="M10 4v10a3 3 0 0 0 6 0V4M13 4v28M24 4c-3 2-4 7-4 12h4v16"
          />
        </symbol>
        <symbol id="s-hotel" viewBox="0 0 36 36">
          <g {...S} strokeWidth="1.5">
            <path d="M4 8v22M4 24h28v6M4 18h28v6M10 18v-4h9v4" />
            <circle cx="9" cy="13" r="2" />
          </g>
        </symbol>
        <symbol id="s-shop" viewBox="0 0 36 36">
          <path
            {...S}
            strokeWidth="1.5"
            d="M7 12h22l-2 20H9zM13 12V9a5 5 0 0 1 10 0v3"
          />
        </symbol>
        <symbol id="s-home" viewBox="0 0 36 36">
          <path {...S} strokeWidth="1.5" d="M5 17 18 6l13 11M9 14v17h18V14" />
        </symbol>
        <symbol id="s-palm" viewBox="0 0 36 36">
          <path
            {...S}
            strokeWidth="1.5"
            d="M18 32V14M18 14c-3-4-8-5-12-3M18 14c3-4 8-5 12-3M18 14c-1-5-5-8-9-8M18 14c1-5 5-8 9-8M8 32h20"
          />
        </symbol>
        <symbol id="s-case" viewBox="0 0 36 36">
          <path
            {...S}
            strokeWidth="1.5"
            d="M5 11h26v18H5zM13 11V7h10v4M5 19h26M16 17v4h4v-4"
          />
        </symbol>
        <symbol id="s-inst" viewBox="0 0 36 36">
          <path
            {...S}
            strokeWidth="1.5"
            d="M4 13 18 5l14 8zM7 13v14M13 13v14M23 13v14M29 13v14M4 31h28M5 27h26"
          />
        </symbol>

        {/* Réseaux sociaux */}
        <symbol id="so-ig" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
          </g>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </symbol>
        <symbol id="so-fb" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4v-7h2.3l.4-2.8H15V9.4c0-.8.3-1.4 1.4-1.4h1.4V5.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H10V14h2.2v7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
          />
        </symbol>
        <symbol id="so-in" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2.3 7.5V17H9.5v-6.5zm1.1-3.3a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM11 10.5V17h2.2v-3.4c0-.9.2-1.8 1.3-1.8s1.1 1 1.1 1.9V17h2.2v-3.8c0-1.9-.4-3.3-2.6-3.3-1 0-1.7.6-2 1.1v-.9z"
          />
        </symbol>
        <symbol id="so-yt" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"
          />
        </symbol>
        <symbol id="so-tt" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16.5 3c.3 2.2 1.6 3.6 3.8 3.8v2.6c-1.3.1-2.5-.3-3.8-1.1v5.5c0 7-7.6 9.1-10.6 4.1-1.9-3.2-.7-8.9 5.6-9.1v2.8c-.5.1-1 .2-1.4.4-1.4.5-2.2 1.4-2 3 .4 3 5.9 3.9 5.4-2V3z"
          />
        </symbol>
        {/* Page Cartes */}
        <symbol id="i-user" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
          </g>
        </symbol>
        <symbol id="i-mail" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <rect x="3" y="5" width="18" height="14" rx="1.5" />
            <path d="m3.5 6 8.5 7 8.5-7" />
          </g>
        </symbol>
        <symbol id="i-globe" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
          </g>
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </g>
        </symbol>
        <symbol id="i-share" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
          </g>
        </symbol>
        <symbol id="i-doc" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.6"
            d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"
          />
        </symbol>
        <symbol id="i-scan" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.6"
            d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 13v3"
          />
        </symbol>
        <symbol id="i-target" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 12 20 4M16 4h4v4" />
          </g>
        </symbol>
        <symbol id="i-people" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.6">
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5" />
            <path d="M16 5a3 3 0 0 1 0 6M18 14.5c2 .6 3 2.5 3 5.5" />
          </g>
        </symbol>
        <symbol id="i-chart" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M5 20v-6M10 20V9M15 20v-8M20 20V4"
          />
        </symbol>
        <symbol id="i-sync" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4"
          />
        </symbol>
        {/* Page QR Smart */}
        <symbol id="i-drop" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"
          />
        </symbol>
        <symbol id="i-ruler" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M3 16 16 3l5 5L8 21zM7 12l2 2M10 9l2 2M13 6l2 2"
          />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"
          />
        </symbol>
        <symbol id="i-scissors" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.7">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="6" cy="18" r="2.5" />
            <path d="M8 7.5 20 17M8 16.5 20 7" />
          </g>
        </symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24">
          <path {...S} strokeWidth="1.7" d="M13 3 5 13h6l-1 8 8-10h-6z" />
        </symbol>
        <symbol id="i-wifi" viewBox="0 0 24 24">
          <g {...S} strokeWidth="2">
            <path d="M3 9a14 14 0 0 1 18 0M6 12.5a9 9 0 0 1 12 0M9 16a4 4 0 0 1 6 0" />
          </g>
          <circle cx="12" cy="19" r="1.4" fill="currentColor" />
        </symbol>
        <symbol id="i-gift" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M4 10h16v11H4zM3 7h18v3H3zM12 7v14M12 7c-2-4-6-4-6-1.5S10 7 12 7zm0 0c2-4 6-4 6-1.5S14 7 12 7z"
          />
        </symbol>
        {/* Page Secteurs */}
        <symbol id="i-card" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.7">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M7 10h5M7 13.5h3M16 10.5a2 2 0 0 1 0 3" />
          </g>
        </symbol>
        <symbol id="i-board" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M3 5h18v11H3zM8 16l-2 5M16 16l2 5M12 16v3M6 9h5M6 12h3M15 8.5h3v3h-3z"
          />
        </symbol>
        <symbol id="i-shirt" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3c0 1.7-1.8 3-4 3S8 4.7 8 3z"
          />
        </symbol>
        {/* V5 — création de contenu & immobilier */}
        <symbol id="i-cam" viewBox="0 0 24 24">
          <g {...S} strokeWidth="1.8">
            <path d="M3 8h3.5L8 5.5h8L17.5 8H21v11H3z" />
            <circle cx="12" cy="13" r="3.6" />
          </g>
        </symbol>
        <symbol id="i-mic" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
          />
        </symbol>
        <symbol id="i-cube" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M12 3 4 7.5v9L12 21l8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"
          />
        </symbol>
        <symbol id="i-sofa" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2"
          />
        </symbol>
        <symbol id="i-print" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M7 9V3h10v6M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3M7 14h10v7H7z"
          />
        </symbol>
        <symbol id="i-spark" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M11 2l1.9 5.6 5.6 1.9-5.6 1.9L11 17l-1.9-5.6L3.5 9.5l5.6-1.9zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"
          />
        </symbol>
        <symbol id="i-tool" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M15 3.5a5 5 0 0 0-4.6 6.9L3.2 17.6l3.2 3.2 7.2-7.2A5 5 0 0 0 20.5 9l-3 3-3.3-.7-.7-3.3 3-3a5 5 0 0 0-1.5-.5z"
          />
        </symbol>
        <symbol id="i-truck" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7M6.5 19.2a1.7 1.7 0 1 0 0-.1M17.5 19.2a1.7 1.7 0 1 0 0-.1"
          />
        </symbol>
        <symbol id="i-crane" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M6 21V4L3 7M6 4h14l-3 3M6 7h11M17 7v5M15.5 12h3v3h-3zM3 21h7M8 7 6 9.5"
          />
        </symbol>
        <symbol id="i-hover" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.7"
            d="M7 4.5 17.5 13l-4.6.9 2.6 5.3-2.2 1.1-2.6-5.3L7 18.2z"
          />
          <path
            {...S}
            strokeWidth="1.5"
            d="M3.5 7.5l-1-.6M4.6 4.2l-.6-1M7.8 2.8V1.6"
          />
        </symbol>
        <symbol id="i-key" viewBox="0 0 24 24">
          <path
            {...S}
            strokeWidth="1.8"
            d="M15 3a6 6 0 0 0-5.6 8.1L3 17.5V21h3.5v-2H9v-2.5h2.4l1.5-1.5A6 6 0 1 0 15 3zM16.5 7.5a1 1 0 1 0 0-.1"
          />
        </symbol>
      </defs>
    </svg>
  );
}
