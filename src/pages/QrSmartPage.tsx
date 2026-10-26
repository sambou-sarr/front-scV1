import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import QrHero from '../components/qr/QrHero';
import UseCasesSection from '../components/qr/UseCasesSection';
import GameSection from '../components/qr/GameSection';
import QrCTA from '../components/qr/QrCTA';
import PhotoBand from '../components/media/PhotoBand';
import '../styles/cartes.css';
import '../styles/qr.css';

export default function QrSmartPage() {
  useReveal();
  return (
    <>
      <IconSprite />
      <Header current="/qr-smart" />
      <main className="cartes-page qr-page">
        <QrHero />
        <UseCasesSection />
        <GameSection />
        <PhotoBand src="/images/univers-chez-homard.webp" ratio={1600 / 589} layout="stack" alt="Supports QR et NFC d’un restaurant : chevalet, sous-verres, carte et page menu"
          label="En situation" title="Un QR sur chaque table," red="le menu dans chaque main." note="Univers de démonstration conçu par Support Connecté."
          hotspots={[{ x: 12.5, y: 46, label: 'Chevalet' }, { x: 30, y: 52, label: 'Sticker rond' }, { x: 43.5, y: 45, label: 'Page menu' }, { x: 58.5, y: 72, label: 'Carte NFC', far: true }]} />
        <QrCTA />
      </main>
      <Footer current="/qr-smart" />
    </>
  );
}
