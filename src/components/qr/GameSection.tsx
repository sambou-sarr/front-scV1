import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Q_GAME } from '../../data/qr';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  QR Smart (avis + jeu) — les deux jeux sont jouables directement sur la page.
  La roue : rotation CSS vers un lot tiré au sort. Les trois boîtes : ouverture 3D.
  (Démonstration : les vrais lots et probabilités sont réglés par le client.)
*/
function Wheel() {
  const L = Q_GAME.wheel, n = L.length, seg = 360 / n;
  const [rot, setRot] = useState(0), [res, setRes] = useState<string | null>(null), [busy, setBusy] = useState(false);
  const spin = () => {
    if (busy) return;
    const i = Math.floor(Math.random() * n);
    const base = Math.ceil(rot / 360) * 360 + 360 * 5;
    setBusy(true); setRes(null); setRot(base - (i * seg + seg / 2));
    setTimeout(() => { setRes(L[i]); setBusy(false); }, 4300);
  };
  // Chaque libellé suit la longueur de sa case, du bord vers le centre (jamais à cheval sur la case voisine).
  // Libellé de deux mots = deux lignes côte à côte dans la même case. Cases « Perdu » en sombre.
  const r = 100, rMid = 60, arcs = L.map((lab, i) => {
    const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180, am = ((i + .5) * seg - 90);
    const d = `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}Z`;
    const lost = lab === 'Perdu', words = lab.split(' '), lines = words.length > 1 && lab.length > 7 ? [words[0], words.slice(1).join(' ')] : [lab];
    const fill = lost ? '#2a2a2c' : i % 2 ? '#f5efe6' : '#b8532e', ink = lost || !(i % 2) ? '#fff' : '#3a2418';
    return (
      <g key={i}>
        <path d={d} fill={fill} stroke="#fff" strokeWidth="1" />
        <g transform={`rotate(${am}) translate(${rMid} 0) rotate(180)`}>
          {lines.map((t, k) => <text key={k} y={lines.length === 1 ? 0 : (k ? 5.4 : -5.4)} textAnchor="middle" dominantBaseline="central" fontSize={lines.length === 1 ? 9 : 8.2} fontWeight="700" fontFamily="'Plus Jakarta Sans', Inter, sans-serif" fill={ink} letterSpacing=".2">{t}</text>)}
        </g>
      </g>
    );
  });
  return (
    <div className="g-wheel">
      <div className="gw-ptr" aria-hidden="true" />
      <svg viewBox="-104 -104 208 208" className="gw-disc" style={{ transform: `rotate(${rot}deg)` }} aria-hidden="true">
        {arcs}<circle r="16" fill="#fff" stroke="#b8532e" strokeWidth="3" />
      </svg>
      <button className="btn btn-red gw-btn" onClick={spin} disabled={busy}>{busy ? 'La roue tourne…' : res ? 'Rejouer' : 'Tourner la roue'}</button>
      <Result res={res} />
    </div>
  );
}

function Boxes() {
  const [opened, setOpened] = useState<number | null>(null), [prizes, setPrizes] = useState(Q_GAME.boxes);
  const pick = (i: number) => {
    if (opened !== null) return;
    setPrizes([...Q_GAME.boxes].sort(() => Math.random() - .5)); setOpened(i);
  };
  return (
    <div className="g-boxes">
      <p className="gb-q">Choisissez une boîte</p>
      <div className="gb-row">
        {prizes.map((p, i) => (
          <button key={i} className={`box${opened === i ? ' open' : ''}${opened !== null && opened !== i ? ' other' : ''}`} onClick={() => pick(i)} aria-label={`Boîte ${i + 1}`}>
            <span className="lid" /><span className="body"><Icon id="i-gift" /></span>
            {opened !== null && <span className="prize">{p}</span>}
          </button>
        ))}
      </div>
      {opened !== null && <button className="btn btn-line dark gb-again" onClick={() => setOpened(null)}>Rejouer</button>}
      <Result res={opened !== null ? prizes[opened] : null} />
    </div>
  );
}

function Result({ res }: { res: string | null }) {
  return (
    <div className={`g-res${res ? ' on' : ''}`} aria-live="polite">
      {res && (res === 'Perdu'
        ? <p><b>Pas cette fois…</b><small>Merci pour votre avis, à bientôt !</small></p>
        : <p><b>Gagné : {res}</b><small>Bon valable lors de votre prochaine visite</small></p>)}
    </div>
  );
}

export default function GameSection() {
  const [tab, setTab] = useState(0);
  const t = Q_GAME.tabs[tab];
  const pick = (i: number) => {
    if (i === tab) return;
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(() => flushSync(() => setTab(i)));
    else setTab(i);
  };
  return (
    <section className="q-game" id="jeu">
      <div className="wrap">
        <div className="sec-head split rv">
          <div><p className="label">{Q_GAME.label}</p><h2 className="h2">{Q_GAME.title}<br /><em className="red">{Q_GAME.red}</em></h2></div>
          <p className="side-note">{Q_GAME.text}</p>
        </div>

        <div className="tabs rv" role="tablist" aria-label="Type de jeu" style={cssVars({ '--i': tab, '--n': 2 })}>
          <span className="tab-ind two" aria-hidden="true" />
          {Q_GAME.tabs.map((x, i) => <button key={x.id} role="tab" aria-selected={i === tab} className={i === tab ? 'on' : ''} onClick={() => pick(i)}>{x.label}</button>)}
        </div>

        <div className="qg-grid">
          <figure className="qg-sticker">
            <img src={t.img} alt={t.caption} />
            <figcaption>{t.caption}</figcaption>
          </figure>
          <div className="qg-arrow" aria-hidden="true"><Icon id="arr" /><span>Le client scanne</span></div>
          <div className="phone static qg-phone">
            <div className="screen">
              <div className="isl" />
              <div className="qg-screen">
                <p className="qg-thx"><span>{[0, 1, 2, 3, 4].map((i) => <Icon key={i} id="i-star" />)}</span>Merci pour votre avis !</p>
                {tab === 0 ? <Wheel /> : <Boxes />}
              </div>
            </div>
          </div>
        </div>
        <p className="qg-try rv">Essayez : la démonstration est jouable.</p>

        <div className="qg-cols">
          {Q_GAME.cols.map((c) => (
            <div key={c.title} className="qg-col rv"><b className="bar" /><h3>{c.title}</h3><ul>{c.items.map((x) => <li key={x}>{x}</li>)}</ul></div>
          ))}
        </div>
      </div>
    </section>
  );
}
