/*
  FIXTURES DE TEST UNIQUEMENT : cinq fiches complètes (une par formule / secteur) pour les tests Vitest.
  Ne jamais importer ce fichier depuis le code applicatif (un test le vérifie : src/test/noMocksInApp.test.ts).
*/
// Fiches de démonstration — même structure que l'API actuelle (fiches.getBySlug)
// + nouveaux champs V2 : data.secteur, data.onglets, data.entete, data.menu, data.biens, enLigneSeule.
import type { FicheRecord, Horaire } from "../../types";

const palm =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#0c0c0c" stroke="#e8c77f" stroke-width="3"/><path d="M60 92V52m0 0c-6-12-20-16-30-10 10-2 20 2 26 10-12-6-24-2-30 6 10-6 22-4 30 2m4-8c6-12 20-16 30-10-10-2-20 2-26 10 12-6 24-2 30 6-10-6-22-4-30 2M60 52c-2-12 4-22 14-26-6 6-9 14-10 22" fill="none" stroke="#e8c77f" stroke-width="3" stroke-linecap="round"/><path d="M36 92h48" stroke="#e8c77f" stroke-width="3" stroke-linecap="round"/></svg>`
  );
const house =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="18" fill="#fff"/><path d="M26 62L60 34l34 28" fill="none" stroke="#1f3a2e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 58v28h44V58M54 86V70h12v16" fill="none" stroke="#1f3a2e" stroke-width="5" stroke-linejoin="round"/><path d="M84 30c4 8 2 16-4 20" stroke="#b8875a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`
  );
const semaine = (h: (i: number) => string): Horaire[] =>
  ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(
    (jour, i) => ({ jour, horaire: h(i) })
  );

