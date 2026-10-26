# Back-office (administrateurs)

Interface d'administration, accessible sous `/admin`. Elle réutilise le socle du site : `lib/api.ts` (axios, jeton Bearer, session supprimée sur 401), `lib/session.ts` (rôle `ADMIN`), `lib/apiError.ts`, `lib/qr.tsx`, React Router et React Query.

## Organisation
- `admin.service.ts` : tous les appels `/admin/*` et `/client/qrcodes/*` (`adminApi`), erreurs en `ApiError` lisible.
- `layout/AdminLayout.tsx` : menu, tiroir mobile, `<Outlet />`. Protégé par `features/auth/RequireAdmin.tsx`.
- `pages/` : AdminLoginPage, Dashboard, Fiches, FicheDetail, Clients, Relances, Production, QrCodes, Formules, AdminNotFound.
- `components/` : `ui.tsx` (Btn, Modal, Toast, Icon…), FichePicker, UserPicker, ProductionModals.
- `hooks/useData.ts` : chargement de données (`useData`, `useDebounced`).
- `lib/` : format, print (planches/cartes), production, whatsapp.
- Types : `src/types/admin.ts` (volontairement hors de `types/index.ts`, des noms comme `Formule` y existent déjà).

## Routes
`/admin/login`, `/admin`, `/admin/fiches`, `/admin/fiches/:id`, `/admin/clients`, `/admin/relances`, `/admin/production`, `/admin/qrcodes`, `/admin/formules`.
Les filtres de la liste de fiches se lisent dans l'URL : `?statut=…`, `?userId=…`.
Le slug se modifie uniquement avant la création du compte client associé. L'ancien bloc « Propriétaire & carte » et les actions d'attribution/transfert/retrait n'existent plus. Les codes de rattachement carte ont été supprimés faute de parcours client correspondant.

## Session
Connexion : `adminLogin` (`features/auth/auth.service.ts`) → `POST /auth/admin/login`, puis `GET /auth/me` pour confirmer le rôle. Une seule session à la fois (clés `client_token` / `client_user`).

## Styles
`src/styles/admin.css` : tout est sous `.adm` ; les classes qui existaient déjà côté site sont préfixées `adm-`. Ne pas y ajouter de règle hors `.adm`.
