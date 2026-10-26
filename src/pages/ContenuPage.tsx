import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { IconSprite } from '../components/Icons';
import useReveal from '../hooks/useReveal';
import usePageMeta from '../lib/meta';
import { useContent } from '../lib/content';
import CcHero from '../components/contenu/CcHero';
import CcIndex from '../components/contenu/CcIndex';
import ModeSwitch from '../components/contenu/ModeSwitch';
import PoleSection from '../components/contenu/PoleSection';
import PrintSection from '../components/contenu/PrintSection';
import IaSection from '../components/contenu/IaSection';
import Showcase from '../components/contenu/Showcase';
import TeamCards from '../components/contenu/TeamCards';
import FiveSteps from '../components/shared/FiveSteps';
import FaqList from '../components/shared/FaqList';
import CtaBand from '../components/shared/CtaBand';
import QuoteBar from '../components/devis/QuoteBar';
import QuoteForm from '../components/devis/QuoteForm';
import { quote } from '../components/devis/quoteStore';
import { CC_POLES, CC_STEPS, CC_FAQ, CC_CTA, CC_META } from '../data/contenu';
import type { Mode } from '../types/v5';
import '../styles/cartes.css';
import '../styles/panneaux.css';
import '../styles/apropos.css';
import '../styles/devis.css';
import '../styles/contenu.css';

// Page V5 — /creation-contenu (création de contenu & communication intégrée)
export default function ContenuPage() {
  useReveal();
  usePageMeta(CC_META.title, CC_META.description);
  const [mode, setMode] = useState<Mode>('reel');
  const [picked, setPicked] = useState(false); // le visiteur a-t-il choisi ? sinon « À conseiller » dans le devis
  const cta = useContent('contenu.cta', CC_CTA) as typeof CC_CTA;
  const production = picked ? mode : undefined;
  return (
    <>
      <IconSprite />
      <Header current="/creation-contenu" onQuote={() => quote.open({ pole: 'contenu', production, from: 'entete' })} />
      <main className="cartes-page cc-page">
        <CcHero />
        <CcIndex />
        <ModeSwitch mode={mode} onChange={(m) => { setMode(m); setPicked(true); }} />
        {CC_POLES.map((p, i) => <PoleSection key={p.id} data={p} mode={mode} production={production} flip={i % 2 === 1} />)}
        <PrintSection />
        <IaSection />
        <Showcase />
        <TeamCards />
        <FiveSteps data={CC_STEPS} />
        <FaqList data={CC_FAQ} id="faq-contenu" />
        <CtaBand {...cta} preset={{ pole: 'contenu', production }} wa="Bonjour Support Connecté, je souhaite parler d’un projet de contenu." />
      </main>
      <QuoteBar preset={{ pole: 'contenu', production }} />
      <QuoteForm />
      <Footer current="/creation-contenu" />
    </>
  );
}
