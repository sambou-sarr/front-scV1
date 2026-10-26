import { Icon } from '../Icons';
import { quote } from '../devis/quoteStore';
import { IM_PACKS } from '../../data/immobilier';
import { PRESTA } from '../../data/prestations';
import { usePrices } from '../../lib/prices';

// Trois formules promoteurs : le bouton ouvre le devis avec toutes les prestations de la formule déjà cochées.
export default function ImPacks() {
  const P = IM_PACKS;
  const price = usePrices();
  return (
    <section className="ix-packs" id="formules">
      <div className="wrap">
        <div className="rv">
          <p className="label">{P.label}</p>
          <h2 className="h2">{P.title} <em className="red">{P.red}</em></h2>
        </div>
        <div className="ix-pack-grid">
          {P.packs.map((k) => (
            <article key={k.id} className={`ix-pack rv${k.featured ? ' hot' : ''}`}>
              {k.featured && <span className="ix-pack-flag">{P.featured}</span>}
              <h3>{k.name}</h3>
              <p className="ix-pack-pitch">{k.pitch}</p>
              <p className="ix-pack-price">{price(k.id) || P.quote}</p>
              <ul>{k.services.map((id) => PRESTA[id] && <li key={id}><Icon id="i-check" />{PRESTA[id].label}</li>)}</ul>
              <button type="button" className={`btn ${k.featured ? 'btn-red' : 'btn-line dark'}`}
                onClick={() => quote.open({ pole: 'immobilier', profil: 'promoteur', stade: k.stade, services: k.services, from: k.id })}>
                {P.cta} <Icon id="arr" />
              </button>
            </article>
          ))}
        </div>
        <p className="ix-pack-note">{P.note}</p>
      </div>
    </section>
  );
}
