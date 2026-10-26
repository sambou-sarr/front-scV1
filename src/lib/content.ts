import { useEffect, useState } from "react";

/*
  Textes modifiables depuis le back-office (onglet « Contenu du site », table site_content).
  Le site s'affiche d'abord avec ses textes par défaut (fichiers data/*.js, bons pour le référencement),
  puis applique la version publiée dans le back-office dès qu'elle est chargée.
  Sans VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY : textes par défaut uniquement.
*/
type Published = Record<string, Record<string, unknown>>;
const ENV: Partial<ImportMetaEnv> =
  (typeof import.meta !== "undefined" && import.meta.env) || {};
const BASE = ENV.VITE_SUPABASE_URL,
  KEY = ENV.VITE_SUPABASE_ANON_KEY;
let cache: Promise<Published> | null = null;
const loadAll = (): Promise<Published> => {
  if (!BASE || !KEY) return Promise.resolve({});
  cache ??= fetch(`${BASE}/rest/v1/site_content?select=key,value`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })
    .then(r => (r.ok ? r.json() : []))
    .then((rows: { key: string; value: Record<string, unknown> }[]) =>
      Object.fromEntries(rows.map(r => [r.key, r.value]))
    )
    .catch(() => ({}));
  return cache;
};

/** Bloc de textes : valeurs par défaut du code, remplacées champ par champ par la version publiée. */
export function useContent<T extends object>(key: string, fallback: T): T {
  const [v, setV] = useState<T>(fallback);
  useEffect(() => {
    let on = true;
    loadAll().then(all => {
      if (on && all[key]) setV({ ...fallback, ...all[key] });
    });
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return v;
}
