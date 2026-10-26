import { useEffect, useRef, useState } from 'react';
import { H_TEASER } from '../../data/home';
import { Icon } from '../Icons';
import { FakeQR } from '../cartes/Card3D';

/*
  Accroche vers le module de la page Contact : une carte qui s'écrit toute seule
  (machine à écrire : entreprise → nom → fonction → téléphone, puis effacement et exemple suivant).
  Pause hors écran. Mouvement réduit : premier exemple affiché en entier.
*/
type Field = 'company' | 'name' | 'role' | 'phone';
type Card = Record<Field, string>;
const ORDER: Field[] = ['company', 'name', 'role', 'phone'];

export default function TypeTeaser() {
  const S = H_TEASER.samples;
  const [txt, setTxt] = useState<Card>({ company: '', name: '', role: '', phone: '' });
  const [field, setField] = useState<Field | null>('company');
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTxt(S[0]); setField(null); return; }
    let alive = true, vis = false, t = 0;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: .3 });
    io.observe(box.current!);
    const wait = (ms: number) => new Promise((r) => { t = window.setTimeout(r, ms); });
    const until = async () => { while (alive && !vis) await wait(300); };
    (async () => {
      let k = 0;
      while (alive) {
        const s = S[k % S.length];
        for (const f of ORDER) {
          setField(f);
          for (let i = 1; i <= s[f].length && alive; i++) { await until(); setTxt((x) => ({ ...x, [f]: s[f].slice(0, i) })); await wait(55 + Math.random() * 45); }
          await wait(220);
        }
        setField(null); await wait(2200);
        for (const f of [...ORDER].reverse()) { setField(f); while (alive) { let done = false; setTxt((x) => { if (!x[f]) { done = true; return x; } return { ...x, [f]: x[f].slice(0, -1) }; }); if (done) break; await wait(18); } }
        k++;
      }
    })();
    return () => { alive = false; clearTimeout(t); io.disconnect(); };
  }, [S]);

  const L = (f: Field, cls: string, icon: string | null, ph: string) => (
    <span className={`cs-l ${cls}${txt[f] ? '' : ' ph'}${field === f ? ' typing' : ''}`}>{icon && <Icon id={icon} />}<span className="cs-t">{txt[f] || ph}</span></span>
  );

  return (
    <section className="h2-teaser" ref={box}>
      <div className="wrap tt-grid">
        <div className="rv">
          <p className="label light">{H_TEASER.label}</p>
          <h2 className="h2">{H_TEASER.title} <em className="red">{H_TEASER.red}</em></h2>
          <p className="tt-p">{H_TEASER.text}</p>
          <a className="btn btn-red" href={H_TEASER.href}>{H_TEASER.cta} <Icon id="arr" /></a>
        </div>
        <div className="tt-vis" aria-hidden="true">
          <div className="cs-card t-pro tt-card">
            <div className="cs-rot">
              <div className="cs-face cs-front">
                <div className="cs-row">{L('company', 'cs-co', null, ' ')}<span className="cs-nfc"><Icon id="nfc" /></span></div>
                {L('name', 'cs-nm', null, ' ')}
                {L('role', 'cs-ro', null, ' ')}
                <span className="cs-rule" />
                {L('phone', 'cs-ln', 'i-phone', ' ')}
                <span className="cs-qr"><FakeQR /></span>
                <span className="cs-glare" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
