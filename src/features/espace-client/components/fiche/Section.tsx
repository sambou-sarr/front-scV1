import { TAB_TYPES } from "../../../../lib/plans";
import type { FicheRecord, Onglet } from "../../../../types";
import { I } from "./Icon";
import SectionBody from "./SectionBody";
import { today } from "./format";

/** Onglet pliable de la fiche (en-tête + corps). */
export interface SectionProps {
  tab: Onglet;
  fiche: FicheRecord;
  open: boolean;
  onToggle: () => void;
}
export function Section({ tab, fiche, open, onToggle }: SectionProps) {
  const d = fiche.data,
    T = TAB_TYPES[tab.type];
  const title = tab.titre || T.label;
  const hToday = d.horaires?.find(h => h.jour === today());
  const summary =
    tab.type === "horaires" && hToday
      ? `Aujourd’hui : ${hToday.horaire}`
      : tab.type === "catalogue"
        ? `${(d.sections || []).reduce((a, s) => a + s.articles.filter(x => x.nom).length, 0)} articles`
        : "";
  return (
    <section className={`f-sec${open ? " open" : ""}`}>
      <button className="f-sec-h" onClick={onToggle} aria-expanded={open}>
        <span className="f-ic">
          <I n={T.icon} s={15} />
        </span>
        <b>{title}</b>
        <i className="f-line" />
        {summary && <small>{summary}</small>}
        <span className="f-chev">
          <I n="chev" s={14} />
        </span>
      </button>
      <div className="f-sec-b">
        <div>{open && <SectionBody tab={tab} fiche={fiche} />}</div>
      </div>
    </section>
  );
}

/* ───────── Vidéos de la fiche ───────── */
