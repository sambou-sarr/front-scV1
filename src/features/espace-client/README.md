# Espace client : éditeur et fiche

Ce dossier contient le back-office des membres et la fiche publique ouverte par la carte NFC / le QR.

La page `/espace-client/paiements` affiche l’historique paginé du client connecté. Les paiements confirmés proposent un reçu imprimable (ou enregistrable en PDF) ; les factures officielles restent désactivées tant que les informations légales de l’émetteur et les coordonnées de facturation du client ne sont pas définies.

## Organisation

```
components/
├── Editor.tsx            Assemble les sections du panneau d'édition (≈ 60 lignes)
├── editor/
│   ├── sections/         Un bloc du panneau : PlanBanner, QrBox, TemplateBox, BlocksBox, IdentityBox, AppearanceBox
│   ├── tabs/             UN ÉDITEUR PAR TYPE D'ONGLET (MenuEditor, GalerieEditor, …)
│   ├── ContentEditor.tsx Registre type d'onglet → éditeur (Record<TabType, …>, exhaustif)
│   ├── shared.tsx        Lock (verrou d'offre), envoi de média, imageInput
│   ├── useDnD.ts         Glisser-déposer au pointeur
│   ├── tabsOf.ts         Onglets effectivement affichés (fiche + droits de la formule)
│   └── types.ts          TabEditorProps
├── Fiche.tsx             Page publique : entête, onglets, actions (≈ 250 lignes)
└── fiche/
    ├── views/            UNE VUE PAR TYPE D'ONGLET (MenuView, GalerieView, …)
    ├── SectionBody.tsx   Registre type d'onglet → vue (Record<TabType, …>, exhaustif)
    ├── Section.tsx, Carousel.tsx, Sheet.tsx, Photos.tsx, video.tsx, QR.tsx, Icon.tsx, usePullQR.ts, format.ts, types.ts
hooks/useFicheEditor.ts   Brouillon local, état « non enregistré », sauvegarde
lib/fichePayload.ts       Brouillon → corps du PATCH (n'envoie que les différences)
lib/ficheSource.ts        Source de données de l'éditeur (API : GET / PATCH fiches/:id)
```

## Renouvellement d'abonnement (fiche arrivée à terme)

Quand l'abonnement d'une fiche est échu, le serveur la traite comme **Essentielle** (affichage réduit, modification
bloquée : `expiree: true`, `ABONNEMENT_EXPIRE`). Le renouvellement redonne une formule payante.

- **Côté serveur, il n'existe pas de route « renouveler »** : on utilise `POST /subscription/upgrade` (puis la
  confirmation du paiement). Une fiche sans abonnement valide étant vue comme Essentielle, toute formule payante est
  acceptée, **y compris la même que celle qui vient de se terminer**. Tant que l'abonnement est valide, seule une
  formule supérieure est acceptée (pas de renouvellement anticipé).
- `lib/renewal.ts` (logique pure) : `renewalInfo(fiche)` → `{ expired, previousPlan, endedAt }`, `renewPath(id)`.
  La formule précédente vient de `latestSubscription.plan.type` (renvoyée par `GET client/dashboard/fiches`).
- `PaymentModal` passe en mode renouvellement pour une fiche échue : titre, formule précédente présélectionnée, toutes
  les formules payantes proposées, bouton « Renouveler », puis rafraîchissement du tableau de bord, de l'éditeur
  (`fiche-preview`) et de la page publique.
- Points d'entrée : tableau de bord (alerte et ligne de fiche), page des abonnements (bouton « Renouveler »), message
  de blocage de l'éditeur. Tous ouvrent `/espace-client/abonnements?renew=<id>` ; la fenêtre s'ouvre toute seule et le
  paramètre est retiré à la fermeture.
- **Production** : le paiement réel (Wave / Orange Money) n'est pas branché côté serveur ; seul l'adaptateur de
  simulation existe (désactivé en production). Le renouvellement ne sera utilisable en production qu'avec un
  fournisseur de paiement.

