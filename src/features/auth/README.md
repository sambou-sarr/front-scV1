# Authentification

## Modèle actuel

- `POST /auth/login` renvoie `{ user, token }` (JWT). Le jeton est gardé dans `localStorage` (`client_token`, `client_user`).
- **Un seul module connaît ce stockage : `src/lib/session.ts`.** Le reste de l'application utilise
  `useSession()`, `getToken()`, `saveSession()`, `clearSession()`. Aucun `localStorage` d'authentification ailleurs.
- **Un seul client HTTP : `src/lib/api.ts` (axios).** Il ajoute `Authorization: Bearer …` (sauf sur `/auth/login`,
  `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`). Si le serveur répond **401**
  alors qu'un jeton était envoyé, la session locale est supprimée.
- **`<RequireAuth>`** (`features/auth/RequireAuth.tsx`) protège `/espace-client`. Il réagit en direct à la fin de session
  (déconnexion, 401, jeton expiré, déconnexion dans un autre onglet) et renvoie vers `/login` avec `state.from`.
- `main.tsx` vide le cache React Query quand la session disparaît : un autre compte ne voit pas les données du précédent.
- Le champ `exp` du JWT est lu (sans vérification de signature) : un jeton expiré est traité comme absent, et la
  déconnexion locale est programmée à l'échéance. Le serveur reste seul juge de la validité.
- Les erreurs : `lib/apiError.ts` (`ApiError`, `toApiError`, `isAuthFailure`). Les services d'authentification lèvent des
  `ApiError` ; le reste du code continue de recevoir l'`AxiosError` d'origine (utilisée par `toFicheError`…).

## Limite connue : un jeton dans localStorage est lisible par tout script de la page

Une faille XSS permettrait de le voler. La solution recommandée est un **cookie httpOnly**, mais elle demande de
modifier l'API ; le front seul ne peut pas la faire.

Côté API :

1. `POST /auth/login` : `Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Path=/` (et ne plus renvoyer le jeton).
2. CORS : `Access-Control-Allow-Credentials: true` et une origine précise (pas `*`).
3. Protection CSRF (jeton anti-CSRF ou en-tête personnalisé vérifié) pour les routes qui modifient des données.
4. `GET /auth/me` (renvoie l'utilisateur de la session) et `POST /auth/logout` (supprime le cookie).

Côté front, seuls `lib/session.ts` (la session devient « connue après `/auth/me` », sans jeton stocké) et `lib/api.ts`
(`withCredentials: true`, plus d'en-tête `Authorization`) changeraient.

## Tests

`pnpm test` couvre `lib/session.ts` (expiration, onglets multiples, anciennes clés), `lib/api.ts` (jeton, 401),
`auth.service.ts` (login, logout) et `RequireAuth`.
