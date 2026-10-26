import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import AddToQuote from '../devis/AddToQuote';
import { quote } from '../devis/quoteStore';
import { CC_PRINT } from '../../data/contenu';
import { PRESTA } from '../../data/prestations';
import { usePrices } from '../../lib/prices';

/*
  Impression personnalisée : la gamme complète en image, les 12 familles de supports à cocher,
  le circuit atelier (du conseil à la livraison). Tout est sur devis : aucun prix affiché par défaut.
*/
export default function PrintSection() {
  const price = usePrices();
  const P = CC_PRINT;
  return (
    <section className="cc-print" id={P.id}>
      <div className="wrap">
        <div className="cc-print-head">
          <div className="rv">
            <p className="label">{P.label}</p>
            <h2 className="h2">{P.title} <em className="red">{P.red}</em></h2>
          </div>
          <p className="cc-lead rv">{P.text}</p>
        </div>
        <figure className="cc-print-hero rv"><Pic img={P.img} sizes="(max-width: 1360px) 100vw, 1280px" /></figure>
        <div className="cc-print-grid">
          <div>
            <ul className="pr-list">
              {P.services.map((id) => {
                const p = PRESTA[id];
                if (!p) return null;
                return (
                  <li key={id} className="pr">
                    <div><b>{p.label}</b><span>{p.reel}</span>{price(id) && <em className="sv-price">{price(id)}</em>}</div>
                    <AddToQuote id={id} label={p.label} />
                  </li>
                );
              })}
            </ul>
            <p className="cc-quote"><Icon id="i-doc" />{P.quote}</p>
          </div>
          <aside className="cc-print-side">
            <Pic img={P.side} className="cc-poster" sizes="(max-width: 1100px) 0px, 360px" />
          </aside>
        </div>
        <ol className="cc-flow" aria-label="Notre circuit atelier">
          {P.steps.map((s, i) => <li key={s.label}><span className="cc-flow-ic"><Icon id={s.icon} /></span><b>{s.label}</b>{i < P.steps.length - 1 && <i aria-hidden="true" />}</li>)}
        </ol>
        <div className="cc-pole-act">
          <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: 'impression', from: 'impression' })}>{P.cta} <Icon id="arr" /></button>
          {P.links.map((l) => <a key={l.href} className="more" href={l.href}>{l.label} <Icon id="arr" /></a>)}
        </div>
      </div>
    </section>
  );
}
