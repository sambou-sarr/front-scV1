import { useState } from "react";
import type { FicheRecord, Plat } from "../../../../../types";
import { I } from "../Icon";
import { Sheet } from "../Sheet";
import { fcfa, wa } from "../format";

/** Onglet Menu : plats par catégorie, fiche détaillée avec photo et vidéo. */
export default function MenuView({ fiche }: { fiche: FicheRecord }) {
  const sections = (fiche.data.menu?.sections || []).filter(x =>
    x.plats?.some(p => p.nom),
  );
  const [sec, setSec] = useState(0),
    [open, setOpen] = useState<Plat | null>(null),
    [vidErr, setVidErr] = useState(false);
  if (!sections.length)
    return <p className="f-txt muted">Le menu arrive bientôt.</p>;
  const cur = sections[Math.min(sec, sections.length - 1)];
  return (
    <div className="f-menu">
      {sections.length > 1 && (
        <div className="f-chipsbar">
          {sections.map((x, i) => (
            <button
              key={x.titre}
              className={i === sec ? "on" : ""}
              onClick={() => setSec(i)}
            >
              {x.titre}
            </button>
          ))}
        </div>
      )}
      <div className="f-dishes">
        {cur.plats
          .filter(p => p.nom)
          .map(p => (
            <button
              key={p.nom}
              className="f-dish"
              onClick={() => {
                setVidErr(false);
                setOpen(p);
              }}
            >
              <span className="f-dish-img">
                {p.image ? <img src={p.image} alt="" loading="lazy" /> : <i />}
                {p.video && (
                  <span className="f-play">
                    <I n="play" s={14} />
                  </span>
                )}
                {p.badge && <em>{p.badge}</em>}
              </span>
              <b>{p.nom}</b>
              {p.prix && <span>{fcfa(p.prix)}</span>}
            </button>
          ))}
      </div>
      {open && (
        <Sheet onClose={() => setOpen(null)} label={open.nom}>
          <div className="f-short">
            {open.video && !vidErr ? (
              <video
                key={open.video}
                poster={open.image}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVidErr(true)}
              >
                {open.videoWebm && (
                  <source src={open.videoWebm} type="video/webm" />
                )}
                <source
                  src={open.video}
                  type="video/mp4"
                  onError={() => setVidErr(true)}
                />
              </video>
            ) : (
              <img className="kb" src={open.image} alt="" />
            )}
            <span className="f-short-bar">
              <i />
            </span>
          </div>
          <div className="f-sheet-b">
            <div className="f-sheet-h">
              <b>{open.nom}</b>
              {open.prix && <strong>{fcfa(open.prix)}</strong>}
            </div>
            {open.description && <p>{open.description}</p>}
            <a
              className="f-btn gold"
              href={wa(
                fiche.whatsapp,
                `Bonjour, je souhaite commander : ${open.nom}`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <I n="wa" s={16} />
              Commander ce plat
            </a>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ---------- Biens immobiliers : photos à faire défiler, prix, caractéristiques ---------- */