export const FICHES: FicheRecord[] = [
  {
    id: 101,
    slug: "le-sunset",
    formule: "signature",
    statut: "active",
    enLigneSeule: false,
    prenom: "Le Sunset",
    nom: "",
    fonction: "Restaurant · Saly",
    entreprise: "Le Sunset",
    photo: "",
    logo: palm,
    telephone: "+221 77 000 00 01",
    whatsapp: "+221 77 000 00 01",
    email: "contact@lesunset.sn",
    site: "",
    adresse: "Saly Portudal, Mbour",
    googlePlaceId: "",
    dateEcheance: "2027-09-22",
    scansTotal: 412,
    data: {
      secteur: "restaurant",
      premierBouton: "whatsapp",
      messageWhatsapp: "Bonjour, je souhaite réserver une table.",
      presentation:
        "Cuisine de la mer et coucher de soleil sur la Petite Côte. Réservation conseillée le week-end.",
      reseauxSociaux: [
        { label: "Instagram", url: "#" },
        { label: "Facebook", url: "#" },
        { label: "TikTok", url: "#" },
      ],
      liens: [],
      horaires: semaine(i => (i === 0 ? "Fermé" : "12:00 – 23:00")),
      galerie: [
        {
          type: "image",
          url: "/images/scene-table-sunset.webp",
          alt: "Terrasse au coucher du soleil",
        },
        {
          type: "image",
          url: "/images/univers-chez-homard.webp",
          alt: "La salle",
        },
      ],
      menu: {
        sections: [
          {
            titre: "Plats signature",
            plats: [
              {
                nom: "Plateau de langoustes grillées",
                prix: "18000",
                description:
                  "Langoustes du jour, beurre citronné, légumes de saison. Pour deux personnes.",
                image: "/demo/plat-homard.webp",
                video: "/demo/plat-homard.mp4",
                videoWebm: "/demo/plat-homard.webm",
                badge: "signature",
              },
              {
                nom: "Brochettes de la mer",
                prix: "9500",
                description:
                  "Crevettes et poisson marinés, sauce maison, riz parfumé.",
                image: "/demo/plat-brochettes.webp",
                video: "/demo/plat-brochettes.mp4",
                videoWebm: "/demo/plat-brochettes.webm",
                badge: "nouveau",
              },
            ],
          },
          {
            titre: "Au bar",
            plats: [
              {
                nom: "Accord mets et vins",
                prix: "4500",
                description:
                  "Un verre sélectionné pour votre plat, servi en terrasse face au coucher du soleil.",
                image: "/demo/plat-cocktails.webp",
                video: "/demo/plat-cocktails.mp4",
                videoWebm: "/demo/plat-cocktails.webm",
              },
            ],
          },
        ],
      },
      rendezVous: { label: "Réserver une table", url: "" },
      onglets: [
        { id: "o1", type: "menu", titre: "La carte", visible: true },
        {
          id: "o2",
          type: "rendezvous",
          titre: "Réserver une table",
          visible: true,
        },
        { id: "o3", type: "horaires", visible: true },
        { id: "o4", type: "galerie", visible: true },
        { id: "o5", type: "avis", visible: true },
        { id: "o6", type: "localisation", visible: true },
        {
          id: "o7",
          type: "texte",
          titre: "Soirées musicales",
          contenu: "Chaque vendredi soir : musique live en terrasse, dès 20 h.",
          visible: true,
        },
      ],
      entete: {
        disposition: "logo",
        taille: "l",
        theme: "or",
        couverture: "/images/scene-table-sunset.webp",
      },
    },
  },
  {
    id: 105,
    slug: "teranga-immo",
    formule: "signature",
    statut: "active",
    enLigneSeule: false,
    prenom: "Teranga Immo",
    nom: "",
    fonction: "Achat · Vente · Location · Gestion",
    entreprise: "Teranga Immo",
    photo: "",
    logo: house,
    telephone: "+221 77 000 00 05",
    whatsapp: "+221 77 000 00 05",
    email: "contact@exemple.sn",
    site: "",
    adresse: "Saly, Mbour",
    googlePlaceId: "",
    dateEcheance: "2027-05-15",
    scansTotal: 233,
    data: {
      secteur: "immobilier",
      premierBouton: "whatsapp",
      messageWhatsapp: "Bonjour, je cherche un bien.",
      presentation:
        "Agence immobilière sur la Petite Côte : villas, appartements, terrains et gestion locative.",
      reseauxSociaux: [
        { label: "Facebook", url: "#" },
        { label: "Instagram", url: "#" },
        { label: "LinkedIn", url: "#" },
      ],
      liens: [],
      horaires: semaine(i => (i === 6 ? "Fermé" : "09:00 – 18:00")),
      galerie: [],
      biens: [
        {
          titre: "Villa contemporaine avec piscine",
          type: "vente",
          prix: "185000000",
          ville: "Saly Niakh Niakhal",
          surface: 240,
          terrain: 600,
          chambres: 4,
          sdb: 3,
          atouts: ["Piscine", "Jardin", "Climatisation", "Titre foncier"],
          description:
            "Villa récente, lumineuse, à 5 minutes de la plage. Cuisine équipée, grande terrasse.",
          photos: [
            "/demo/bien-villa-piscine.webp",
            "/images/fond-villa.webp",
            "/demo/bien-hotel.webp",
          ],
        },
        {
          titre: "Résidence neuve, appartements T3",
          type: "vente",
          prix: "62000000",
          ville: "Saly Portudal",
          surface: 95,
          chambres: 2,
          sdb: 2,
          atouts: ["Piscine commune", "Gardiennage", "Parking"],
          description:
            "Programme neuf : livraison prévue au premier semestre. Plusieurs lots disponibles.",
          photos: [
            "/demo/bien-residence.webp",
            "/demo/bien-villa-piscine.webp",
          ],
        },
        {
          titre: "Villa meublée à la saison",
          type: "location",
          prix: "650000",
          periode: "mois",
          ville: "Saly Carrefour",
          surface: 160,
          chambres: 3,
          sdb: 2,
          atouts: ["Meublée", "Piscine", "Wi-Fi"],
          description: "Location meublée au mois, ménage inclus.",
          photos: ["/images/fond-villa.webp", "/demo/bien-hotel.webp"],
        },
      ],
      onglets: [
        { id: "o1", type: "biens", titre: "Nos biens", visible: true },
        { id: "o2", type: "presentation", visible: true },
        { id: "o3", type: "rappel", titre: "Être rappelé", visible: true },
        { id: "o4", type: "avis", visible: true },
        { id: "o5", type: "localisation", visible: true },
        { id: "o6", type: "reseaux", visible: true },
      ],
      entete: {
        disposition: "banniere",
        taille: "m",
        theme: "clair",
        couverture: "/demo/bien-villa-piscine.webp",
      },
    },
  },
  {
    id: 102,
    slug: "malick-diop",
    formule: "signature",
    statut: "active",
    enLigneSeule: false,
    prenom: "Malick",
    nom: "Diop",
    fonction: "Responsable commercial",
    entreprise: "Support Connecté",
    photo: "",
    logo: "/images/symbole-s.webp",
    telephone: "+221 77 000 00 02",
    whatsapp: "+221 77 000 00 02",
    email: "malick@exemple.sn",
    site: "",
    adresse: "Saly Niakh Niakhal, Mbour",
    googlePlaceId: "",
    dateEcheance: "2027-06-10",
    scansTotal: 188,
    data: {
      secteur: "independant",
      premierBouton: "whatsapp",
      messageWhatsapp: "Bonjour Malick, je souhaite échanger avec vous.",
      presentation:
        "Je vous accompagne pour connecter vos supports physiques à vos outils digitaux : cartes NFC, QR Smart, panneaux et textiles.",
      reseauxSociaux: [
        { label: "LinkedIn", url: "#" },
        { label: "Instagram", url: "#" },
      ],
      liens: [
        { label: "Catalogue 2026", url: "#" },
        { label: "Prendre rendez-vous", url: "#" },
      ],
      horaires: semaine(i => (i === 6 ? "Fermé" : "Sur rendez-vous")),
      galerie: [],
      sections: [],
      onglets: [
        { id: "o1", type: "presentation", visible: true },
        { id: "o2", type: "rappel", visible: true },
        { id: "o3", type: "liens", visible: true },
        { id: "o4", type: "reseaux", visible: true },
        { id: "o5", type: "horaires", visible: true },
      ],
      entete: { disposition: "duo", taille: "m", theme: "or", couverture: "" },
    },
  },
  {
    id: 103,
    slug: "mamadou-diop",
    formule: "pro",
    statut: "active",
    enLigneSeule: false,
    prenom: "Mamadou",
    nom: "Diop",
    fonction: "Conseiller immobilier",
    entreprise: "Teranga Immo",
    photo: "",
    logo: "",
    telephone: "+221 77 000 00 03",
    whatsapp: "+221 77 000 00 03",
    email: "mamadou@exemple.sn",
    site: "",
    adresse: "Dakar, Sénégal",
    googlePlaceId: "",
    dateEcheance: "2027-03-01",
    scansTotal: 57,
    data: {
      secteur: "immobilier",
      premierBouton: "whatsapp",
      messageWhatsapp: "Bonjour, je cherche un bien.",
      presentation:
        "Achat, vente, location et gestion à Dakar et sur la Petite Côte.",
      reseauxSociaux: [
        { label: "Facebook", url: "#" },
        { label: "Instagram", url: "#" },
        { label: "LinkedIn", url: "#" },
      ],
      liens: [
        { label: "Tous nos biens", url: "#" },
        { label: "Estimation gratuite", url: "#" },
      ],
      horaires: semaine(i => (i > 4 ? "Sur rendez-vous" : "09:00 – 18:00")),
      galerie: [
        { type: "image", url: "/demo/bien-villa-piscine.webp", alt: "Villa" },
        { type: "image", url: "/images/fond-villa.webp", alt: "Villa" },
      ],
      sections: [
        {
          titre: "À la vente",
          articles: [
            {
              nom: "Villa 4 chambres, Saly",
              description: "Piscine, 600 m² de terrain",
              photo: "/demo/bien-villa-piscine.webp",
            },
            {
              nom: "Appartement T3, Saly Portudal",
              description: "Résidence neuve",
              photo: "/demo/bien-residence.webp",
            },
          ],
        },
      ],
      onglets: [],
      entete: { disposition: "portrait", taille: "m", theme: "clair" },
    },
  },
  {
    id: 104,
    slug: "awa-ndiaye",
    formule: "essentielle",
    statut: "active",
    enLigneSeule: true,
    prenom: "Awa",
    nom: "Ndiaye",
    fonction: "Coiffeuse",
    entreprise: "Studio Awa",
    photo: "",
    logo: "",
    telephone: "+221 77 000 00 04",
    whatsapp: "+221 77 000 00 04",
    email: "",
    site: "",
    adresse: "Mbour",
    googlePlaceId: "",
    dateEcheance: null,
    scansTotal: 23,
    data: {
      secteur: "beaute",
      premierBouton: "whatsapp",
      messageWhatsapp: "Bonjour Awa, je souhaite un rendez-vous.",
      presentation: "Coiffure, tresses et soins à Mbour.",
      reseauxSociaux: [
        { label: "Instagram", url: "#" },
        { label: "TikTok", url: "#" },
      ],
      onglets: [],
      entete: {},
    },
  },
];
