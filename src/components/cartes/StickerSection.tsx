import { STICKER } from '../../data/cartes';
import { Icon } from '../Icons';

// Option sticker téléphone. Le téléphone pivote avec le scroll (animation-timeline: view()).
export default function StickerSection() {
  return (
    <section className="sticker">
      <div className="wrap st-grid">
        <div className="st-vis"><img src="/images/sticker-telephone.webp" alt="Sticker QR rond de 30 mm collé au dos d'un smartphone" loading="lazy" /></div>
        <div className="st-txt rv">
          <p className="label">{STICKER.label}</p>
          <h2 className="h2">{STICKER.title}</h2>
          <p>{STICKER.text}</p>
          <a className="btn btn-red" href="/contact?sujet=qr#formulaire">{STICKER.cta} <Icon id="arr" /></a>
        </div>
      </div>
    </section>
  );
}
