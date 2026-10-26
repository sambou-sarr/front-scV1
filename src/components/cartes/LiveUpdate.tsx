import { useEffect, useRef, useState } from 'react';
import { LIVE } from '../../data/cartes';
import type { LiveChange, LiveData } from '../../data/cartes';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  « Votre contenu évolue, pas votre support » — démonstration interactive.
  Un clic modifie la page : les trois cartes déjà distribuées reçoivent la mise à jour
  (impulsion animée), sans changer. Défilement automatique tant que l'utilisateur n'a pas cliqué.
*/
const initial = Object.fromEntries(LIVE.changes.map((c) => [c.field, c.from])) as LiveData;

export default function LiveUpdate() {
  const [data, setData] = useState(initial);
  const [hot, setHot] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const box = useRef<HTMLDivElement>(null), user = useRef(false), cursor = useRef(0);

  const apply = (c: LiveChange, fromUser?: boolean) => {
    if (fromUser) user.current = true;
    setData((d) => ({ ...d, [c.field]: d[c.field] === c.to ? c.from : c.to }));
    setDone((d) => ({ ...d, [c.key]: !d[c.key] }));
    setHot(c.field); setPulse((p) => p + 1);
    setTimeout(() => setHot(null), 1400);
  };

  useEffect(() => {
    const el = box.current!; let id = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id);
      if (e.isIntersecting && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        id = window.setInterval(() => { if (user.current) return clearInterval(id); apply(LIVE.changes[cursor.current++ % LIVE.changes.length]); }, 2800);
      }
    }, { threshold: .5 });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(id); };
  }, []);

  return (
    <section className="live">
      <div className="wrap lv-grid">
        <div className="lv-txt rv">
          <p className="label">{LIVE.label}</p>
          <h2 className="h2">{LIVE.title}<br /><em className="red">{LIVE.red}</em></h2>
          <p>{LIVE.text}</p>
          <div className="lv-btns" role="group" aria-label="Simuler une modification">
            {LIVE.changes.map((c) => (
              <button key={c.key} className={done[c.key] ? 'on' : ''} aria-pressed={!!done[c.key]} onClick={() => apply(c, true)}>
                <Icon id="i-pen" />{c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lv-demo" ref={box}>
          <div className="lv-cards">
            <p className="lv-cap">{LIVE.distributed}</p>
            {[0, 1, 2].map((i) => (
              <div key={i + '-' + pulse} className={`lv-card${pulse ? ' got' : ''}`} style={cssVars({ '--d': i * .12 + 's' })}>
                <img src="/images/main-carte-detouree.webp" alt="" /><span className="lv-ok"><Icon id="i-check" /></span>
              </div>
            ))}
          </div>
          <div className="lv-wire" aria-hidden="true"><i key={pulse} className={pulse ? 'go' : ''} /></div>
          <div className="phone static lv-phone" aria-live="polite">
            <div className="screen">
              <div className="isl" />
              <div className="lv-page">
                <div className="lv-head"><b>LE SUNSET</b><small>Restaurant, Saly</small></div>
                <div className={`lv-row${hot === 'phone' ? ' hot' : ''}`}><Icon id="i-phone" /><div><small>Téléphone</small><b>{data.phone}</b></div></div>
                <div className={`lv-row${hot === 'hours' ? ' hot' : ''}`}><Icon id="i-cal" /><div><small>Horaires</small><b>{data.hours}</b></div></div>
                <div className={`lv-row cat${hot === 'catalog' ? ' hot' : ''}`}><Icon id="i-menu" /><div><small>Menu du jour</small>{data.catalog.map((c) => <b key={c}>{c}</b>)}</div></div>
                <p className="lv-sync"><Icon id="i-sync" />{hot ? 'Mis à jour à l’instant' : 'Page à jour'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="lv-caption wrap rv"><span>{LIVE.caption}</span></p>
    </section>
  );
}
