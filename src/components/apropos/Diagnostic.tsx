import { useMemo, useState } from 'react';
import { A_QUIZ, CATALOG, CONTACT } from '../../data/apropos';
import type { CatalogItem, QuizKey } from '../../data/apropos';
import { cssVars } from '../../lib/css';
import { SECTORS, CATS } from '../../data/secteurs';
import { Icon } from '../Icons';
import track from '../../utils/track';

/*
  Diagnostic express : 3 questions → 3 supports recommandés (descriptions du catalogue)
  → envoi d'une demande pré-remplie (e-mail) ou appel direct.
  Le score combine : produits du secteur (+3), priorité choisie (+4 → +1 selon l'ordre),
  taille du projet (+2). À brancher plus tard sur un formulaire ou un CRM (voir README).
*/
type Answers = Partial<Record<QuizKey, string>>;
interface Opt { id: string; label: string; icon?: string }

function recommend(sector?: string, goal?: string, scale?: string): (CatalogItem & { s: number; idx: number })[] {
  const sec = SECTORS.find((s) => s.id === sector);
  const inSector = new Set(sec ? sec.supports.map((u) => u.title) : []);
  const g = A_QUIZ.steps[1].options!.find((o) => o.id === goal)?.boost || [];
  const sc = A_QUIZ.steps[2].options!.find((o) => o.id === scale)?.boost || [];
  return CATALOG.map((p, idx) => {
    let s = 0;
    if (inSector.has(p.t)) s += 3;
    const gi = g.indexOf(p.t); if (gi >= 0) s += 4 - gi;
    if (sc.includes(p.t)) s += 2;
    return { ...p, s, idx };
  }).sort((a, b) => b.s - a.s || a.idx - b.idx).slice(0, 3);
}

export default function Diagnostic() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Answers>({});
  const [dir, setDir] = useState(1);
  const sectorOpts: Opt[] = [...SECTORS.map((s) => ({ id: s.id, label: s.name, icon: s.icon })), { id: 'autre', label: A_QUIZ.other, icon: 'i-scan' }];
  const opts: Opt[] = step === 0 ? sectorOpts : step < 3 ? A_QUIZ.steps[step].options! : [];
  const res = useMemo(() => (step === 3 ? recommend(ans.sector, ans.goal, ans.scale) : []), [step, ans]);

  const choose = (id: string) => {
    const key = A_QUIZ.steps[step].key;
    track('diag_answer', { step: step + 1, question: key, answer: id });
    if (step === 2) track('diag_result', { sector: ans.sector, goal: ans.goal, scale: id });
    setAns((a) => ({ ...a, [key]: id })); setDir(1); setStep((s) => s + 1);
  };
  const back = () => { setDir(-1); setStep((s) => Math.max(0, s - 1)); };
  const restart = () => { setDir(-1); setAns({}); setStep(0); };

  const label = (k: QuizKey, id: string | undefined) => (k === 'sector' ? sectorOpts : A_QUIZ.steps.find((s) => s.key === k)!.options!).find((o) => o.id === id)?.label || '';
  const body = step === 3 ? [
    'Bonjour,', '', 'Je souhaite une démonstration Support Connecté.',
    `Activité : ${label('sector', ans.sector)}`, `Priorité : ${label('goal', ans.goal)}`, `Points de contact : ${label('scale', ans.scale)}`,
    `Supports recommandés : ${res.map((r) => r.t).join(', ')}`, '', 'Mes coordonnées :',
  ].join('\n') : '';
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Demande de démonstration — diagnostic')}&body=${encodeURIComponent(body)}`;

  return (
    <section className="diag" id="diagnostic">
      <div className="wrap dg-grid">
        <div className="dg-txt rv">
          <p className="label light">{A_QUIZ.label}</p>
          <h2 className="h2">{A_QUIZ.title}<br /><em className="red">{A_QUIZ.red}</em></h2>
          <p>{A_QUIZ.text}</p>
          <ol className="dg-steps" aria-hidden="true">
            {A_QUIZ.steps.map((s, i) => <li key={s.key} className={i === step ? 'on' : i < step ? 'done' : ''}><span>{i + 1}</span>{i < step ? label(s.key, ans[s.key]) : s.q}</li>)}
          </ol>
        </div>

        <div className="dg-card" aria-live="polite">
          <div className="dg-bar"><i style={{ transform: `scaleX(${Math.min(step, 3) / 3})` }} /></div>
          <div className={`dg-pane ${dir > 0 ? 'fwd' : 'bwd'}`} key={step}>
            {step < 3 ? (
              <>
                <p className="dg-count">Question {step + 1} / 3</p>
                <h3>{A_QUIZ.steps[step].q}</h3>
                <div className={`dg-opts${step === 0 ? ' many' : ''}`}>
                  {opts.map((o) => (
                    <button key={o.id} className={ans[A_QUIZ.steps[step].key] === o.id ? 'on' : ''} onClick={() => choose(o.id)}>
                      {o.icon && <Icon id={o.icon} />}<span>{o.label}</span><Icon id="arr" />
                    </button>
                  ))}
                </div>
                {step > 0 && <button className="dg-back" onClick={back}>← {A_QUIZ.back}</button>}
              </>
            ) : (
              <>
                <p className="dg-count">{A_QUIZ.resultTitle}</p>
                <ul className="dg-res">
                  {res.map((r, i) => (
                    <li key={r.t} style={cssVars({ '--i': i })}>
                      <a href={CATS[r.cat].href} className="cat"><Icon id={CATS[r.cat].icon} />{CATS[r.cat].short}</a>
                      <b>{r.t}</b><span>{r.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="dg-next"><b>{A_QUIZ.next}</b><span>{A_QUIZ.nextText}</span></div>
                <div className="dg-ctas">
                  <a className="btn btn-red" href={mail} onClick={() => track('lead_email', { source: 'diagnostic' })}>{A_QUIZ.send} <Icon id="arr" /></a>
                  <a className="btn btn-line dark" href={`tel:${CONTACT.tel}`} onClick={() => track('lead_call', { source: 'diagnostic' })}><Icon id="i-phone" />{A_QUIZ.call}</a>
                </div>
                <button className="dg-back" onClick={restart}>↺ {A_QUIZ.restart}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
