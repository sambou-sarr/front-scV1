import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import ServiceCard from '../devis/ServiceCard';
import { quote } from '../devis/quoteStore';
import { usePrices } from '../../lib/prices';
import type { PoleBlock } from '../../data/contenu';
import type { Mode, Production } from '../../types/v5';

/*
  Un pôle de prestations (photo & vidéo, présentateurs, visites 3D, réseaux sociaux).
  Visuels d'un côté, prestations de l'autre ; les côtés s'inversent une section sur deux (flip).
*/
export default function PoleSection({ data, mode, production, flip = false }: { data: PoleBlock; mode: Mode; production?: Production; flip?: boolean }) {
  const price = usePrices();
  const [a, b] = data.imgs;
  return (
    <section className={`cc-pole${flip ? ' flip' : ''}`} id={data.id}>
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
          <ul className="sv-list">{data.services.map((id) => <ServiceCard key={id} id={id} mode={mode} price={price(id)} />)}</ul>
          {data.note && <p className="cc-note"><Icon id="s-home" />{data.note}</p>}
          <div className="cc-pole-act">
            <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: data.pole, production, from: data.id })}>{data.cta} <Icon id="arr" /></button>
            {data.link && <a className="more" href={data.link.href}>{data.link.label} <Icon id="arr" /></a>}
          </div>
        </div>
      </div>
    </section>
  );
}
