import { TAB_TYPES, resolveHeader } from "../../../../lib/plans";
import { ENV } from "../../../../lib/env";
import type { FicheRecord, Onglet } from "../../../../types";
import { sectionTitle } from "../../lib/stickerSections";
import "../Fiche.css";
import { I } from "../fiche/Icon";
import SectionBody from "../fiche/SectionBody";
import { initials } from "../fiche/format";
import "./StickerSection.css";

/**
 * Ce que voit la personne qui scanne un sticker : l'identité de l'établissement (logo, nom),
 * UNE section de la fiche et un bouton vers la fiche complète. Elle réutilise les vues d'onglet de la fiche
 * (`fiche/SectionBody`) sans toucher à `Fiche.tsx`.
 */
export default function StickerSection({
  fiche,
  tab,
}: {
  fiche: FicheRecord;
  tab: Onglet;
}) {
  const { theme } = resolveHeader(fiche); // même règle que la fiche complète
  const name = fiche.entreprise || `${fiche.prenom} ${fiche.nom}`.trim();
  const fullUrl = `/f/${encodeURIComponent(fiche.slug)}`;
  const publicAppUrl = (ENV.VITE_PUBLIC_APP_URL || "").replace(/\/+$/, "");

  return (
    <div className={`fiche ss th-${theme} f-${fiche.formule}`}>
      <header className="ss-head">
        <span className="ss-logo">
          {fiche.logo ? <img src={fiche.logo} alt={name} /> : initials(fiche)}
        </span>
        <h1 className="ss-name">{name}</h1>
        {/* Lien classique (pas de navigation interne) : la fiche complète peut être servie par un autre outil. */}
        <a className="ss-full" href={fullUrl}>
          Voir la fiche complète
          <I n="arrow" s={13} />
        </a>
      </header>
      <main className="ss-main">
        <h2 className="ss-title">
          <span className="f-ic">
            <I n={TAB_TYPES[tab.type].icon} s={16} />
          </span>
          {sectionTitle(tab)}
        </h2>
        <section className="f-sec open">
          <div className="f-sec-b">
            <div>
              <SectionBody tab={tab} fiche={fiche} />
            </div>
          </div>
        </section>
      </main>
      {fiche.enLigneSeule && (
        <footer className="ss-foot">
          Créée avec{" "}
          <a href={publicAppUrl || "/"} target="_blank" rel="noreferrer">
            Support Connecté
          </a>
        </footer>
      )}
    </div>
  );
}
