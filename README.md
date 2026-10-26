# Support Connecté — Site (React) : Accueil, Cartes, QR Smart, Panneaux & bâches, Branding intelligent, Secteurs, À propos, Contact

Base de travail issue du prototype validé. Conforme au cahier des charges « Landing Page — Septembre 2026 ».

## Démarrer

```bash
npm install
npm run dev      # /  ·  /cartes-connectees  ·  /qr-smart  ·  /panneaux-baches  ·  /branding-intelligent  ·  /secteurs  ·  /a-propos  ·  /contact
npm run build    # production (dossier dist/)
```

Le routage est minimal (`src/App.tsx`). À remplacer par React Router quand les autres pages arrivent.

Stack : React 18 + Vite + TypeScript strict (tout le code), aucune autre dépendance, pas de librairie d'animation. Vérifier les types : `npm run typecheck` (0 erreur).

## Structure

```
src/
├── App.tsx                     Routage des pages
├── pages/                      Une page par route (HomePage, CartesPage, QrSmartPage, PanneauxPage,
│                               BrandingPage, SecteursPage, AProposPage, ContactPage)
├── data/                       TOUS les textes (content.ts = textes validés du cahier des charges)
├── styles/                     global.css + une feuille par page
├── hooks/                      useReveal, useStickyProgress, useViewProgress
├── utils/                      lead.ts (envoi des demandes), track.ts (mesure)
└── components/
    ├── Header.tsx, Footer.tsx, Icons.tsx, PhoneMockup.tsx
    ├── home/                   Accueil V2
    ├── cartes/ qr/ panneaux/ branding/ secteurs/ apropos/ contact/ studio/ shared/
public/images/                  Visuels WebP issus du catalogue + logos
```

## Règles

1. **Textes** : ne jamais les modifier dans les composants. Ils sont tous dans `src/data/content.ts` (cahier, section 29). « vôtre » avec accent est volontaire.
2. **Logo** : utiliser `logo-blanc` / `logo-noir` tels quels (PNG et WebP fournis). Ne pas redessiner.
3. **Liens** : en `<a href>` vers l'arborescence de la section 28. Avec React Router, remplacer par `<Link to>`.

## À remplacer avant la mise en ligne

| Élément | Fichier | Remplacer par |
|---|---|---|
| Interface du téléphone (page « Le Sunset ») | `PhoneMockup.tsx`, `DEMO_PAGE` dans `content.ts` | Interface officielle Support Connecté |
| Photo hero (1024 px, recadrée du catalogue) | `public/images/hero*.webp` | Photo originale HD, versions 1600 / 1024 / 720 |
| Liens réseaux sociaux (`#`) | `content.ts` → `FOOTER.socials` | Vraies URL |
| Bouton « Voir la vidéo » (`#video`) | `components/home/HomeHero.tsx` | Lien ou modale vidéo |
| QR codes visibles dans les photos | — | Décoratifs. Tout QR qui doit fonctionner est généré en code (SVG + PNG), jamais par IA (section 21). |

## Animation « Comment ça marche » (ProcessSection)

- La section fait 520vh. La scène reste épinglée (`position: sticky`) et avance avec le scroll. Le défilement n'est jamais bloqué ni détourné.
- Les positions sont écrites directement sur le DOM via refs et `requestAnimationFrame`, sans re-render React à chaque frame. Seul l'index d'étape (0 à 3) passe par le state.
- Réglages en haut du fichier : images-clés `CARD_*`, `PHONE_*`, positions `FAN_*`, `CHIP_*`. Suffixe `_D` pour desktop, `_M` pour mobile (≤ 900 px).
- `prefers-reduced-motion` est respecté : les transitions sont coupées, mais la scène reste lisible étape par étape.

⚠️ Cette séquence remplace la timeline statique de la section 13. Le point 24 du cahier (« animations très sobres ») doit être mis à jour en conséquence.

## Performance (cahier, section 25)

- Images en WebP, `loading="lazy"` sous la ligne de flottaison, hero préchargé dans `index.html`.
- Polices Google Fonts : Cormorant Garamond 500, Inter 400/500/600, Caveat pour la note manuscrite. À auto-héberger si besoin.


---

# Page Cartes connectées (`/cartes-connectees`)

Fichiers : `src/pages/CartesPage.tsx`, `src/components/cartes/*`, `src/styles/cartes.css`, textes dans `src/data/cartes.ts`.

