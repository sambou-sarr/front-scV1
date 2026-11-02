import axios, { isAxiosError, InternalAxiosRequestConfig } from "axios";
import { clearSession, getToken } from "./session";
import {
  NETWORK_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
} from "./apiError";

// VITE_API_URL doit contenir la base de l’API, y compris /api (ex. https://api.example.com/api).

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/** Routes d'authentification : appelées sans session, elles n'envoient jamais le jeton. */
const AUTH_ENDPOINTS =
  /^\/?auth\/(admin\/login|login|register|forgot-password|reset-password|verify-email)\b/;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && !AUTH_ENDPOINTS.test(config.url ?? "")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*
  Jeton refusé par le serveur (401) : la session locale est supprimée. Les 5xx et erreurs réseau
  gardent leur AxiosError pour le statut et les traitements métier, mais leur message et leur corps
  sont remplacés par des informations sûres avant d'atteindre les écrans.
*/
api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers?.Authorization
  ) {
    clearSession();
  }
  if (isAxiosError(error)) {
    if (error.response && error.response.status >= 500) {
      error.message = SERVER_ERROR_MESSAGE;
      error.response.data = {
        error: {
          code: "ERREUR_SERVEUR",
          message: SERVER_ERROR_MESSAGE,
        },
      };
    } else if (!error.response) {
      error.message = NETWORK_ERROR_MESSAGE;
    }
  }
  return Promise.reject(error);
});

// API RESPONSE TYPE

export type apiResponse<T> = {
  data: {
    data: T;
    status: number;
    message?: string;
    success?: string;
  };
};
