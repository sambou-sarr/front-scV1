import { useEffect } from 'react';

// Titre de l'onglet et description (référencement) d'une page.
// Le site se charge page par page (liens classiques) : pas besoin de restaurer l'ancien titre.
export default function usePageMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = description;
  }, [title, description]);
}
