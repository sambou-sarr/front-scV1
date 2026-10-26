import { useState } from 'react';
import { flushSync } from 'react-dom';
import { TIERS } from '../../data/cartes';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  « Une carte pour chaque niveau » — sélecteur de niveau + tableau comparatif.
  Le changement de niveau utilise l'API View Transitions (morphing du visuel et du texte),
  avec repli instantané sur les navigateurs qui ne la gèrent pas.
  Sur mobile, le tableau n'affiche que la colonne du niveau sélectionné.
*/
function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <span className="yes" aria-label="Inclus" />;
  if (v === false) return <span className="no" aria-label="Non inclus">—</span>;
  return <span className="val">{v}</span>;
}

export default function TiersSection() {
  const [idx, setIdx] = useState(1);
  const tier = TIERS.list[idx];

  const pick = (i: number) => {
    if (i === idx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce) {
      document.documentElement.dataset.dir = i > idx ? 'next' : 'prev';
      document.startViewTransition(() => flushSync(() => setIdx(i)));
    } else setIdx(i);
  };

  return (
    <section className="tiers" id="niveaux">
      <div className="wrap">
        <div className="sec-head split rv">
          <div>
            <p className="label">{TIERS.label}</p>
            <h2 className="h2">{TIERS.title} <em className="red">{TIERS.red}</em></h2>
          </div>
          <p className="side-note">{TIERS.intro}</p>
        </div>

        <div className="tabs rv" role="tablist" aria-label="Niveau de carte" style={cssVars({ '--i': idx })}>
          <span className="tab-ind" aria-hidden="true" />
          {TIERS.list.map((t, i) => (
            <button key={t.id} role="tab" aria-selected={i === idx} aria-controls="tier-panel" className={i === idx ? 'on' : ''} onClick={() => pick(i)}>{t.name}</button>
          ))}
        </div>

        <div className={`tier-show t-${tier.id}`} id="tier-panel" role="tabpanel">
          <div className="tier-vis"><img src={tier.image} alt={`Carte ${tier.name} Support Connecté tenue en main`} /></div>
          <div className="tier-txt">
            <p className="tier-name">{tier.name}</p>
            <h3>{tier.title}</h3>
            <p className="tier-p">{tier.text}</p>
            <ul>{tier.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            <a className="btn btn-red" href="#creer-ma-carte" onClick={() => window.dispatchEvent(new CustomEvent('studio:tier', { detail: tier.id }))}>{tier.cta} <Icon id="arr" /></a>
          </div>
        </div>

        <h3 className="tbl-title rv">{TIERS.tableTitle}</h3>
        <div className="tbl-wrap rv" data-sel={idx}>
          <table className="tbl">
            <thead>
              <tr><th scope="col">Fonctionnalité</th>{TIERS.list.map((t, i) => <th scope="col" key={t.id} className={`c${i}${i === idx ? ' sel' : ''}`}>{t.name}</th>)}</tr>
            </thead>
            <tbody>
              {TIERS.table.map(([label, ...vals]) => (
                <tr key={label}><th scope="row">{label}</th>{vals.map((v, i) => <td key={i} className={`c${i}${i === idx ? ' sel' : ''}`}><Cell v={v} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
