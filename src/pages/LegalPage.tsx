import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import { CONTACT } from '../data/apropos';

// Mentions légales et politique de confidentialité — ⚠️ gabarits à compléter avant mise en ligne.
const T: Record<string, { title: string; blocks: [string, string][] }> = {
  '/mentions-legales': {
    title: 'Mentions légales',
    blocks: [
      ['Éditeur du site', `Support Connecté — ${CONTACT.zone}. Téléphone : ${CONTACT.phone}. E-mail : ${CONTACT.email}.`],
      ['Structure juridique', '[À COMPLÉTER : raison sociale, forme, capital, RCCM, NINEA, siège, représentant légal.]'],
      ['Directeur de la publication', '[À COMPLÉTER]'],
      ['Hébergement', '[À COMPLÉTER : hébergeur du site, adresse.]'],
      ['Propriété intellectuelle', 'Les textes, visuels et marques présentés sur ce site appartiennent à Support Connecté ou à leurs auteurs. Les univers de marque présentés en exemple sont des créations de démonstration.'],
    ],
  },
  '/confidentialite': {
    title: 'Politique de confidentialité',
    blocks: [
      ['Données collectées', 'Via les formulaires du site : nom, fonction, entreprise, téléphone, e-mail, ville, message, et les éléments de design (logo, images) que vous choisissez d’envoyer.'],
      ['Finalités', 'Répondre à votre demande (devis, démonstration, maquette) et assurer le suivi commercial. Envoi de nouveautés et d’offres uniquement si vous avez coché la case prévue à cet effet.'],
      ['Base légale', 'Votre demande (mesures précontractuelles) ; votre consentement pour la prospection par e-mail (loi n° 2008-08, art. 16) et la protection des données personnelles (loi n° 2008-12).'],
      ['Durée de conservation', '[À COMPLÉTER : par exemple 3 ans après le dernier contact pour les prospects.]'],
      ['Vos droits', `Accès, rectification, opposition et suppression : écrivez à ${CONTACT.email}. Chaque e-mail contient un lien de désinscription.`],
      ['Destinataires et sous-traitants', '[À COMPLÉTER : hébergeur de la base de données, service d’envoi d’e-mails.]'],
      ['Déclaration', '[À COMPLÉTER : références de la déclaration auprès de la Commission de protection des données personnelles (CDP).]'],
    ],
  },
};

export default function LegalPage({ path }: { path: string }) {
  const p = T[path];
  return (
    <>
      <IconSprite /><Header current={path} />
      <main className="legal"><div className="wrap">
        <p className="label">Informations légales</p><h1>{p.title}</h1>
        <p className="todo">Gabarit à faire valider par un juriste : les passages entre crochets sont à compléter.</p>
        {p.blocks.map(([h, t]) => <div key={h}><h2>{h}</h2><p>{t}</p></div>)}
      </div></main>
      <Footer current={path} />
    </>
  );
}
export const LEGAL_PATHS = Object.keys(T);