## Sections

| Composant | Contenu | Technique |
|---|---|---|
| `CardsHero` | Hero + carte 3D | Carte en vraie 3D CSS, suit le pointeur (inclinaison + reflet), se retourne au tap. Sortie du hero pilotée par `animation-timeline: view()` |
| `JourneySection` | Du geste au contact (4 étapes) | Scène sticky pilotée par le scroll : tour complet recto/verso, bascule vers le téléphone, NFC, ouverture de la page, tuiles d'action + démo de taps |
| `PageAnatomy` | Une page à votre nom | Traits de liaison qui se dessinent au scroll (scroll-driven animations) |
| `UsesSection` | 5 usages | Micro-animations CSS propres à chaque usage, déclenchées à l'apparition |
| `TiersSection` | Essentielle / Pro / Signature + tableau | **View Transitions API** pour le changement de niveau, colonne sélectionnée surlignée, sur mobile une seule colonne |
| `StickerSection` | Option sticker téléphone | Rotation du visuel liée au scroll |
| `LiveUpdate` | Votre contenu évolue | Démo interactive : un clic modifie la page, les cartes distribuées reçoivent la mise à jour |
| `ResultsSection` | Scan → Action → Contact → Fidélisation | Ligne qui se remplit au scroll |
| `CardsCTA` | CTA final | Léger parallaxe CSS |
| `Card3D` | Composant carte recto/verso | Réutilisable (`variant="pro"` ou `"signature"`), tailles en `cqw` (container queries) |

## Compatibilité

- **Scroll-driven animations** (`animation-timeline`) : Chrome, Edge, Android, Safari récent. Ailleurs, repli automatique via `@supports` sur l'apparition classique (IntersectionObserver). Rien ne casse.
- **View Transitions** : même principe, repli sur un changement instantané.
- **prefers-reduced-motion** respecté partout.
- Zéro dépendance ajoutée : pas de GSAP ni Framer Motion.

## À remplacer

| Élément | Où |
|---|---|
| QR code de la carte 3D (décoratif) | `Card3D.tsx` → `<FakeQR />` : brancher un QR réel généré en code (section 21 du cahier) |
| Interface du téléphone (Le Sunset) | `PhoneMockup.tsx` et `DEMO_PAGE` : interface officielle |
| Données de la démo « contenu évolue » | `LIVE.changes` dans `data/cartes.ts` |
| Liens « Choisir / Découvrir » | Pointent vers `/contact` ou `#niveaux` : à relier au tunnel de commande |

## Visuels (`public/images/`)

`carte-pro.webp`, `carte-signature.webp` (photos produits fournies), `carte-essentielle.webp`, `sticker-telephone.webp` (fond détouré), `symbole-s.webp`, `logo-vertical-blanc.webp`, `ambiance-saly.webp`.
Le logo horizontal du header (`logo-blanc` / `logo-noir`) est recomposé à partir du logo officiel (symbole + texte, sans retouche des formes). Faire valider, ou le remplacer par le fichier source vectoriel dès qu'il est disponible.


---

# Page QR Smart (`/qr-smart`)

