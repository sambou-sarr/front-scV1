import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { A_SIDE } from "../../data/auth";
import usePageMeta from "../../lib/meta";
import "../../styles/auth.css";
import { Icon, IconSprite } from "../Icons";

/*
  Cadre commun des pages Connexion et Inscription : panneau noir à gauche (logo, promesse, glow rouge),
  carte blanche à droite. Pas de Header/Footer : on garde l'utilisateur dans le parcours.
  Les pages de compte ne doivent pas être indexées (robots noindex posé ici, retiré au départ).
*/
interface Props {
  title: string;
  description: string;
  label: string;
  h1: string[];
  lead: string;
  children: ReactNode;
}

export default function AuthShell({
  title,
  description,
  label,
  h1,
  lead,
  children,
}: Props) {
  usePageMeta(`${title} — Support Connecté`, description);
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => {
      m.remove();
    };
  }, []);

  return (
    <>
      <IconSprite />
      <div className="au">
        <aside className="au-side">
          <div className="au-glow" aria-hidden="true" />
          <Link
            className="au-logo"
            to="/"
            aria-label="Support Connecté, accueil"
          >
            <img
              src="/images/logo-blanc.webp"
              alt="Support Connecté"
              width="150"
              height="47"
            />
          </Link>
          <div className="au-pitch">
            <p className="label light">{label}</p>
            <h1>
              {h1.map((l, i) => (
                <span key={l} className="au-l">
                  {i === h1.length - 1 ? <em className="red">{l}</em> : l}
                </span>
              ))}
            </h1>
            <p className="au-lead">{lead}</p>
            <ul className="au-points">
              {A_SIDE.points.map(p => (
                <li key={p.text}>
                  <span className="au-ic">
                    <Icon id={p.icon} />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="au-tag">
            {A_SIDE.tag.map((t, i) => (
              <span key={t}>
                {i > 0 && <i>•</i>}
                {t}
              </span>
            ))}
          </p>
        </aside>

        <main className="au-main">
          <div className="au-card">{children}</div>
          <Link className="au-back" to="/">
            ← {A_SIDE.back}
          </Link>
        </main>
      </div>
    </>
  );
}
