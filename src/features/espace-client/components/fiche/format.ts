import type { BienData as Bien, FicheRecord } from "../../../../types";

/** Petits formateurs partagés par les vues de la fiche. */
export const initials = (f: FicheRecord) =>
  `${(f.prenom || "")[0] || ""}${(f.nom || "")[0] || ""}`.toUpperCase() || "SC";
export const today = () =>
  ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][
    new Date().getDay()
  ];
export const wa = (num: string, msg?: string) =>
  `https://wa.me/${(num || "").replace(/\D/g, "")}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;
export const fcfa = (p?: string) =>
  p ? `${new Intl.NumberFormat("fr-FR").format(Number(p))} FCFA` : "";

export const prixBien = (b: Bien) =>
  b.prix
    ? `${new Intl.NumberFormat("fr-FR").format(Number(b.prix))} FCFA${b.type === "location" ? ` / ${b.periode || "mois"}` : ""}`
    : "Prix sur demande";
