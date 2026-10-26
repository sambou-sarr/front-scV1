// Textes de la page QR Smart (/qr-smart).
// Sources : catalogue 2026 (pages QR Smart). V6 : « QR Smart Réduction » devient « QR Smart » ; configurateurs de stickers retirés.
// Les lignes marquées « À VALIDER » sont des propositions de rédaction, pas encore validées.

export const Q_HERO = {
  label: "QR Smart · Édition 2026",
  line1: "Un petit support.",
  red: "Un grand résultat.",
  lead: "Résistants à l’eau et aux UV, en 8, 12 ou 17 cm. Nous les remplissons, les paramétrons et les testons pour vous : posés en quelques secondes, modifiables à distance.", // formats et service : À VALIDER
  cta1: "Demander mes stickers",
  cta2: "Voir ce que voit votre client",
  badges: [
    { icon: "i-drop", label: "Eau et UV" },
    { icon: "i-ruler", label: "8, 12 ou 17 cm" },
    { icon: "i-sync", label: "Modifiable à distance" },
  ],
  hint: "Faites glisser pour tourner",
};

export const Q_STICKERS = [
  {
    id: "google",
    img: "/images/sticker-google.webp",
    label: "Avis clients",
    text: "Google, TripAdvisor, Booking, avant le départ.",
    where: "Sur la table, au comptoir, avec l’addition." /* À VALIDER */,
  },
  {
    id: "wifi",
    img: "/images/sticker-wifi.webp",
    label: "Accès Wi-Fi",
    text: "La connexion sans donner le mot de passe.",
    where: "À l’accueil, en chambre, en salle." /* À VALIDER */,
  },
  {
    id: "reseaux",
    img: "/images/sticker-reseaux.webp",
    label: "Réseaux sociaux",
    text: "Instagram, Facebook, TikTok, YouTube.",
    where: "En vitrine, près de la caisse." /* À VALIDER */,
  },
  {
    id: "menu",
    img: "/images/sticker-menu.webp",
    label: "Notre menu",
    text: "Menu digital modifiable chaque jour.",
    where: "Sur chaque table, en terrasse." /* À VALIDER */,
  },
  {
    id: "contact",
    img: "/images/sticker-contact.webp",
    label: "Contactez-nous",
    text: "Appel, WhatsApp, email, site.",
    where: "Sur la porte, le véhicule, le comptoir." /* À VALIDER */,
  },
  {
    id: "rdv",
    img: "/images/sticker-rdv.webp",
    label: "Rendez-vous",
    text: "Réservation d’un créneau en un scan.",
    where: "En vitrine, en salle d’attente." /* À VALIDER */,
  },
];

export const Q_USES = {
  label: "Un sticker par besoin",
  title: "Ce que votre client scanne.",
  red: "Ce qu’il obtient.",
  whereLabel: "Où le poser",
};

export const Q_GAME = {
  label: "QR Smart",
  title: "Boostez vos avis,",
  red: "faites jouer vos clients.",
  text: "Un sticker posé sur la table. En fin de repas, le client scanne, donne son avis, puis joue : la roue ou le jeu des trois boîtes. Il repart avec un bon de réduction à utiliser lors de sa prochaine visite.",
  tabs: [
    {
      id: "roue",
      label: "La roue",
      img: "/images/jeu-roue-sel-braise.webp",
      caption:
        "Exemple Sel & Braise : le client tourne la roue et découvre son lot.",
    },
    {
      id: "boites",
      label: "Les trois boîtes",
      img: "/images/jeu-boites-oasis.webp",
      caption: "Exemple L’Oasis : le client choisit une boîte parmi trois.",
    },
  ],
  // Lots de démonstration (réglables par le client : cases gagnantes, valeurs, achat minimum)
  wheel: [
    "-10 %",
    "Perdu",
    "Dessert offert",
    "-15 %",
    "Perdu",
    "Café offert",
    "-5 %",
    "Perdu",
  ],
  boxes: ["-10 %", "Dessert offert", "Café offert"],
  cols: [
    {
      title: "Comment ça marche",
      items: [
        "Le client scanne en fin de repas",
        "Il donne son avis Google",
        "Il joue et gagne un bon de réduction",
      ],
    },
    {
      title: "Ce que vous réglez",
      items: [
        "Couleurs et nombre de cases",
        "Cases gagnantes et perdantes",
        "Valeur des bons et achat minimum",
      ],
    },
    {
      title: "Ce que vous suivez",
      items: [
        "Nombre de parties jouées",
        "Bons distribués",
        "Évolution de votre note",
      ],
    },
  ],
};

export const Q_CTA = {
  label: "Travailler ensemble",
  title: "Votre prochain point de contact",
  red: "commence ici.",
  steps: [
    {
      title: "La démonstration",
      text: "Nous venons avec les supports. Vous scannez, vous voyez ce que verront vos clients.",
    },
    {
      title: "La proposition",
      text: "Devis chiffré et détaillé, sans engagement.",
    },
    {
      title: "La livraison",
      text: "Délais respectés après validation, installation comprise.",
    },
  ],
  cta1: "Demander une démonstration",
  cta2: "Parler à un conseiller",
};
