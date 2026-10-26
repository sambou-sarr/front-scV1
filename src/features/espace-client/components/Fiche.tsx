import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { cssVars } from "../../../lib/css";
import { ENV } from "../../../lib/env";
import { resolveHeader, visibleTabs } from "../../../lib/plans";
import type { FicheRecord } from "../../../types";
import { downloadVCard } from "../lib/vcard";
import { I } from "./fiche/Icon";
import { QR } from "./fiche/QR";
import { Section } from "./fiche/Section";
import { initials, wa } from "./fiche/format";
import { usePullQR } from "./fiche/usePullQR";
import "./Fiche.css";

/*
  Fiche connectée V2 (page publique ouverte par la carte NFC / le QR).
  - Onglets pliables, dans l'ordre et selon les droits de la formule (lib/plans.ts).
  - Entête modulable en Signature : portrait, logo, bannière, duo · 3 tailles · 4 thèmes.
  - « Tirer pour le QR » : en haut de page, on tire vers le bas → la photo remonte et le QR code
    de la fiche apparaît (avec le logo) ; on relâche → tout reprend sa place.
    Aussi : molette vers le haut (ordinateur) et bouton « NFC · QR » (accessibilité).
  - Ces outils (QR + bouton « NFC · QR » + geste) sont réservés au PROPRIÉTAIRE : il les utilise pour qu'une
    personne scanne sa fiche. Un visiteur qui l'a ouverte par un scan ne les voit pas (`ownerTools`, faux par défaut).
*/
interface FicheProps {
  fiche: FicheRecord;
  scrollerRef?: RefObject<HTMLDivElement>;
  baseUrl?: string;
  /** Affiche le QR code, le bouton « NFC · QR » et active le geste « tirer pour le QR ». Réservé au propriétaire. */
  ownerTools?: boolean;
}
interface Action {
  k: string;
  n: string;
  l: string;
  href: string;
}