## Demande de carte : modèle défini par l'administration

`CardRequestPanel` affiche le modèle actif avant commande, puis le recto/verso conservé dans la commande pendant sa production.

- Source : `getCardRequest(ficheId)` → `{ carte, modele }`. `modele` vient de `GET /fiches/:id/card-request` : c'est le
  modèle **actif** de la formule que le **serveur** facturera (abonnement valide, sinon Essentielle). Le libellé et le prix
  affichés suivent donc `modele.tier` avant commande, puis `carte.tier` pendant la production. La demande conserve les images
  du modèle choisi ; les modifications ultérieures du modèle actif ne changent pas les commandes passées.
- `modele: null` (aucun modèle défini, ou ancien serveur sans ce champ) : l'aperçu par défaut est conservé.
- Une adresse d'image cassée affiche « Image indisponible » pour cette face, l'autre reste consultable.
- Tant qu'une demande est en production, son statut est rechargé automatiquement toutes les 30 secondes.
- Gestion des modèles : `/admin/cartes` (voir `admin/README.md`).
- Dans « Tableau de bord de la fiche » › « Carte », le recto et le verso du modèle actif sont affichés si l'abonnement de la
  fiche est valide. Sans abonnement valide, l'aperçu n'est pas affiché.

## Outils du propriétaire (QR et « NFC · QR »)

Le QR code, le bouton « NFC · QR » et le geste « tirer pour le QR » servent au **propriétaire** pour qu'une personne
scanne sa fiche. Une personne qui ouvre la fiche en la scannant ne les voit pas.

