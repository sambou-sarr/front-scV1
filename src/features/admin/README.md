# Back-office (administrateurs)

Interface d'administration, accessible sous `/admin`. Elle réutilise le socle du site : `lib/api.ts` (axios, jeton Bearer, session supprimée sur 401), `lib/session.ts` (rôle `ADMIN`), `lib/apiError.ts`, `lib/qr.tsx`, React Router et React Query.

## Organisation
- `admin.service.ts` : tous les appels `/admin/*` et `/client/qrcodes/*` (`adminApi`), erreurs en `ApiError` lisible.
- `layout/AdminLayout.tsx` : menu, tiroir mobile, `<Outlet />`. Protégé par `features/auth/RequireAdmin.tsx`.
- `pages/` : AdminLoginPage, Dashboard, Fiches, FicheDetail, Billing, Clients, Relances, Production, ModelesCartes, QrCodes, Formules, AdminNotFound.
- `components/` : `ui.tsx` (Btn, Modal, Toast, Icon…), FichePicker, UserPicker, ProductionModals.
- `hooks/useData.ts` : chargement de données (`useData`, `useDebounced`).
- `lib/` : format, print (planches/cartes), production, whatsapp.
- Types : `src/types/admin.ts` (volontairement hors de `types/index.ts`, des noms comme `Formule` y existent déjà).

## Routes
`/admin/login`, `/admin`, `/admin/fiches`, `/admin/fiches/:id`, `/admin/abonnements`, `/admin/clients`, `/admin/relances`, `/admin/production`, `/admin/cartes`, `/admin/qrcodes`, `/admin/formules`, `/admin/historique`, `/admin/parametres`.
Le tableau de bord filtre ses graphiques par période rapide ou plage de dates personnalisée, avec affichage en barres ou en courbe. Il présente aussi les dix derniers clients inscrits et les dix derniers abonnements (tous statuts).
Les filtres de la liste de fiches se lisent dans l'URL : `?statut=…`, `?userId=…`.
La page Abonnements & paiements regroupe les deux historiques avec filtres de recherche, formule, statut, période et état de la fiche (existante ou supprimée) ; elle relie chaque abonnement au paiement correspondant et inversement lorsque ces enregistrements sont associés. Les suppressions conservent le nom et le slug de la fiche dans les snapshots financiers pour identifier l’historique.
La page `/admin/parametres` regroupe le profil et la sécurité de l’administrateur, la gestion de l’équipe (invitations, renvoi, désactivation/réactivation et suppression), les coordonnées publiques et le mode maintenance. Le profil utilise `/auth/me`; les réglages partagés sont enregistrés via `/admin/settings`. La facturation reste dans Formules et Abonnements & paiements. Le dernier administrateur actif et le compte connecté ne peuvent pas être supprimés/désactivés.
La page `/admin/historique` présente les actions de modification réussies, avec l’administrateur, la date et la route touchée. Les corps de requête, mots de passe et autres données de formulaires ne sont pas conservés.
Le slug se modifie uniquement avant la création du compte client associé. L'ancien bloc « Propriétaire & carte » et les actions d'attribution/transfert/retrait n'existent plus. Les codes de rattachement carte ont été supprimés faute de parcours client correspondant.

## Session
Connexion : `adminLogin` (`features/auth/auth.service.ts`) → `POST /auth/admin/login`, puis `GET /auth/me` pour confirmer le rôle. Une seule session à la fois (clés `client_token` / `client_user`).

## Styles
`src/styles/admin.css` : tout est sous `.adm` ; les classes qui existaient déjà côté site sont préfixées `adm-`. Ne pas y ajouter de règle hors `.adm`.

## Modèles de cartes (`/admin/cartes`)

Le recto et le verso de la carte que le client voit dans sa **demande de carte**, par formule (Essentielle, Pro,
Signature). Un seul modèle est **actif** par formule ; activer un modèle remplace l'ancien. Sans modèle actif, le client
garde l'aperçu par défaut. Les images se **téléversent** depuis la fenêtre d'ajout (JPEG, PNG ou WebP, 12 Mo max) : le serveur
les optimise (WebP) et les héberge ; rien à coller. Les envois ont lieu à la validation, avant la création : si l'un échoue,
rien n'est créé. En modification, on peut ne changer que le nom ou qu'une seule face. Les anciens modèles créés avec un
lien https restent affichés et peuvent être remplacés par un fichier.

- API : `adminApi.listModelesCartes / createModeleCarte / updateModeleCarte / deleteModeleCarte`
  (`/admin/production/modeles-cartes`) ; `uploadCardImage(file)` envoie le fichier en binaire (`/images`) et renvoie son adresse.
- Côté client, `CardRequestPanel` lit `modele` dans `GET /fiches/:id/card-request` (voir `espace-client/README.md`).
- Lors d'une demande client, les images du modèle actif sont copiées sur la commande : changer ou
  supprimer un modèle ne modifie pas les commandes déjà créées. Dans **Production › Cartes**, l'atelier voit l'adresse,
  le téléphone, les précisions et le montant à encaisser à la livraison. La colonne **Modèle actif** affiche le nom du
  modèle actif de la formule et ouvre son aperçu recto-verso ; aucun fichier n'est téléversé ou modifié depuis Production.
  Les cartes sont filtrables par statut. Les stickers à fonction et 30 mm le sont également.

## Stickers par section (demandes de devis)

Le client demande un devis pour un nombre de stickers ouvrant une section de sa fiche ; l'administration **active la
section** (c'est seulement alors qu'elle est servie au public et que le client reçoit lien et QR).

- **Production › « Stickers par section »** : toutes les demandes (filtre « À traiter » par défaut, avec un filtre par
  statut couvrant demande, activée, désactivée et refusée) : fiche, section, nombre,
  client, date, état. Actions : Aperçu, Activer la section, Refuser, Désactiver, Réactiver (mêmes transitions que le serveur :
  `demande → active | refusée`, `active → désactivée`, `désactivée → active`). L'onglet gère lui-même son chargement :
  une API pas à jour ne bloque pas le reste de la page.
- **`/admin/fiches/:id`** : panneau « Aperçu et stickers par section » : mini téléphone (le même composant `PhonePreview` que
  `/fiche/preview/:id`) montrant la fiche, ou une section demandée (aperçu : elle n'a pas besoin d'être activée), et les
  demandes de cette fiche avec leurs décisions.
- API : `adminApi.listSectionStickers({ statut?, ficheId? })`, `adminApi.setSectionStickerStatus(id, statut)`
  (`/admin/production/section-stickers`). La fiche de l'aperçu est lue par `fiches/:id` avec la session administrateur.
- À vérifier à l'œil : la feuille `admin.css` contient quelques règles génériques (`.adm a`, champs de formulaire) qui
  s'appliquent aussi à la fiche affichée dans le téléphone ; elles ne devraient pas la déformer mais n'ont pas été contrôlées visuellement.
