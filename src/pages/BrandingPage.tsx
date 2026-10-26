import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import BrandHero from '../components/branding/BrandHero';
import WearStory from '../components/branding/WearStory';
import WearProducts from '../components/branding/WearProducts';
import ObjectsBand from '../components/branding/ObjectsBand';
import QrCTA from '../components/qr/QrCTA';
import PhotoBand from '../components/media/PhotoBand';
import '../styles/cartes.css';
import '../styles/qr.css';
import '../styles/panneaux.css';
import '../styles/branding.css';

// Page 5 — /branding-intelligent
export default function BrandingPage() {
  useReveal();
  return (
    <>
      <IconSprite />
      <Header current="/branding-intelligent" />
      <main className="cartes-page qr-page brand-page">
        <BrandHero />
        <WearStory />
        <WearProducts />
        <ObjectsBand />
        <PhotoBand src="/images/moodboard-branding.webp" ratio={1600 / 640} layout="stack" alt="Univers Support Connecté : carte, polo, sticker de table, enseigne, présentoirs QR et plaque Wi-Fi"
          label="Partout où l’on vous voit" title="Polo, carte, présentoir :" red="chaque surface devient un point de contact." />
        <QrCTA delivery="Délais respectés après validation." />
      </main>
      <Footer current="/branding-intelligent" />
    </>
  );
}
