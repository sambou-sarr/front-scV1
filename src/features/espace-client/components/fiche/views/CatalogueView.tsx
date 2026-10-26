import { planOf } from "../../../../../lib/plans";
import { fcfa, wa } from "../format";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « catalogue » vu par le visiteur. */
export default function CatalogueView({ fiche }: ViewProps) {
  const d = fiche.data,
    plan = planOf(fiche);
  return (
    <div className="f-cat">
      {(d.sections || [])
        .filter(s => s.articles.some(a => a.nom))
        .slice(0, plan.maxCatalogSections || 0)
        .map(s => (
          <div key={s.titre} className="f-cat-s">
            <p className="f-cat-t">{s.titre}</p>
            {s.articles
              .filter(a => a.nom)
              .slice(0, plan.maxCatalogArticlesPerSection)
              .map(a => (
                <div key={a.nom} className="f-art">
                  {a.photo && (
                    <img
                      className="f-art-img"
                      src={a.photo}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div className="f-art-m">
                    <b>
                      {a.nom}
                      {a.badge && (
                        <em className={`bd-${a.badge}`}>{a.badge}</em>
                      )}
                    </b>
                    {a.description && <span>{a.description}</span>}
                  </div>
                  {plan.catalogPrices && (
                    <div className="f-art-r">
                      {a.prix && <strong>{fcfa(a.prix)}</strong>}
                      <a
                        href={wa(
                          fiche.whatsapp,
                          `Bonjour, je souhaite commander : ${a.nom}`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Commander
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
    </div>
  );
}
