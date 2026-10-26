import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import SecHero from '../components/secteurs/SecHero';
import SectorExplorer from '../components/secteurs/SectorExplorer';
import SectorMatrix from '../components/secteurs/SectorMatrix';
import ChainSection from '../components/secteurs/ChainSection';
import SimpleCTA from '../components/shared/SimpleCTA';
import UniversGallery from '../components/media/UniversGallery';
import { S_CTA } from '../data/secteurs';
import '../styles/cartes.css';
import '../styles/qr.css';
import '../styles/panneaux.css';
import '../styles/branding.css';
import '../styles/secteurs.css';

// Page 6 — /secteurs ; /secteurs/<secteur> sans page dédiée : même page, défilée jusqu'au secteur (focus, V5)
export default function SecteursPage({ focus }: { focus?: string }) {
  useReveal();
  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => document.getElementById('sec-' + focus)?.scrollIntoView({ block: 'start' }), 250);
    return () => clearTimeout(t);
  }, [focus]);
  return (
    <>
      <IconSprite />
      <Header current="/secteurs" />
      <main className="cartes-page qr-page sec-page">
        <SecHero />
        <SectorExplorer />
        <UniversGallery />
        <SectorMatrix />
        <ChainSection />
        <SimpleCTA {...S_CTA} />
      </main>
      <Footer current="/secteurs" />
    </>
  );
}
