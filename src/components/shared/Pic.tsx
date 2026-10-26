import type { Img } from '../../types/v5';

/*
  Image responsive : deux fichiers WebP par visuel, générés une fois (public/images/…) :
    <src>-l.webp (largeur w, 1 600 px max)   <src>-s.webp (moitié)
  Images existantes du site en un seul fichier : img.single = true (src avec extension).
  width/height fixés pour éviter les sauts de mise en page ; chargement différé sauf `eager`.
*/
export default function Pic({ img, sizes = '(max-width: 900px) 100vw, 50vw', className, eager = false }: { img: Img; sizes?: string; className?: string; eager?: boolean }) {
  const common = { className, width: img.w, height: img.h, alt: img.alt, loading: eager ? 'eager' as const : 'lazy' as const, decoding: 'async' as const, draggable: false };
  if (img.single) return <img src={img.src} {...common} />;
  const half = Math.round(img.w / 2);
  return <img src={`${img.src}-l.webp`} srcSet={`${img.src}-s.webp ${half}w, ${img.src}-l.webp ${img.w}w`} sizes={sizes} {...common} />;
}
