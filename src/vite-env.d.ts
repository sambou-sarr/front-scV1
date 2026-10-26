/// <reference types="vite/client" />
// Types Vite (import.meta.env, imports de .css et d'images) + variables d'environnement du site.
interface ImportMetaEnv {
  /** Base URL de l'API principale, suffixe /api inclus. */
  /** Base URL publique du frontend, sans chemin de fiche (ex. http://localhost:5173). */
  readonly VITE_PUBLIC_APP_URL?: string;
  /** Base URL de l’API principale, suffixe /api inclus. */
  readonly VITE_API_URL?: string;
  readonly VITE_LEAD_ENDPOINT?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** « true » : l'éditeur de fiche utilise des données fictives au lieu de l'API. */
}
