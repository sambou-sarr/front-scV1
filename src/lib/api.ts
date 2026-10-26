import axios, { isAxiosError, InternalAxiosRequestConfig } from "axios";
import { clearSession, getToken } from "./session";

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
  Jeton refusé par le serveur (401) : la session locale est supprimée. Le garde <RequireAuth> réagit au
  changement et renvoie vers /login ; les appelants gardent l'AxiosError d'origine (le format serveur
  { error: { code, message } } reste lisible par toFicheError, uploadErrorMessage…).
*/
api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers?.Authorization
  ) {
    clearSession();
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
