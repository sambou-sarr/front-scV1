// Catalogue des prestations V5 — une seule source pour les pages, le formulaire de devis et le back-office.
// Identifiants (id) STABLES : ils servent de clé de prix (bloc « Contenu du site » → contenu.prix / immobilier.prix)
// et sont envoyés tels quels au back-office (requests.services). Les libellés peuvent changer, pas les id.
import type { Pole, Prestation } from '../types/v5';

export const POLES: Record<Pole, { label: string; short: string }> = {
  contenu: { label: 'Création de contenu', short: 'Contenu' },
  impression: { label: 'Impression personnalisée', short: 'Impression' },
  digital: { label: 'Réseaux sociaux & digital', short: 'Digital' },
  ia: { label: 'IA & automatisation', short: 'IA' },
  immobilier: { label: 'Promoteur et immobilier', short: 'Immobilier' },
};

export const PRESTATIONS: Prestation[] = [
  // ---- Photo & vidéo ----
  { id: 'photo', pole: 'contenu', label: 'Shooting photo', reel: 'Photographe sur place : produits, plats, équipes, lieux, avec retouche.', ia: 'Retouche avancée, détourage et décors générés à partir de vos propres photos.' },
  { id: 'video', pole: 'contenu', label: 'Vidéo de présentation', reel: 'Tournage et montage : votre entreprise, votre lieu, votre produit.', ia: 'Montage à partir de vos images, avec animations, musique et sous-titres, sans tournage.' },
  { id: 'video-courte', pole: 'contenu', label: 'Vidéos courtes (Reels, TikTok, Stories)', reel: 'Tournées sur place et montées au format vertical.', ia: 'Déclinées depuis vos vidéos longues, recadrées et sous-titrées.' },
  { id: 'motion', pole: 'contenu', label: 'Motion design & infographie', reel: 'Logo animé, chiffres clés, schémas et visuels d’information.', ia: 'Variantes de visuels produites en série, validées par un graphiste.' },
  // ---- Présentateurs & voix ----
  { id: 'presentateur', pole: 'contenu', label: 'Présentateur ou présentatrice', reel: 'Un présentateur à l’écran, sur votre lieu, en français, en wolof ou en anglais.', ia: 'Un avatar présentateur qui lit votre texte, sans tournage.' },
  { id: 'voix-off', pole: 'contenu', label: 'Voix off', reel: 'Voix enregistrée par un comédien : français, wolof, anglais.', ia: 'Voix de synthèse en français ou en anglais, pour les mises à jour rapides.' },
  { id: 'script', pole: 'contenu', label: 'Script & storyboard', reel: 'Nous écrivons le texte et découpons les plans avant de tourner.' },
  // ---- Visites 3D & home staging ----
  { id: 'visite-3d', pole: 'contenu', label: 'Visite virtuelle 360°', reel: 'Prise de vue 360° sur place, pièce par pièce, partageable par lien ou QR.', ia: 'Visite construite à partir des plans et de rendus 3D, avant même la construction.' },
  { id: 'plans-3d', pole: 'contenu', label: 'Plans & vues 3D', reel: 'Plans lisibles et vues réalistes des volumes et des aménagements.' },
  { id: 'home-staging', pole: 'contenu', label: 'Home staging', reel: 'Mise en scène avec mobilier et décoration, pour les photos et les visites.', ia: 'Home staging virtuel : les pièces vides sont meublées en image, avec la mention « visuel non contractuel ».' },
  { id: 'photo-interieur', pole: 'contenu', label: 'Photos d’intérieur & d’annonce', reel: 'Grand angle et lumière naturelle, prêtes pour vos annonces et vos plateformes de réservation.', ia: 'Ciel, lumière et rangement corrigés sur vos photos, sans modifier le bien.' },
  // ---- Réseaux sociaux & digital ----
  { id: 'reseaux-sociaux', pole: 'digital', label: 'Gestion des réseaux sociaux', reel: 'Calendrier éditorial, publications, réponses aux messages et rapport mensuel.' },
  { id: 'visuels', pole: 'digital', label: 'Création de visuels', reel: 'Publications, stories, carrousels et bannières à votre charte.' },
  { id: 'fiche-google', pole: 'digital', label: 'Fiche Google', reel: 'Photos, horaires, publications : la fiche que vos clients voient en premier.' },
  { id: 'campagnes', pole: 'digital', label: 'Campagnes sponsorisées', reel: 'Ciblage, visuels et suivi des campagnes sur les réseaux sociaux.' },
  // ---- Impression personnalisée (tout sur devis) ----
  { id: 'kakemono', pole: 'impression', label: 'Kakémonos', reel: 'Roll-up pour l’accueil, le salon ou le bureau de vente.' },
  { id: 'bache', pole: 'impression', label: 'Bâches grand format', reel: 'Façade, chantier, événement : sur mesure, œillets inclus, encres anti-UV.' },
  { id: 'stickers', pole: 'impression', label: 'Stickers & étiquettes', reel: 'Vitrine, produits, réseaux sociaux, QR ou puce NFC.' },
  { id: 'plaques-pvc', pole: 'impression', label: 'Plaques PVC & signalétique', reel: 'Plaques professionnelles, directionnelles, numéros de lots.' },
  { id: 'drapeaux', pole: 'impression', label: 'Drapeaux & beach flags', reel: 'Visibles de loin, en extérieur.' },
  { id: 'enseigne', pole: 'impression', label: 'Enseignes', reel: 'Façade de magasin ou de bureau, lumineuse ou non.' },
  { id: 'panneaux', pole: 'impression', label: 'Panneaux & chevalets', reel: 'Accueil, trottoir, directionnel.' },
  { id: 'vitrophanie', pole: 'impression', label: 'Vitrophanie', reel: 'Lettrage et visuels sur vitres et vitrines.' },
  { id: 'vehicule', pole: 'impression', label: 'Habillage de véhicule', reel: 'Covering total ou partiel, magnétique, lettrage.' },
  { id: 'imprimes', pole: 'impression', label: 'Supports imprimés', reel: 'Flyers, affiches, menus, brochures, catalogues.' },
  { id: 'textile', pole: 'impression', label: 'Textiles personnalisés', reel: 'T-shirts, polos, casquettes, tabliers, sacs : sérigraphie ou transfert.' },
  { id: 'plv', pole: 'impression', label: 'PLV & goodies', reel: 'Présentoirs, totems, mugs, carnets, porte-clés.' },
  // ---- IA & automatisation ----
  { id: 'ia-reponses', pole: 'ia', label: 'Répondre plus vite', reel: 'Réponses préparées aux questions fréquentes, validées par vous avant envoi.' },
  { id: 'ia-relances', pole: 'ia', label: 'Relancer sans oublier', reel: 'Devis, rendez-vous, avis : les relances partent à la bonne date.' },
  { id: 'ia-publication', pole: 'ia', label: 'Publier régulièrement', reel: 'Textes et visuels préparés chaque semaine, publiés après votre validation.' },
  { id: 'ia-demandes', pole: 'ia', label: 'Classer les demandes', reel: 'Formulaire, e-mail, WhatsApp : chaque demande arrive au bon endroit, avec la bonne priorité.' },
  { id: 'ia-traduction', pole: 'ia', label: 'Traduire', reel: 'Français et anglais ; le wolof est toujours relu par un locuteur.' },
  { id: 'ia-integration', pole: 'ia', label: 'Intégration & formation', reel: 'Nous installons les outils dans votre entreprise et formons votre équipe.' },
  // ---- Immobilier (promoteurs et agences) ----
  { id: 'bache-chantier', pole: 'immobilier', label: 'Bâche de chantier connectée', reel: 'Grand format sur la palissade ou la façade, avec un QR qui ouvre la fiche du programme.' },
  { id: 'panneau-programme', pole: 'immobilier', label: 'Panneau de programme connecté', reel: 'Le panneau reste, les lots disponibles se mettent à jour derrière le QR.' },
  { id: 'fiche-programme', pole: 'immobilier', label: 'Fiche programme connectée', reel: 'Lots, surfaces, prix, plans, visite 3D, contact : tout le programme en un scan.' },
  { id: 'suivi-chantier', pole: 'immobilier', label: 'Photos & vidéos d’avancement', reel: 'Chaque mois, le chantier en images pour rassurer les acquéreurs et nourrir vos réseaux.' },
  { id: 'drone', pole: 'immobilier', label: 'Prises de vue aériennes', reel: 'Le programme et son environnement vus du ciel, sous réserve des autorisations de vol.' },
  { id: 'cartes-nfc', pole: 'immobilier', label: 'Cartes NFC des commerciaux', reel: 'Chaque commercial tend sa carte : l’acheteur garde le contact et la fiche du programme.' },
  { id: 'stickers-lots', pole: 'immobilier', label: 'Stickers QR des lots', reel: 'Sur les portes du témoin et au bureau de vente : chaque lot ouvre sa fiche.' },
  { id: 'panneau-immo', pole: 'immobilier', label: 'Panneaux À vendre / À louer connectés', reel: 'Le lien est réattribué dès que le bien est vendu. Aucune réimpression.' },
  { id: 'fiche-agence', pole: 'immobilier', label: 'Fiche agence connectée', reel: 'Jusqu’à 30 biens avec 10 photos chacun, mis à jour depuis votre espace.' },
  { id: 'site-agence', pole: 'immobilier', label: 'Site internet de l’agence', reel: 'Au-delà de 30 biens : création ou refonte du site de l’agence, avec l’ensemble de vos biens.' }, // V6
  { id: 'panneau-accueil', pole: 'immobilier', label: 'Panneau d’accueil des résidences', reel: 'Wi-Fi, règlement, services, avis : jusqu’à huit accès sur un panneau.' },
  { id: 'annonces-location', pole: 'immobilier', label: 'Contenus pour la location', reel: 'Photos, visite 3D et textes prêts pour vos annonces et vos plateformes de réservation.' },
];

export const PRESTA = Object.fromEntries(PRESTATIONS.map((p) => [p.id, p])) as Record<string, Prestation>;

/** Prestations d’un pôle, ou liste d’identifiants → prestations (les id inconnus sont ignorés). */
export const byPole = (pole: Pole): Prestation[] => PRESTATIONS.filter((p) => p.pole === pole);
export const pick = (ids: string[]): Prestation[] => ids.map((id) => PRESTA[id]).filter((p): p is Prestation => Boolean(p));