Fichiers : `src/pages/QrSmartPage.tsx`, `src/components/qr/*`, `src/styles/qr.css` (s'ajoute à `cartes.css`), textes dans `src/data/qr.ts`.
Les textes repris du catalogue sont mot pour mot. Les lignes marquées `À VALIDER` dans `data/qr.ts` sont des propositions à faire valider.

| Composant | Contenu | Technique |
|---|---|---|
| `QrHero` | « Un petit support. Un grand résultat. » | Carrousel 3D CSS des 6 stickers, rotation automatique, glisser au doigt avec inertie, sticker de face mis en avant |
| `UseCasesSection` | 6 stickers → ce que voit le client | Scène sticky au scroll : bascule 3D du sticker, faisceau de scan, écran du téléphone animé (étoiles, frappe du texte, Wi-Fi, créneaux…). Liste cliquable qui fait défiler au bon palier |
| `PhoneScreens` | Les 6 écrans de démonstration | Container queries (`cqw`) : les écrans s'adaptent à la taille du téléphone. PLACEHOLDER à remplacer par les vraies pages |
| `FormatsSection` | Taille, forme, options | Configurateur : échelle réelle face à un smartphone de 15 cm, morphing de forme, interrupteurs NFC / anti-métal / découpe (clip-path) |
| `CustomSection` | Sticker sur mesure | Points actifs qui apparaissent et pulsent, rotation liée au scroll |
| `GameSection` | QR Smart Réduction | Roue et trois boîtes **jouables**, changement de jeu en View Transition |
| `QrCTA` | Démonstration, proposition, livraison | Ligne de progression pilotée par le scroll |

Visuels ajoutés : `sticker-google`, `sticker-wifi`, `sticker-reseaux`, `sticker-menu`, `sticker-contact`, `sticker-rdv`, `sticker-sur-mesure` (fond détouré), `jeu-roue-sel-braise`, `jeu-boites-oasis`.

À remplacer : écrans de démonstration (`PhoneScreens.tsx`), lots du jeu (`Q_GAME.wheel` / `Q_GAME.boxes`), prix du menu de démonstration.


---

# Page Panneaux & bâches QR (`/panneaux-baches`)

Fichiers : `src/pages/PanneauxPage.tsx`, `src/components/panneaux/*`, `src/styles/panneaux.css`, textes dans `src/data/panneaux.ts`.

| Composant | Contenu | Technique |
|---|---|---|
| `PanHero` | « Votre message en grand format, un accès digital derrière. » | Collage des 4 formats en profondeur : chaque calque bouge selon sa profondeur au pointeur (variables CSS), entrée en cascade |
| `PanIndex` | Sommaire des 4 formats | Ancres vers chaque section |
| `ImmoStory` | Panneau immobilier connecté | Scène sticky : zoom caméra sur le QR, la fiche du bien s'ouvre et ses rubriques s'allument, tampon « Vendu », le lien passe au bien suivant |
| `BacheSection` | Bâche grand format | Bâche qui ondule, reflet limité au tissu par masque CSS, œillets qui pulsent, décor qui change selon l'usage (chantier, devanture, événement) |
| `AccueilSection` | Panneau d'accueil, 8 accès | Les 8 QR du visuel sont cliquables, le téléphone affiche l'écran correspondant, défilement automatique |
| `ChevaletSection` | Chevalet trottoir | Sélecteur de jour : l'affiche ne change pas, le plat du jour oui (jour courant présélectionné) |
| `FiveSteps` (partagé) | « Cinq temps, un livrable à chaque étape » | Ligne de progression au scroll |

# Page Branding intelligent (`/branding-intelligent`)

Fichiers : `src/pages/BrandingPage.tsx`, `src/components/branding/*`, `src/styles/branding.css`, textes dans `src/data/branding.ts`.

| Composant | Contenu | Technique |
|---|---|---|
| `BrandHero` | « Vos tenues deviennent des points de contact. » | Polo incliné au pointeur, cadres de scan animés sur le logo et le QR |
| `WearStory` | T-shirt → Polo → Casquette | Travelling caméra piloté par le scroll : vue d'ensemble, zoom sur le logo, panoramique vers le QR, la page de la marque s'ouvre |
| `WearProducts` | Les 3 tenues du catalogue | Survol ou toucher : zoom centré sur le QR du visuel |
| `ObjectsBand` | « Plus qu'un objet. Une expérience. » | Repères qui s'allument un à un sur la photo ; sur mobile, repères numérotés + légende |

Composants partagés ajoutés : `hooks/useStickyProgress.ts` (progression des scènes sticky, sans re-render par frame), `shared/SimpleCTA.tsx`, `shared/FiveSteps.tsx`.

Pourquoi deux pages : le cahier des charges (sections 05 et 28) prévoit déjà deux onglets et deux URL distincts (`/panneaux-baches` et `/branding-intelligent`), et l'accueil renvoie vers les deux. Aucun onglet supplémentaire.

## Vérifications faites
Rendu contrôlé en 1440 px, 820 px (tablette) et 390 px (mobile) sur les 5 pages : aucune erreur console, aucun débordement horizontal, aucune image cassée.


---

# Page Secteurs (`/secteurs`)

Fichiers : `src/pages/SecteursPage.tsx`, `src/components/secteurs/*`, `src/styles/secteurs.css`, textes dans `src/data/secteurs.ts`.

Le catalogue n'a pas de texte par secteur. Chaque secteur assemble donc les produits du catalogue qui lui correspondent, **avec leurs descriptions mot pour mot**. Les accroches par secteur et le choix des produits par secteur sont marqués `À VALIDER`.
Pour modifier un secteur (produits, visuels, actions du téléphone), tout se fait dans `SECTORS` de `secteurs.ts` ; la matrice se recalcule toute seule.

| Composant | Contenu | Technique |
|---|---|---|
| `SecHero` | « Une solution adaptée à chaque métier. » | Orbite des 7 métiers (rotation lente, icônes qui restent droites), faisceau vers le secteur actif (toujours par le chemin le plus court), téléphone qui affiche la page type du métier. Clic : défilement au chapitre |
| `SectorExplorer` | Les 7 secteurs | Chapitres qui défilent, colonne visuelle épinglée (`position: sticky`) recomposée à chaque secteur par révélation `clip-path` en cascade ; barre d'onglets collante en verre dépoli (`backdrop-filter`) avec progression ; sur mobile, visuel intégré à chaque chapitre |
| `SectorMatrix` | Quel support pour quel métier ? | Croix de survol en CSS pur (sélecteur `:has()`), filtre par support au clic, version compacte sur mobile |
| `ChainSection` | Trois métiers connectés (catalogue) | Signal qui parcourt la chaîne au scroll, citation révélée mot à mot (timeline de scroll nommée) |

Liens « Voir la page … » : pointent vers `/secteurs/<secteur>` (sous-pages prévues au cahier, section 28, pas encore créées).


---

# Page À propos (`/a-propos`)

Fichiers : `src/pages/AProposPage.tsx`, `src/components/apropos/*`, `src/styles/apropos.css`, textes dans `src/data/apropos.ts`.
Page pensée pour **activer le tunnel de vente** : chaque section mène au diagnostic ou à la démonstration.

| Composant | Contenu | Technique |
|---|---|---|
| `AboutHero` + `ParticleLogo` | « Des supports qui créent du lien. » | Le symbole S officiel recomposé en modules de QR code (Canvas 2D) : ressorts, répulsion au doigt ou à la souris, respiration au repos, pause hors écran |
| `Manifesto` | Conviction du catalogue (pôle II) | Scène sticky : phrase révélée mot à mot, « dépense » barrée, « commercial » soulignée. Opacité calculée en CSS pur (`clamp()` + `calc()` sur la variable `--p`) |
| `VerbsBand` | Connecter · Partager · Simplifier | Typographie géante qui glisse au scroll, contour rempli de rouge (`background-clip: text`) |
| `Promises` | Engagements (textes du catalogue) | Cartes « projecteur » : halo et bordure qui suivent le pointeur (`mask-composite`) |
| `Diagnostic` | 3 questions → 3 supports recommandés | Recommandation calculée depuis le catalogue et les secteurs ; demande pré-remplie par e-mail ou appel direct |
| `Faq` | Questions fréquentes (réponses = catalogue) | Accordéon animé (`grid-template-rows`), données structurées schema.org `FAQPage` |
| `AboutEnd` | « Et si on restait connectés ? » + coordonnées | Tracé manuscrit révélé, carte en verre dépoli |
| `StickyCTA` | Bouton « Demander une démonstration » | Apparaît après le hero, disparaît pendant le diagnostic et la zone contact (jamais par-dessus un autre bouton d'action) |

## Tunnel de vente : à brancher
- **Envoi de la demande** : aujourd'hui un `mailto:` pré-rempli (activité, priorité, taille, supports recommandés). À remplacer par un vrai formulaire (API, CRM ou WhatsApp Business) dans `Diagnostic.tsx`.
- **Mesure** : `src/utils/track.ts` pousse les événements `diag_answer`, `diag_result`, `lead_email`, `lead_call`, `cta_demo` dans `window.dataLayer`. Installer Google Tag Manager / GA4 pour suivre le taux de conversion du diagnostic.
- **Coordonnées** : `CONTACT` dans `apropos.ts` (téléphone, e-mail, zone).


---

# Page Contact (`/contact`)

Fichiers : `src/pages/ContactPage.tsx`, `src/components/contact/*`, `src/styles/contact.css`, textes dans `src/data/contact.ts`, envoi dans `src/utils/lead.ts`.

| Composant | Contenu | Technique |
|---|---|---|
| `ContactHero` | « Votre prochain point de contact commence ici. » + 4 canaux | Cartes magnétiques (3D au pointeur), copie du téléphone / e-mail en un geste (Clipboard API). « La démonstration » pré-remplit le formulaire |
| `CardStudio` (`withIntent`, ancre `#formulaire`) | « Créez votre carte » : le visiteur choisit sa demande (devis, démonstration, maquette) et son niveau, tape ses coordonnées, sa carte s'écrit en direct | Voir la section « Module Créez votre carte » plus bas |
| `MapSection` | Où nous trouver | Carte schématique animée (aucun service de carte chargé), lien Google Maps |

## À brancher
- **Envoi** : renseigner `LEAD_ENDPOINT` dans `data/contact.ts` (API, CRM, Formspree…) → envoi direct en JSON. Tant qu'il est vide, la messagerie s'ouvre avec la demande pré-remplie.
- **Pré-remplissage depuis les autres pages** : `/contact?sujet=devis|demo|maquette#formulaire`. Le bouton « Demander un devis » du header l'utilise déjà (`sujet=devis`).
- **Mesure** : événements `studio_start`, `studio_intent`, `studio_tier`, `studio_submit`, `contact_copy`, `map_open` (voir `utils/track.ts`).
- **À vérifier** : adresse publique affichée (`PLACE.address`), horaires d'ouverture (non affichés, faute d'information), mention légale de protection des données (CDP Sénégal) sous le formulaire.
- **Vraie carte** : remplacer le bloc `.cm-map` par un `<iframe>` Google Maps si souhaité.


---

# Module « Créez votre carte » (page Contact, section `#formulaire`)

Fichiers : `src/components/studio/CardStudio.tsx`, `src/styles/studio.css`, textes dans `src/data/studio.ts`.

- Le visiteur choisit son niveau (Essentielle recto seul, Pro rouge recto-verso, Signature dorée recto-verso) et tape ses coordonnées : la carte s'écrit en direct, avec un curseur sur la ligne en cours de saisie. Inclinaison 3D, retournement recto / verso.
- Sur mobile, la carte reste collée en haut de l'écran pendant la saisie.
- À la validation : effet d'encodage (faisceau + ondes NFC), puis envoi via `utils/lead.ts` (même réglage `LEAD_ENDPOINT` que la page Contact).
- Événements de mesure : `studio_start`, `studio_tier`, `studio_submit`.
- Lien direct vers le module : `/contact#formulaire` (à utiliser dans les publicités, QR, signatures e-mail). Sur la page Contact, le module affiche aussi « Je souhaite : un devis / une démonstration / la maquette de ma carte », et le bouton d'envoi change selon le choix.

## Données recueillies et prospection : règles intégrées
Loi sénégalaise n° 2008-08 sur les transactions électroniques, article 16 : la prospection directe par courrier électronique vers une personne physique est interdite sans son consentement préalable ; chaque message doit indiquer comment se désinscrire.
Le module applique donc :
- une case d'accord newsletter / offres **séparée et non cochée par défaut** ; sans elle, les coordonnées ne servent qu'à répondre à la demande de maquette ;
- l'enregistrement de la preuve dans la demande : `consent_marketing` (oui / non), `consent_text` (texte exact accepté), `consent_at` (date et heure).

À faire côté outil d'envoi : n'importer dans la liste newsletter que les contacts `consent_marketing = true`, prévoir un lien de désinscription dans chaque envoi, et vérifier auprès de la CDP (Commission de protection des données personnelles) les formalités de déclaration du fichier.


---

# Accueil V2 (`/`)

Fichiers : `src/pages/HomePage.tsx`, `src/components/home/*`, `src/styles/home.css`, mise en scène dans `src/data/home.ts`.
**Tous les textes restent ceux du cahier des charges** (`content.ts`, sections 06 à 17 et règle de cohérence de la section 29). La page ne répète pas le détail des pages produits : chaque bloc est une porte d'entrée.

| Composant | Section du cahier | Mise en scène |
|---|---|---|
| `HomeHero` | Hero | Scène de convergence : la carte, le sticker, le chevalet et le polo ouvrent **la même page** ; faisceau vers le téléphone, étiquette « Ouvert depuis : … », profondeur au pointeur |
| `MetiersPanels` | Trois métiers connectés | Panneaux extensibles : le métier survolé s'ouvre, les autres se replient en bandeaux verticaux ; cartes empilées sur mobile |
| `SupportsBento` | Nos supports | Grille bento, une micro-interaction par tuile (carte qui s'incline, stickers en éventail, zoom sur le QR du panneau, polo du logo au QR) ; chaque tuile ouvre sa page |
| `ProcessScrubber` | Comment ça marche ? | Frise à faire glisser (`<input type="range">` accessible au clavier), lecture automatique jusqu'à ce que le visiteur prenne la main, note manuscrite à l'étape 04 |
| `SectorsMarquee` | Nos secteurs | Deux bandeaux infinis en sens opposés (métiers / accroches), pause au survol, liens vers les chapitres de la page Secteurs |
| `TypeTeaser` | (ajout) | Carte qui s'écrit toute seule, renvoie au module « Créez votre carte » de la page Contact |
| `SimpleCTA` | CTA final | « Construisons ensemble vos outils intelligents. » sur la photo d'ambiance du catalogue |

À fournir : la vidéo du bouton « Voir la vidéo » (cahier, section 06), la photo HD du CTA final (coucher de soleil).


---

# Configurateur de carte (page Cartes, section `#creer-ma-carte`)

Même composant que le module de la page Contact : `<CardStudio designer />`. Règles par niveau, conformes au catalogue :

| Niveau | Aperçu | Personnalisation |
|---|---|---|
| Essentielle | Visuel produit Support Connecté | Aucune personnalisation visuelle ; les coordonnées vont sur la page connectée |
| Pro | Carte Pro (liseré rouge), recto-verso | Les coordonnées s'écrivent en direct sur la carte |
| Signature | Carte Signature, recto-verso | En plus : 6 fonds pré-chargés (noir mat, or brossé, rouge profond, motif, 2 photos) ou **image importée** (bouton ou glisser-déposer sur la carte), **logo importé**, couleur d'accent (5 teintes + sélecteur libre), zoom, cadrage, assombrissement |

- Les boutons « Découvrir l'Essentielle / la Pro / la Signature » de la section « Une carte pour chaque niveau » ouvrent le configurateur sur le bon niveau.
- Fichiers acceptés : images (PNG, JPG, WEBP, SVG), 5 Mo maximum. L'aperçu est local (rien n'est envoyé tant que le visiteur ne valide pas).
- Envoi : le détail du design part avec la demande (`design` : fond, logo, accent, zoom, cadrage, assombrissement). En mode API (`LEAD_ENDPOINT`), les images de moins de 1,5 Mo sont jointes en base64 (`fond_fichier`, `logo_fichier`). En mode e-mail, un message rappelle au visiteur de joindre ses fichiers.
- À prévoir côté serveur si vous voulez recevoir les fichiers lourds : un envoi en `multipart/form-data` vers un stockage (S3, Cloudinary…).
- Mesure : `studio_upload` (logo / fond) en plus des événements du module.

## V2 (septembre 2026)

- **Règle des cartes de visite** : recto = logo, verso = coordonnées + QR discret en bas à droite (configurateur, module Contact, carte 3D). Les anciens visuels avec QR au recto ont été retirés.
- **Menu déroulant** « Nos solutions » (`components/Header.tsx`, `data/content.ts` → `NAV`, `NAV_FLAT`).
- **Photos animées** : `components/media/PhotoBand.tsx` (bandeau zoom/parallaxe, panoramique mobile, repères), `HandTrio.tsx` (3 niveaux en main → configurateur), `UniversGallery.tsx` (univers par métier).
- **Pages** : `/mentions-legales`, `/confidentialite` (gabarits à compléter), 404. `App.tsx` accepte une prop `path`.
- **Textes pilotés par le back-office** : `lib/content.ts` (`useContent`) — variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## V3 (version finale)

- **Menus principaux** en Plus Jakarta Sans (`--ui` dans global.css, chargée dans index.html) ; sous-menus inchangés.
- **QR Smart** : formats réels 8, 12 et 17 cm ; modèles ou sur mesure sur devis ; « nous les remplissons, paramétrons et testons » (`data/qr.ts` → `Q_FORMATS.service`). Section de présentation du sticker personnalisé supprimée.
- **Roue** (`components/qr/GameSection.tsx`) : libellés dans la longueur des cases, 3 cases « Perdu ».
- **Visuels des jeux** contenus dans leur cadre (`styles/home.css` métier I, `styles/qr.css` colonne du jeu).
- **Tableau des niveaux** (`data/cartes.ts`) : 5 lignes pour les fonctions des fiches V3 (À VALIDER). Ce tableau est la référence des droits (voir le guide PDF).

## V5 — Création de contenu & Immobilier (TypeScript)

Deux pages en **TypeScript + React**, chargées à la demande (`React.lazy`) : leur code et leurs styles ne pèsent pas sur les autres pages.

| Route | Page | Données (textes) |
|---|---|---|
| `/creation-contenu` | `pages/ContenuPage.tsx` | `data/contenu.ts` |
| `/secteurs/immobilier` | `pages/ImmobilierPage.tsx` | `data/immobilier.ts` |
| `/secteurs/<autre secteur>` | page Secteurs, défilée jusqu'au secteur | `data/secteurs.ts` |

```
src/
├── types/v5.ts                 Types partagés (prestation, demande de devis…)
├── data/prestations.ts         Catalogue unique des prestations (id stables = clés de prix et valeurs envoyées au back-office)
├── data/contenu.ts, immobilier.ts, conseiller.ts
├── lib/prices.ts               Prix « à partir de » lus dans le back-office (vide = sur devis)
├── lib/meta.ts, lib/css.ts     Titre/description de page, variables CSS typées
└── components/
    ├── devis/                  quoteStore (sélection partagée), AddToQuote, ServiceCard, QuoteBar, QuoteForm (2 étapes)
    ├── contenu/                Hero, sommaire, réel/IA, pôles, impression, IA, galerie, équipe
    ├── immobilier/             Hero, profils, parcours promoteur, démo des lots, tunnel de vente, formules, offres
    └── shared/                 Pic (images responsives), FaqList, CtaBand
```

- **Vérifier les types** : `npm run typecheck` (tout le site est en TypeScript strict depuis la V6).
- **Images** : `public/images/{contenu,immobilier,equipe}/<nom>-l.webp` (largeur pleine) et `-s.webp` (moitié). Pour remplacer un visuel, garder ces deux suffixes et les dimensions déclarées dans `data/*.ts`.
- **Demande de devis** : un seul formulaire pour toutes les prestations, envoyé à `lead-intake` (même circuit que la page Contact). Liens directs : `?devis=video,visite-3d` (prestations pré-cochées) ou `#devis`.
- **Bouton « Demander un devis » de l'en-tête** : sur les pages V5 il ouvre le formulaire (`Header` → prop `onQuote`), ailleurs il mène à `/contact`.
- **WhatsApp** : renseigner `WHATSAPP` dans `data/conseiller.ts` (format international). Vide = les boutons proposent d'appeler le standard.
- **Textes modifiables dans le back-office** : `contenu.hero`, `contenu.cta`, `contenu.prix`, `immobilier.hero`, `immobilier.cta`, `immobilier.prix`.
- **Mesure du tunnel (GA4 / GTM)** : `quote_add`, `quote_remove`, `quote_open` (from, pole), `quote_step` (étape 2), `quote_submit` (pole, profil, production, délai), `quote_error`, `mode_switch`, `stage_view`, `demo_lot`, `gallery_open`, `lead_call` / `lead_whatsapp`. Entonnoir à créer : `quote_open` → `quote_step` → `quote_submit`.
- Visuels des pages V5 : univers de démonstration (signalés comme tels sur la page). Programme « Les Terrasses du Sahel » : exemple fictif.

## Tests et hébergement (V6)

| Quoi | Commande |
|---|---|
| Types (code, configuration Vite, tests) | `npm run typecheck` |
| Bout en bout, bureau et mobile (37 tests) | `npm run test:e2e:install` une fois, puis `npm run test:e2e` — construit le site et le sert sur :4173 ; `E2E_BASE_URL=https://… npm run test:e2e` pour tester un site en ligne |

Les tests vérifient les 14 adresses, les règles de contenu V6 (aucune promesse « 48 h », etc.), **tous les liens internes et ancres**, et les formulaires (les demandes partent vers une adresse factice interceptée). Les deux écarts connus — `#video` et `/equipe` — sont listés dans `e2e/liens.spec.ts` et sont à corriger avant la mise en ligne.

Hébergement : `vercel.json` (Vercel) et `public/_redirects` (Netlify) contiennent la redirection 301 de `/secteurs/immobilier`, les réécritures `/q/:code` (QR dynamiques) et `/f/:slug` (fiches), et le repli sur `index.html`. Remplacer `PROJECT_REF` et `URL_OUTIL_MEMBRES`.
# sc-client


## Back-office administrateur (`/admin`)

Le back-office est intégré à ce projet : voir `src/features/admin/README.md`. Il partage l'API, la session et les erreurs du reste du site.
Connexion : `/admin/login`. Les pages sont chargées à la demande.
