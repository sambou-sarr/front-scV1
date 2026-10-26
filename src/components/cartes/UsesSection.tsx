import { USES } from '../../data/cartes';
import { Icon } from '../Icons';

// « Un même support physique » — 5 usages, chacun avec une micro-animation propre (CSS pur).
export default function UsesSection() {
  return (
    <section className="uses">
      <div className="wrap">
        <div className="sec-head split rv">
          <div>
            <p className="label">{USES.label}</p>
            <h2 className="h2">{USES.title}<br /><em className="red">{USES.red}</em></h2>
          </div>
          <p className="side-note">{USES.side}</p>
        </div>
        <ul className="use-grid">
          {USES.items.map((u) => (
            <li key={u.key} className={`use rv use-${u.key}`}>
              <div className="use-vis" aria-hidden="true">
                <span className="use-ic"><Icon id={u.icon} /></span>
                {u.key === 'call' && <><i className="ring r1" /><i className="ring r2" /></>}
                {u.key === 'wa' && <span className="bubble"><i /><i /><i /></span>}
                {u.key === 'review' && <span className="stars">{[0, 1, 2, 3, 4].map((s) => <Icon key={s} id="i-star" />)}</span>}
                {u.key === 'shop' && <span className="grid4"><i /><i /><i /><i /></span>}
                {u.key === 'book' && <span className="okmark"><Icon id="i-check" /></span>}
              </div>
              <h3>{u.title}</h3>
              <p>{u.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
