/**
 * Types partagés (barrel). Où trouver quoi :
 *   fiche.ts : modèle de domaine de la fiche (FicheRecord = LA référence) + FICHE_DATA_KEYS
 *   plan.ts  : formules et droits (Plan, FORMULES)
 *   api.ts   : formes brutes du serveur (ApiFicheDetail, ApiFicheSummary), converties par lib/ficheApi.ts
 *   auth.ts  : formulaires de connexion et d'inscription
 */
export * from "./api";
export * from "./auth";
export * from "./fiche";
export * from "./plan";
