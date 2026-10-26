import { useState } from "react";
import { planOf } from "../../../../../lib/plans";
import type { BienData as Bien, FicheRecord } from "../../../../../types";
import { I } from "../Icon";
import { Photos } from "../Photos";
import { Sheet } from "../Sheet";
import { prixBien, wa } from "../format";

/** Onglet Biens immobiliers : liste filtrée et fiche détaillée. */
export default function BiensView({ fiche }: { fiche: FicheRecord }) {
  const all = (fiche.data.biens || []).slice(0, planOf(fiche).maxBiens || 0);
  const [f, setF] = useState("tous"),
    [open, setOpen] = useState<Bien | null>(null);
  const list = all.filter(b => f === "tous" || b.type === f);
  if (!all.length)
    return <p className="f-txt muted">Aucun bien pour le moment.</p>;
  return (
    <div className="f-biens">
      <div className="f-chipsbar">
        {[
          ["tous", "Tous"],
          ["vente", "À vendre"],
          ["location", "À louer"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={f === k ? "on" : ""}
            onClick={() => setF(k)}
          >
            {l}{" "}
            <small>
              {k === "tous" ? all.length : all.filter(b => b.type === k).length}
            </small>
          </button>
        ))}
      </div>
      {list.map(b => (
        <article key={b.titre} className="f-bien">
          <div className="f-bien-media">
            <Photos photos={b.photos || []} alt={b.titre} />
            <em className={`f-tag t-${b.type}`}>
              {b.type === "location" ? "À louer" : "À vendre"}
            </em>
          </div>
          <button className="f-bien-b" onClick={() => setOpen(b)}>
            <strong>{prixBien(b)}</strong>
            <b>{b.titre}</b>
            <span className="f-bien-v">
              <I n="pin" s={12} />
              {b.ville}
            </span>
            <span className="f-specs">
              {b.surface && (
                <span>
                  <I n="area" s={13} />
                  {b.surface} m²
                </span>
              )}
              {b.chambres && (
                <span>
                  <I n="bed" s={13} />
                  {b.chambres} ch.
                </span>
              )}
              {b.sdb && (
                <span>
                  <I n="bath" s={13} />
                  {b.sdb} sdb
                </span>
              )}
            </span>
            <span className="f-more">
              Voir le bien <I n="arrow" s={12} />
            </span>
          </button>
        </article>
      ))}
      {open && (
        <Sheet onClose={() => setOpen(null)} label={open.titre}>
          <div className="f-sheet-media">
            <Photos photos={open.photos || []} alt={open.titre} />
          </div>
          <div className="f-sheet-b">
            <em className={`f-tag in t-${open.type}`}>
              {open.type === "location" ? "À louer" : "À vendre"}
            </em>
            <div className="f-sheet-h">
              <b>{open.titre}</b>
            </div>
            <strong className="f-price">{prixBien(open)}</strong>
            <ul className="f-grid-specs">
              {(
                [
                  ["area", "Surface", open.surface && `${open.surface} m²`],
                  ["home", "Terrain", open.terrain && `${open.terrain} m²`],
                  ["bed", "Chambres", open.chambres],
                  ["bath", "Salles de bain", open.sdb],
                  ["pin", "Ville", open.ville],
                ] as const
              )
                .filter(x => x[2])
                .map(([ic, l, v]) => (
                  <li key={l}>
                    <I n={ic} s={15} />
                    <span>{l}</span>
                    <b>{v}</b>
                  </li>
                ))}
            </ul>
            {!!open.atouts?.length && (
              <div className="f-atouts">
                {open.atouts.map(a => (
                  <span key={a}>{a}</span>
                ))}
              </div>
            )}
            {open.description && <p>{open.description}</p>}
            <a
              className="f-btn gold"
              href={wa(
                fiche.whatsapp,
                `Bonjour, je suis intéressé(e) par : ${open.titre}`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <I n="wa" s={16} />
              Je suis intéressé(e)
            </a>
          </div>
        </Sheet>
      )}
    </div>
  );
}
