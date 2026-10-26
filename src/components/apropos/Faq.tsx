import { useState } from 'react';
import { A_FAQ } from '../../data/apropos';

/*
  FAQ en accordéon (hauteur animée via grid-template-rows 0fr → 1fr)
  + données structurées schema.org FAQPage pour le référencement (résultats enrichis Google).
*/
export default function Faq() {
  const [open, setOpen] = useState(0);
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: A_FAQ.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <section className="faq">
      <div className="wrap faq-grid">
        <div className="rv faq-head">
          <p className="label">{A_FAQ.label}</p>
          <h2 className="h2">{A_FAQ.title}<br /><em className="red">{A_FAQ.red}</em></h2>
        </div>
        <div className="faq-list">
          {A_FAQ.items.map((f, i) => (
            // V5 (correctif) : « rv » sur un conteneur fixe, sinon ouvrir une question efface la classe « in » (Firefox, anciens Safari)
            <div key={f.q} className="rv"><div className={`faq-it${open === i ? ' open' : ''}`}>
              <h3><button aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span><i aria-hidden="true" />
              </button></h3>
              <div className="faq-a" id={`faq-${i}`} role="region"><div><p>{f.a}</p></div></div>
            </div></div>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </section>
  );
}
