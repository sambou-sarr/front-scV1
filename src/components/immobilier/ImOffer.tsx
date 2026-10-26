import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import ServiceCard from '../devis/ServiceCard';
import { quote } from '../devis/quoteStore';
import { usePrices } from '../../lib/prices';
import type { Offre } from '../../data/immobilier';

// Offre par profil (agences, résidences) : visuels, prestations à cocher, bouton de devis pré-rempli.
export default function ImOffer({ data, flip = false }: { data: Offre; flip?: boolean }) {
  const price = usePrices();
  const [a, b] = data.imgs;
  return (
    <section className={`cc-pole ix-offer${flip ? ' flip' : ''}`} id={data.id}>
      <div className="wrap cc-pole-grid">
        <div className={`cc-pole-media rv${b ? ' duo' : ''}`}>
          <figure className="cc-pm cc-pm-a"><Pic img={a} sizes="(max-width: 900px) 92vw, 46vw" /></figure>
          {b && <figure className="cc-pm cc-pm-b"><Pic img={b} sizes="(max-width: 900px) 60vw, 26vw" /></figure>}
        </div>
        <div className="cc-pole-tx">
          <div className="rv">
            <p className="label">{data.label}</p>
            <h2 className="h2">{data.title} <em className="red">{data.red}</em></h2>
            <p className="cc-lead">{data.text}</p>
          </div>
          <ul className="sv-list">{data.services.map((id) => <ServiceCard key={id} id={id} price={price(id)} />)}</ul>
          <p className="ix-point"><Icon id="i-bolt" />{data.point}</p>
          <div className="cc-pole-act">
            <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: 'immobilier', profil: data.profil, from: data.id })}>{data.cta} <Icon id="arr" /></button>
            {data.link && <a className="more" href={data.link.href}>{data.link.label} <Icon id="arr" /></a>}
          </div>
        </div>
      </div>
    </section>
  );
}
