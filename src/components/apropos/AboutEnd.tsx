import { A_END, CONTACT } from '../../data/apropos';
import { Icon } from '../Icons';
import track from '../../utils/track';

// Fin de page : phrase manuscrite de la marque (tracé révélé), coordonnées, prise de contact.
export default function AboutEnd() {
  return (
    <section className="c-cta a-end" id="contact">
      <div className="c-cta-bg" aria-hidden="true" />
      <div className="wrap ae-grid">
        <div className="rv">
          <p className="ae-hand">{A_END.hand}</p>
          <p className="ae-text">{A_END.text}</p>
          <p className="ae-zone"><Icon id="i-pin" />{CONTACT.zone}<span>{CONTACT.reach}</span></p>
        </div>
        <div className="ae-card rv">
          <a className="ae-line" href={`tel:${CONTACT.tel}`} onClick={() => track('lead_call', { source: 'contact' })}><span><Icon id="i-phone" /></span><div><small>Téléphone</small><b>{CONTACT.phone}</b></div></a>
          <a className="ae-line" href={`mailto:${CONTACT.email}`} onClick={() => track('lead_email', { source: 'contact' })}><span><Icon id="i-mail" /></span><div><small>E-mail</small><b>{CONTACT.email}</b></div></a>
          <a className="btn btn-red ae-btn" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Demande de démonstration')}`} onClick={() => track('cta_demo', { source: 'contact' })}>{A_END.cta1} <Icon id="arr" /></a>
          <a className="more light" href="/equipe">{A_END.team} <Icon id="arr" /></a>
        </div>
      </div>
    </section>
  );
}
