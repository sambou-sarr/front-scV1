import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import AboutHero from '../components/apropos/AboutHero';
import Manifesto from '../components/apropos/Manifesto';
import VerbsBand from '../components/apropos/VerbsBand';
import Promises from '../components/apropos/Promises';
import Diagnostic from '../components/apropos/Diagnostic';
import Faq from '../components/apropos/Faq';
import AboutEnd from '../components/apropos/AboutEnd';
import StickyCTA from '../components/apropos/StickyCTA';
import PhotoBand from '../components/media/PhotoBand';
import '../styles/cartes.css';
import '../styles/qr.css';
import '../styles/panneaux.css';
import '../styles/branding.css';
import '../styles/secteurs.css';
import '../styles/apropos.css';

// Page À propos — /a-propos
export default function AProposPage() {
  useReveal();
  return (
    <>
      <IconSprite />
      <Header current="/a-propos" />
      <main className="cartes-page qr-page about-page">
        <AboutHero />
        <Manifesto />
        <VerbsBand />
        <PhotoBand src="/images/moodboard-2.webp" alt="Univers de marque Support Connecté : carte, page connectée, casquette, chevalet, présentoirs"
          label="Notre univers" title="Scannez." red="Vous verrez." />
        <Promises />
        <Diagnostic />
        <Faq />
        <AboutEnd />
      </main>
      <StickyCTA />
      <Footer current="/a-propos" />
    </>
  );
}
