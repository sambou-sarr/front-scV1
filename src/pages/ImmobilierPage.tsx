import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import usePageMeta from '../lib/meta';
import { useContent } from '../lib/content';
import ImHero from '../components/immobilier/ImHero';
import ImProfiles from '../components/immobilier/ImProfiles';
import ImJourney from '../components/immobilier/ImJourney';
import ImLots from '../components/immobilier/ImLots';
import ImFunnel from '../components/immobilier/ImFunnel';
import ImOffer from '../components/immobilier/ImOffer';
import ImPacks from '../components/immobilier/ImPacks';
import FiveSteps from '../components/shared/FiveSteps';
import FaqList from '../components/shared/FaqList';
import CtaBand from '../components/shared/CtaBand';
import QuoteBar from '../components/devis/QuoteBar';
import QuoteForm from '../components/devis/QuoteForm';
import { quote } from '../components/devis/quoteStore';
import { IM_AGENCES, IM_LOCATION, IM_STEPS, IM_FAQ, IM_CTA, IM_META } from '../data/immobilier';
import '../styles/cartes.css';
import '../styles/panneaux.css';
import '../styles/apropos.css';
import '../styles/devis.css';
import '../styles/contenu.css';
import '../styles/immobilier.css';

// Page « Promoteur et immobilier » — /promoteur-immobilier (V5, retouches V6) : promoteurs, agences, résidences
export default function ImmobilierPage() {
  useReveal();
  usePageMeta(IM_META.title, IM_META.description);
  const cta = useContent('immobilier.cta', IM_CTA) as typeof IM_CTA;
  return (
    <>
      <IconSprite />
      <Header current="/promoteur-immobilier" onQuote={() => quote.open({ pole: 'immobilier', from: 'entete' })} />
      <main className="cartes-page cc-page ix-page">
        <ImHero />
        <ImProfiles />
        <ImJourney />
        <ImLots />
        <ImFunnel />
        <ImPacks />
        <ImOffer data={IM_AGENCES} />
        <ImOffer data={IM_LOCATION} flip />
        <FiveSteps data={IM_STEPS} />
        <FaqList data={IM_FAQ} id="faq-immobilier" />
        <CtaBand {...cta} preset={{ pole: 'immobilier' }} wa="Bonjour Support Connecté, je souhaite parler d’un programme immobilier." />
      </main>
      <QuoteBar preset={{ pole: 'immobilier' }} />
      <QuoteForm />
      <Footer current="/promoteur-immobilier" />
    </>
  );
}
