import { useState } from 'react';

export interface FaqData { label: string; title: string; red: string; items: { q: string; a: string }[] }

// FAQ en accordéon réutilisable (mêmes classes que la FAQ « À propos » : styles/apropos.css)
// + données structurées FAQPage pour les résultats enrichis de Google.
// La classe d'apparition « rv » est sur un conteneur dont la classe ne change jamais : ouvrir une question
// ne doit pas effacer la classe « in » posée par useReveal (sinon la question redevient invisible).
export default function FaqList({ data, id }: { data: FaqData; id: string }) {
  const [open, setOpen] = useState(0);
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: data.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <section className="faq" id={id}>
      <div className="wrap faq-grid">
        <div className="rv faq-head">
          <p className="label">{data.label}</p>
          <h2 className="h2">{data.title}<br /><em className="red">{data.red}</em></h2>
        </div>
        <div className="faq-list">
          {data.items.map((f, i) => (
            <div key={f.q} className="rv"><div className={`faq-it${open === i ? ' open' : ''}`}>
              <h3><button type="button" aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span><i aria-hidden="true" />
              </button></h3>
              <div className="faq-a" id={`${id}-${i}`} role="region"><div><p>{f.a}</p></div></div>
            </div></div>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </section>
  );
}
