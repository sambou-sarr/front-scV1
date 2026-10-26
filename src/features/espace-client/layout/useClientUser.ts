import { useOutletContext } from "react-router-dom";
import type { SessionUser } from "../../../lib/session";

export type ClientUser = SessionUser;

/** Utilisateur connecté, fourni par ClientLayout à toutes les pages de l'espace client. */
export const useClientUser = () =>
  useOutletContext<{ user: ClientUser }>().user;
