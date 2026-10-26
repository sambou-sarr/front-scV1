import type { AnchorHTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { NavItem } from "../data/content";
import { NAV } from "../data/content";
import { cssVars } from "../lib/css";
import { Icon } from "./Icons";

// Cahier, section 05. Transparent sur le hero, blanc (#FFFFFF) dès 40 px de scroll.
// Menu déroulant « Nos solutions » (survol, clic ou clavier) ; sur mobile, tiroir plein écran avec sous-menu dépliable.
// Logo officiel détouré : /images/logo-blanc.webp et /images/logo-noir.webp. Ne pas le redessiner.
// V5 : onQuote (facultatif) = le bouton « Demander un devis » ouvre le formulaire de la page au lieu d'aller sur /contact.
interface HeaderProps {
  current?: string;
  onQuote?: () => void;
}
export default function Header({ current = "/", onQuote }: HeaderProps) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const [sub, setSub] = useState(true);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDd(false);
      }
    };
    const onDoc = (e: PointerEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node))
        setDd(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDoc);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDoc);
    };
  }, [open]);

  const inGroup = (n: NavItem) => n.children?.some(c => c.href === current);
  const devis: AnchorHTMLAttributes<HTMLAnchorElement> = onQuote
    ? {
        href: "#devis",
        onClick: e => {
          e.preventDefault();
          setOpen(false);
          window.setTimeout(onQuote, 0);
        },
      }
    : {
        href: "/contact?sujet=devis#formulaire",
        onClick: () => setOpen(false),
      };

  return (
    <>
      <header className={`hd${solid ? " solid" : ""}`}>
        <div className="wrap">
          <a className="logo" href="/" aria-label="Support Connecté, accueil">
            <img
              className="w"
              src="/images/logo-blanc.webp"
              alt="Support Connecté"
              width="150"
              height="47"
            />
            <img
              className="k"
              src="/images/logo-noir.webp"
              alt=""
              width="150"
              height="47"
            />
          </a>
          <nav className="nav" aria-label="Navigation principale">
            {NAV.map(n =>
              n.children ? (
                <div
                  key={n.label}
                  className={`dd${dd ? " open" : ""}${inGroup(n) ? " on" : ""}`}
                  ref={ddRef}
                  onMouseEnter={() => setDd(true)}
                  onMouseLeave={() => setDd(false)}
                >
                  <button
                    type="button"
                    className="dd-t"
                    aria-expanded={dd}
                    aria-haspopup="true"
                    onClick={() => setDd(x => !x)}
                  >
                    {n.label}
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path
                        d="M3 4.5l3 3 3-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div className="dd-p" role="menu">
                    {n.children.map((c, i) => (
                      <a
                        key={c.href}
                        role="menuitem"
                        href={c.href}
                        className={c.href === current ? "on" : undefined}
                        style={cssVars({ "--i": i })}
                        onClick={() => setDd(false)}
                      >
                        <span className="dd-ic">
                          <Icon id={c.icon} />
                        </span>
                        {c.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={n.href}
                  href={n.href}
                  className={n.href === current ? "on" : undefined}
                >
                  {n.label}
                </a>
              )
            )}
          </nav>
          <a className="btn btn-red" {...devis}>
            Demander un devis <Icon id="arr" />
          </a>
          <Link to="/register" className="btn btn-red">
            S'inscrire <Icon id="arr" />
          </Link>
          <button
            className="burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Icon id="i-burger" style={{ width: 26, height: 26 }} />
          </button>
        </div>
      </header>

      <div className={`drawer${open ? " open" : ""}`} aria-hidden={!open}>
        <button
          className="close"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        {NAV.map(n =>
          n.children ? (
            <div key={n.label} className={`dr-g${sub ? " open" : ""}`}>
              <button
                type="button"
                className="dr-t"
                aria-expanded={sub}
                onClick={() => setSub(x => !x)}
              >
                {n.label}
                <span>{sub ? "−" : "+"}</span>
              </button>
              <div className="dr-s">
                <div>
                  {n.children.map(c => (
                    <a
                      key={c.href}
                      href={c.href}
                      className={c.href === current ? "on" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <a
              key={n.href}
              href={n.href}
              className={n.href === current ? "on" : undefined}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          )
        )}
        <a className="btn btn-red" {...devis}>
          Demander un devis <Icon id="arr" />
        </a>

        <Link to="register" className="btn btn-red">
          S'inscrire <Icon id="arr" />
        </Link>
      </div>
    </>
  );
}
