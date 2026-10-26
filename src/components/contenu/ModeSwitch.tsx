import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import { CC_MODE } from '../../data/contenu';
import track from '../../utils/track';
import type { Mode } from '../../types/v5';

/*
  Choix « Tournage réel / Avec l'IA » : un seul état pour toute la page.
  Les cartes de prestations affichent la description correspondante, et le choix pré-remplit
  le champ « Production » du formulaire de devis.
*/
export default function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const pick = (m: Mode) => { if (m !== mode) track('mode_switch', { mode: m }); onChange(m); };
  return (
    <section className="cc-mode" id="production">
      <div className="wrap">
        <div className="cc-head rv">
          <p className="label">{CC_MODE.label}</p>
          <h2 className="h2">{CC_MODE.title} <em className="red">{CC_MODE.red}</em></h2>
        </div>
        <div className="cc-mode-grid" role="radiogroup" aria-label={CC_MODE.label}>
          {CC_MODE.options.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={mode === o.id} className={`cc-mode-opt${mode === o.id ? ' on' : ''}`} onClick={() => pick(o.id)}>
              <span className="cc-mode-img"><Pic img={o.img} sizes="(max-width: 900px) 92vw, 40vw" /></span>
              <span className="cc-mode-tx">
                <span className="cc-mode-k"><i aria-hidden="true">{mode === o.id ? <Icon id="i-check" /> : null}</i>{o.title}</span>
                <span>{o.text}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="cc-mode-hint" aria-live="polite"><Icon id="i-sync" /><span>{CC_MODE.hint} <b>{mode === 'ia' ? 'Affichage : avec l’IA.' : 'Affichage : tournage réel.'}</b></span></p>
        <div className="cc-mode-notes">
          <p>{CC_MODE.both}</p>
          <p className="cc-ethics"><Icon id="i-shield" />{CC_MODE.ethics}</p>
        </div>
      </div>
    </section>
  );
}