export default function Fiche({
  fiche,
  scrollerRef,
  baseUrl = `${ENV.VITE_BASE_URL}/f/`,
  ownerTools = false,
}: FicheProps) {
  const publicAppUrl = (
    import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin
  ).replace(/\/+$/, "");
  const root = useRef<HTMLDivElement>(null);
  const [held, setHeld] = usePullQR(root, scrollerRef, ownerTools);
  const e = resolveHeader(fiche);
  const tabs = visibleTabs(fiche);
  const [open, setOpen] = useState(
    () => new Set(tabs.slice(0, 1).map(t => t.id)),
  );
  const url = `${baseUrl ?? `${publicAppUrl}/f/`}${fiche.slug}?source=qr`;
  const name = `${fiche.prenom} ${fiche.nom}`.trim();
  const actions = [
    fiche.whatsapp && {
      k: "whatsapp",
      n: "wa",
      l: "WhatsApp",
      href: wa(fiche.whatsapp, fiche.data.messageWhatsapp),
    },
    fiche.telephone && {
      k: "appel",
      n: "phone",
      l: "Appeler",
      href: `tel:${fiche.telephone.replace(/\s/g, "")}`,
    },
    fiche.email && {
      k: "email",
      n: "mail",
      l: "E-mail",
      href: `mailto:${fiche.email}`,
    },
  ]
    .filter((a): a is Action => !!a)
    .sort(
      (a, b) =>
        Number(b.k === fiche.data.premierBouton) -
        Number(a.k === fiche.data.premierBouton),
    );
  const avatar = (cls = "") => (
    <span className={`f-av ${cls}`}>
      {fiche.photo ? <img src={fiche.photo} alt={name} /> : initials(fiche)}
    </span>
  );
  const logo = (cls = "") =>
    fiche.logo ? (
      <span className={`f-logo ${cls}`}>
        <img src={fiche.logo} alt={fiche.entreprise || name} />
      </span>
    ) : null;

  useEffect(() => {
    root.current!.style.setProperty("--pull", held ? "210" : "0");
    root.current!.style.setProperty("--p01", held ? "1" : "0");
    root.current!.classList.toggle("pulling", held);
    root.current!.classList.add("rel");
  }, [held]);

  return (
    <div
      className={`fiche th-${e.theme} ly-${e.disposition} sz-${e.taille} f-${fiche.formule}`}
      ref={root}
    >
      <header
        className="f-hero"
        style={
          e.couverture &&
          (e.disposition === "logo" || e.disposition === "banniere")
            ? cssVars({ "--cover": `url(${e.couverture})` })
            : undefined
        }
      >
        <div className="f-chips">
          <span>Fiche de contact</span>
          {ownerTools && (
            <button onClick={() => setHeld(h => !h)} aria-pressed={held}>
              <I n="qr" s={12} />
              NFC · QR
            </button>
          )}
        </div>
        {ownerTools && (
          <div className="f-qrp" aria-hidden={!held}>
            <QR text={url} logo={fiche.logo} size={176} />
            <p>Scannez pour ouvrir la fiche de {fiche.prenom}</p>
          </div>
        )}
        <div className="f-id">
          {e.disposition === "portrait" && (
            <>
              {avatar()}
              <div className="f-names">
                <h1>{name}</h1>
                <p>{fiche.fonction}</p>
                {fiche.entreprise && (
                  <span className="f-org">{fiche.entreprise}</span>
                )}
              </div>
            </>
          )}
          {e.disposition === "duo" && (
            <>
              <span className="f-duo">
                {avatar()}
                {logo("badge")}
              </span>
              <div className="f-names">
                <h1>{name}</h1>
                <p>{fiche.fonction}</p>
                {fiche.entreprise && (
                  <span className="f-org">{fiche.entreprise}</span>
                )}
              </div>
            </>
          )}
          {e.disposition === "logo" && (
            <div className="f-center">
              {logo("big") || avatar()}
              <h1>{name}</h1>
              <p>{fiche.fonction}</p>
            </div>
          )}
          {e.disposition === "banniere" && (
            <div className="f-ban">
              {logo("badge-lg")}
              <div>
                <h1>{name}</h1>
                <p>
                  {fiche.fonction}
                  {fiche.entreprise ? ` · ${fiche.entreprise}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="f-hint">
          <I n="down" s={12} />
          Tirez vers le bas pour afficher le QR code
        </p>
        <nav className="f-acts">
          {actions.map((a, i) => (
            <a
              key={a.k}
              href={a.href}
              className={i === 0 ? "main" : ""}
              target={a.k === "whatsapp" ? "_blank" : undefined}
              rel="noreferrer"
            >
              <I n={a.n} s={16} />
              {a.l}
            </a>
          ))}
        </nav>
      </header>
      <main className="f-body">
        {tabs.map(t => (
          <Section
            key={t.id}
            tab={t}
            fiche={fiche}
            open={open.has(t.id)}
            onToggle={() =>
              setOpen(s => {
                const n = new Set(s);
                n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                return n;
              })
            }
          />
        ))}
        <footer className="f-foot">
          <div>
            <span>Mentions légales · Confidentialité</span>
            <a href={publicAppUrl} target="_blank" rel="noreferrer">
              Support Connecté <I n="arrow" s={11} />
            </a>
          </div>
          <p>
            Les informations envoyées via cette fiche servent uniquement à
            répondre à votre demande. Vous pouvez demander leur suppression en
            contactant l’établissement.
          </p>
          {fiche.enLigneSeule && (
            <a
              className="f-badge"
              href={publicAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              Créée avec <b>Support Connecté</b>
            </a>
          )}
        </footer>
      </main>
      <button className="f-save" onClick={() => downloadVCard(fiche, url)}>
        <I n="down" s={15} />
        Enregistrer le contact
      </button>
    </div>
  );
}

/* ---------- Feuille modale (plat, bien) ---------- */
