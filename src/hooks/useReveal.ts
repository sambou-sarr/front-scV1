import { useEffect } from 'react';

// Apparition au scroll, une seule fois (cahier des charges, section 24) :
// opacity 0 → 1, translateY 15px → 0. Ajouter la classe "rv" à un élément suffit.
export default function useReveal(): void {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.rv').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
