import { useMemo, useState } from 'react';
import { Icon } from '../Icons';
import { IM_LOTS } from '../../data/immobilier';
import track from '../../utils/track';

/*
  Démonstration : le promoteur change le statut d'un lot dans son espace (à gauche),
  la fiche que voit l'acheteur se met à jour (téléphone, à droite). Données fictives.
*/
type St = 'd' | 'r' | 'v';
const NEXT: Record<St, St> = { d: 'r', r: 'v', v: 'd' };
const LABEL: Record<St, string> = { d: 'Disponible', r: 'Réservé', v: 'Vendu' };

export default function ImLots() {
  const L = IM_LOTS;
  const lots = useMemo(() => {
    const out: { id: string; type: string }[] = [];
    L.types.forEach((t) => { for (let i = 1; i <= t.count; i++) out.push({ id: `${t.id}-${String(i).padStart(2, '0')}`, type: t.id }); });
    return out;
  }, [L.types]);
  const [st, setSt] = useState<St[]>(() => L.initial.split('') as St[]);
  const [flash, setFlash] = useState(0);
  const dispo = (type?: string) => lots.filter((l, i) => st[i] === 'd' && (!type || l.type === type)).length;
  const tap = (i: number) => {
    setSt((s) => s.map((x, j) => (j === i ? NEXT[x] : x)));
    setFlash((f) => f + 1);
    track('demo_lot', { lot: lots[i].id, to: NEXT[st[i]] });
  };
  return (
    <section className="ix-lots">
      <div className="wrap ix-lots-grid">
        <div className="ix-lots-tx rv">
          <p className="label">{L.label}</p>
          <h2 className="h2">{L.title} <em className="red">{L.red}</em></h2>
          <p className="cc-lead">{L.text}</p>
          <ul className="ix-ticks">{L.points.map((p) => <li key={p}><Icon id="i-check" />{p}</li>)}</ul>
        </div>
        <div className="ix-demo">
          <div className="ix-board">
            <p className="ix-k">{L.board}<small>{L.programme.nom}</small></p>
            <div className="ix-legend" aria-hidden="true"><span className="d">Disponible</span><span className="r">Réservé</span><span className="v">Vendu</span></div>
            {L.types.map((t) => (
              <div key={t.id} className="ix-floor">
                <b>{t.id}</b>
                <div>{lots.map((l, i) => l.type === t.id && (
                  <button key={l.id} type="button" className={`ix-lot ${st[i]}`} onClick={() => tap(i)} aria-label={`Lot ${l.id} : ${LABEL[st[i]]}. Changer le statut`}>{l.id.slice(-2)}</button>
                ))}</div>
              </div>
            ))}
            <p className="ix-hint"><Icon id="i-sync" />{L.hint}</p>
          </div>
          <div className="ix-phone-col">
            <p className="ix-k">{L.phone}</p>
            <div className="phone static ix-phone">
              <div className="screen">
                <div className="isl" />
                <div className="ix-scr">
                  <div className="ix-cover"><span>{L.programme.tag}</span><b>{L.programme.nom}</b><small>{L.programme.lieu}</small></div>
                  <p className="ix-count" key={flash}><b>{dispo()}</b> lots disponibles sur {lots.length}</p>
                  <ul className="ix-types">
                    {L.types.map((t) => (
                      <li key={t.id}><span className="ix-t">{t.id}</span><span><b>{t.surface}</b><small>à partir de {t.prix}</small></span><em className={dispo(t.id) ? '' : 'none'}>{dispo(t.id) ? `${dispo(t.id)} dispo.` : 'Complet'}</em></li>
                    ))}
                  </ul>
                  <ul className="ix-acts">{L.actions.map((a, i) => <li key={a} className={i === L.actions.length - 1 ? 'cta' : undefined}>{a}</li>)}</ul>
                  {flash > 0 && <p className="ix-upd" key={`u${flash}`}><Icon id="i-check" />Mis à jour à l’instant</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