- `Fiche` reçoit `ownerTools` (**faux par défaut** : un oubli ne montre jamais l'outil à un visiteur). Le geste est
  désactivé aussi (`usePullQR(…, enabled)` n'installe alors aucun écouteur).
- Activé pour : l'aperçu téléphone de l'éditeur, la page propriétaire (`FichePage`) et la page publique **si**
  `useIsFicheOwner(slug)` est vrai : session ouverte ET fiche présente dans `client/dashboard/fiches`.
- Jamais activé : page sticker (`/s/…`), y compris son repli sur la fiche complète.
- Un visiteur anonyme ne déclenche aucune requête vers l'espace client.
- Limite : un propriétaire **non connecté** sur son téléphone voit la vue visiteur. Si l'API indiquait la propriété
  dans la réponse publique (`isOwner`), seul `hooks/useIsFicheOwner.ts` changerait.

## Stickers par section

Un sticker (QR) ouvre **une seule section** de la fiche : `/s/:slug/:section` (`section` = type de l'onglet, ex. `menu`, ou
l'identifiant d'un onglet personnalisé). Le parcours passe par l'administration :

1. **Le client demande un devis** (bloc « Stickers par section » de l'éditeur) : il indique le **nombre de stickers** pour
   la section voulue. Pro et Signature seulement, fiche publiée, abonnement valide.
2. **L'administration** voit la demande (Production › « Stickers par section », ou fiche détail), regarde l'aperçu et
   **active la section**. Elle peut aussi la refuser ou la désactiver plus tard.
3. **Une fois la section activée**, le client voit dans l'éditeur le lien à copier, le QR (SVG), l'aperçu et « Ouvrir ».

- **Seule une section activée est servie au public** : la fiche publique expose `stickerSections` (clés activées) et
  `resolveStickerSection` retombe sur la fiche complète sinon (`fallback: "inactive"`). Abonnement échu : plus aucune
  section servie. `preview` (`StickerSectionView`) lève l'exigence d'activation : aperçu de l'administration et de l'éditeur.
- Une seule demande « ouverte » (à traiter ou activée) par fiche et par section ; refusée ou désactivée, elle peut être refaite.

```
lib/stickerSections.ts                    logique PURE : droits, clé d'URL, résolution + activation, quantité, dernière demande
pages/StickerSectionPage.tsx              /s/:slug/:section : charge la fiche, compte un passage « qr », noindex
components/sticker/StickerSectionView.tsx choisit : la section, ou la fiche complète en repli
components/sticker/StickerSection.tsx     logo + nom + UNE section + bouton « Voir la fiche complète »
components/editor/sections/StickerBox.tsx devis, état de la demande, puis lien / QR / aperçu quand la section est activée
components/PhonePreview.tsx               mini téléphone partagé (aperçu de fiche, éditeur, administration)
```

- **La fiche principale (`Fiche.tsx`, `fiche/`) n'est pas modifiée** : la page réutilise `fiche/SectionBody`.
- `vercel.json` : `/s/...` est servi par l'application (règle `/(.*)` → `index.html`).
- Non couvert : une section **propre au sticker** (Wi-Fi, jeu…) : son contenu n'existe dans aucune donnée de la fiche.
- Le détail du suivi et des statuts est dans `admin/README.md` (côté administration) et dans le README de l'API.

## Modèles : où est la référence ?

```
src/types/
├── fiche.ts   FicheRecord = LA RÉFÉRENCE côté front (éditeur, fiche publique, tests), FicheData, Onglet, FICHE_DATA_KEYS
├── plan.ts    Plan (droits d'une formule), FORMULES, PlanType
├── api.ts     Formes BRUTES du serveur : ApiFicheDetail (GET/PATCH fiches/:id), ApiFicheSummary (dashboard)
├── auth.ts    IRegister, Login
└── index.ts   barrel : `import type { FicheRecord } from "../../types"` fonctionne toujours
```

- Les composants ne manipulent **jamais** un DTO : `lib/ficheApi.ts` (`fetchFiche`, `patchFiche`, `toFicheRecord`) est la
  seule frontière serveur → front.
- Les enums « serveur » en MAJUSCULES sont **dérivés** du domaine (`Uppercase<Secteur>`, `Lowercase<PlanType>` pour
  `Formule`) : ils ne peuvent plus diverger.
- `FICHE_DATA_KEYS` (types/fiche.ts) liste les clés de `FicheData` **une seule fois** ; elle sert à la lecture
  (`ficheApi.ts`) et au PATCH (`fichePayload.ts`). Oublier une clé après en avoir ajouté une à `FicheData` fait échouer
  `pnpm typecheck`. Seule la synchronisation avec le schéma Zod du serveur reste manuelle
  (`api-sc/src/modules/fiches/fiches.schemas.ts`).

## Ajouter un type d'onglet

1. Ajouter la valeur à `TabType` (`src/types/index.ts`) et la déclarer dans `TAB_TYPES` / les plans (`src/lib/plans.ts`).
2. Créer `components/editor/tabs/XxxEditor.tsx` (props : `TabEditorProps`) et l'inscrire dans `editor/ContentEditor.tsx`.
3. Créer `components/fiche/views/XxxView.tsx` (props : `ViewProps`) et l'inscrire dans `fiche/SectionBody.tsx`.
4. Si l'onglet stocke une nouvelle clé dans `fiche.data` : l'ajouter à `FicheData` et à `FICHE_DATA_KEYS`
   (`types/fiche.ts`), prévoir son nettoyage dans `lib/fichePayload.ts`, et l'ajouter au schéma serveur (`updateFicheSchema`).

Les deux registres sont typés `Record<TabType, …>` : **oublier l'étape 2 ou 3 fait échouer `pnpm typecheck`**.

## Tests

```bash
pnpm test          # Vitest : fichePayload + rendu de chaque onglet (éditeur et fiche) sur les fiches de test (src/test/fixtures)
pnpm typecheck
```

`components/tabs.test.tsx` rend chaque type d'onglet pour chaque fiche de test : il protège ce découpage.

## Données de démonstration

Il n'y a plus de mode démo dans l'application. Les fiches fictives vivent dans `src/test/fixtures/fiches.ts`, réservées aux
tests ; `src/test/noMocksInApp.test.ts` échoue si du code applicatif les importe (elles repartiraient dans le bundle).
Pour travailler sans serveur, lancez l'API en local (`VITE_API_URL`).
