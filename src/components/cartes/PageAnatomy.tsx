import { ANATOMY } from '../../data/cartes';
import { DemoPage } from '../PhoneMockup';
import { cssVars } from '../../lib/css';

/*
  « Une page à votre nom » — téléphone annoté.
  Les traits de liaison se dessinent avec le scroll (CSS scroll-driven animations),
  repli automatique sur l'apparition classique (.rv) si le navigateur ne les gère pas.
*/
export default function PageAnatomy() {
  return (
    <section className="anatomy">
      <div className="wrap an-grid">
        <div className="an-txt rv">
          <p className="label">{ANATOMY.label}</p>
          <h2 className="h2">{ANATOMY.title}</h2>
          <p className="an-red">{ANATOMY.red}</p>
          <p className="an-p">{ANATOMY.text}</p>
        </div>
        <div className="an-phone">
          <div className="phone static" aria-hidden="true">
            <div className="screen"><div className="isl" /><DemoPage className="show" /></div>
          </div>
          <ol className="callouts">
            {ANATOMY.callouts.map((c, i) => (
              <li key={c.title} className="co" style={cssVars({ '--at': c.at + '%', '--i': i })}>
                <span className="co-line" aria-hidden="true"><i /></span>
                <span className="co-dot" aria-hidden="true">{i + 1}</span>
                <div><b>{c.title}</b><span>{c.text}</span></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
