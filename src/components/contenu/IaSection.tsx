import { Icon } from '../Icons';
import ServiceCard from '../devis/ServiceCard';
import IaDemo from './IaDemo';
import { quote } from '../devis/quoteStore';
import { CC_IA } from '../../data/contenu';
import { usePrices } from '../../lib/prices';

// IA & automatisation : démonstration, six usages concrets, méthode en quatre temps.
export default function IaSection() {
  const price = usePrices();
  const A = CC_IA;
  return (
    <section className="cc-ia" id={A.id}>
      <div className="wrap">
        <div className="cc-ia-top">
          <div className="rv">
            <p className="label light">{A.label}</p>
            <h2 className="h2">{A.title} <em className="red">{A.red}</em></h2>
            <p className="cc-lead">{A.text}</p>
            <p className="cc-proof"><Icon id="i-bolt" />{A.proof}</p>
          </div>
          <IaDemo />
        </div>
        <ul className="sv-list dark">{A.services.map((id) => <ServiceCard key={id} id={id} price={price(id)} />)}</ul>
        <ol className="ia-method">
          {A.steps.map((s) => <li key={s.n}><span>{s.n}</span><b>{s.title}</b><p>{s.text}</p></li>)}
        </ol>
        <div className="cc-pole-act">
          <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: 'ia', from: 'ia' })}>{A.cta} <Icon id="arr" /></button>
        </div>
      </div>
    </section>
  );
}
