import { useEffect, useRef, useState } from 'react';
import { Q_STICKERS, Q_USES } from '../../data/qr';
import { Icon } from '../Icons';
import { SCREENS } from './PhoneScreens';

/*
  « Ce que votre client scanne. Ce qu'il obtient. »
  Scène sticky pilotée par le scroll : à chaque palier, le sticker change (bascule 3D),
  un faisceau de scan part vers le téléphone et l'écran correspondant s'anime.
  La liste de gauche est cliquable : elle fait défiler jusqu'au palier choisi.
*/
export default function UseCasesSection() {
  const [idx, setIdx] = useState(0);
  const sec = useRef<HTMLElement>(null), prog = useRef<HTMLElement>(null), cur = useRef(-1);
  const N = Q_STICKERS.length;

  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const r = sec.current!.getBoundingClientRect(), span = r.height - innerHeight;
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = Math.max(0, Math.min(1, -r.top / span));
      prog.current!.style.transform = `scaleY(${p})`;
      const i = Math.min(N - 1, Math.floor(p * N));
      if (i !== cur.current) { cur.current = i; setIdx(i); }
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); frame();
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, [N]);

  const goTo = (i: number) => {
    const el = sec.current!, span = el.offsetHeight - innerHeight;
    window.scrollTo({ top: el.offsetTop + span * ((i + .5) / N), behavior: 'smooth' });
  };
  const s = Q_STICKERS[idx];

  return (
    <section className="q-uses" id="usages" ref={sec} style={{ height: `${N * 90 + 100}vh` }}>
      <div className="pin">
        <div className="wrap qu-grid">
          <div className="qu-head">
            <p className="label">{Q_USES.label}</p>
            <h2 className="h2">{Q_USES.title}<br /><em className="red">{Q_USES.red}</em></h2>
          </div>

          <div className="qu-nav">
            <span className="qu-track" aria-hidden="true"><i ref={prog} /></span>
            <ol>
              {Q_STICKERS.map((st, i) => (
                <li key={st.id} className={i === idx ? 'on' : i < idx ? 'done' : ''}>
                  <button onClick={() => goTo(i)} aria-current={i === idx ? 'step' : undefined}>
                    <b>{st.label}</b><span>{st.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="qu-stage" aria-live="polite">
            <div className="qu-sticker">
              <img key={s.id} src={s.img} alt={`Sticker ${s.label}`} className="qu-flip" />
              <p className="qu-where"><Icon id="i-pin" /><span><small>{Q_USES.whereLabel}</small>{s.where}</span></p>
            </div>
            <div className="qu-beam" aria-hidden="true"><i key={s.id} /></div>
            <div className="phone static qu-phone" aria-hidden="true">
              <div className="screen">
                <div className="isl" />
                {Q_STICKERS.map((st, i) => { const S = SCREENS[st.id as keyof typeof SCREENS]; return <div key={st.id} className={`qu-scr${i === idx ? ' on' : ''}`}><S /></div>; })}
              </div>
            </div>
          </div>

          <div className="qu-mob" aria-hidden="true"><b>{s.label}</b><span>{s.text}</span></div>
        </div>
      </div>
    </section>
  );
}
