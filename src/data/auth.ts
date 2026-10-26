// Textes des pages Connexion (/connexion) et Inscription (/inscription).
// « À VALIDER » = proposition de rédaction, à relire avant mise en ligne.

import { ENV } from "../lib/env";

// URL de l'API (Node/Express). Vide = même domaine (proxy Vite ou reverse proxy en production).
export const API_URL = (ENV.VITE_API_URL || "").replace(/\/+$/, "");

// Où aller après une connexion réussie (espace client).
export const AFTER_LOGIN = "/espace-client";
/** Page d'arrivée après une connexion administrateur (back-office). */
export const AFTER_ADMIN_LOGIN = "/admin";

export const A_SIDE = {
  back: "Retour au site",
  points: [
    { icon: "i-card", text: "Vos cartes et fiches connectées au même endroit" },
    { icon: "i-chart", text: "Vos statistiques de scans et de clics" },
    { icon: "i-shield", text: "Un accès sécurisé, rien que pour vous" },
  ],
  tag: ["Connecter", "Partager", "Simplifier"],
};

export const A_LOGIN = {
  title: "Connexion",
  label: "Espace client",
  h1: ["Content de", "vous revoir."],
  lead: "Retrouvez vos fiches, vos cartes et vos statistiques.",
  heading: "Se connecter",
  sub: "Entrez vos identifiants pour accéder à votre espace.",
  fields: { email: "Adresse e-mail", password: "Mot de passe" },
  forgot: "Mot de passe oublié ?",
  submit: "Se connecter",
  sending: "Connexion…",
  noAccount: "Pas encore de compte ?",
  create: "Créer un compte",
  errors: {
    email: "Saisissez une adresse e-mail valide.",
    password: "Saisissez votre mot de passe.",
    credentials: "E-mail ou mot de passe incorrect.",
    tooMany: "Trop de tentatives. Réessayez dans quelques minutes.",
    network:
      "Connexion impossible pour le moment. Vérifiez votre réseau et réessayez.",
  },
  meta: "Connectez-vous à votre espace client Support Connecté.",
};

export const A_REGISTER = {
  title: "Créer un compte",
  label: "Espace client",
  h1: ["Créez votre", "espace client."],
  lead: "Gérez vos cartes connectées et vos fiches en quelques minutes.",
  heading: "Créer un compte",
  sub: "Quatre champs, et c’est parti.",
  fields: {
    name: "Nom complet",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirm: "Confirmer le mot de passe",
  },
  rules: {
    length: "8 caractères minimum",
    letter: "Une lettre",
    digit: "Un chiffre",
  },
  submit: "Créer mon compte",
  sending: "Création…",
  haveAccount: "Vous avez déjà un compte ?",
  login: "Se connecter",
  legal: [
    "En créant un compte, vous acceptez les ",
    "mentions légales",
    " et la ",
    "politique de confidentialité",
    ".",
  ],
  errors: {
    name: "Saisissez votre nom (2 caractères minimum).",
    email: "Saisissez une adresse e-mail valide.",
    password:
      "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.",
    confirm: "Les deux mots de passe ne sont pas identiques.",
    exists: "Un compte existe déjà avec cette adresse e-mail.",
    network:
      "Création impossible pour le moment. Vérifiez votre réseau et réessayez.",
  },
  done: {
    title: "Vérifiez votre boîte mail.",
    text: (email: string) =>
      `Nous avons envoyé un lien de confirmation à ${email}. Cliquez dessus pour activer votre compte.`,
    hint: "Pas de message ? Regardez dans les courriers indésirables.",
    login: "Aller à la connexion",
  },
  meta: "Créez votre compte Support Connecté pour gérer vos cartes et fiches connectées.",
};

export const SHOW = "Afficher";
export const HIDE = "Masquer";
