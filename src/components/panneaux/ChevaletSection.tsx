import { useState } from 'react';
import { P_CHEVALET } from '../../data/panneaux';
import { Head } from '../qr/PhoneScreens';

/*
  Chevalet trottoir : l'affiche ne change pas, le menu du jour si.
  Le jour courant est sélectionné automatiquement (horloge de l'appareil).
*/
const today = () => (new Date().getDay() + 6) % 7; // lundi = 0

export default function ChevaletSection() {
  const [d, setD] = useState(today);
  const [day, dish] = P_CHEVALET.days[d];
  return (
    <section className="chevalet" id="chevalet">
      <div className="wrap ch-grid">
        <div className="ch-txt rv">
          <p className="label">{P_CHEVALET.label}</p>
          <h2 className="h2">{P_CHEVALET.title}<br /><em className="red">{P_CHEVALET.red}</em></h2>
          <p className="ch-p">{P_CHEVALET.text}</p>
          <div className="ch-days" role="radiogroup" aria-label="Jour de la semaine">
            {P_CHEVALET.days.map(([dd], i) => <button key={dd} role="radio" aria-checked={i === d} className={i === d ? 'on' : ''} onClick={() => setD(i)}>{dd}{i === today() && <small>Auj.</small>}</button>)}
          </div>
          <blockquote className="ch-quote"><p>{P_CHEVALET.quote[0]}<br /><em className="red">{P_CHEVALET.quote[1]}</em></p><footer>{P_CHEVALET.sub}</footer></blockquote>
        </div>
        <div className="ch-vis">
          <img className="ch-board" src="/images/chevalet.webp" alt="Chevalet trottoir en bois, affiche Menu digital avec QR code" loading="lazy" />
          <div className="phone static ch-phone" aria-live="polite">
            <div className="screen">
              <div className="isl" />
              <div className="ps">
                <Head sub="Menu du jour" />
                <div className="ch-dish" key={d}><small>{day} · Plat du jour</small><b>{dish}</b></div>
                <div className="ps-cat"><small>Toujours à la carte</small><p><span>Salade de la baie</span><b>3 500 F</b></p><p><span>Jus de bissap</span><b>1 500 F</b></p></div>
                <span className="ps-btn">Réserver une table</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
