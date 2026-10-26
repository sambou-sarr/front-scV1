import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import MapSection from '../components/contact/MapSection';
import '../styles/cartes.css';
import '../styles/qr.css';
import '../styles/apropos.css';
import '../styles/contact.css';

// Page Contact — /contact (V6 : formulaire simple, sans la carte ; ?sujet=devis|demo|qr|… pré-sélectionne l'objet)
export default function ContactPage() {
  useReveal();
  return (
    <>
      <IconSprite />
      <Header current="/contact" />
      <main className="cartes-page qr-page contact-page">
        <ContactHero />
        <ContactForm id="formulaire" />
        <MapSection />
      </main>
      <Footer current="/contact" />
    </>
  );
}
