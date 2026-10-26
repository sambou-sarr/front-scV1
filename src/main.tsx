import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { getSession, subscribeSession } from "./lib/session";
import "./styles/global.css";
const queryClient = new QueryClient();

// À la déconnexion (ou au refus du jeton), on vide le cache : le compte suivant ne doit pas voir les données du précédent.
subscribeSession(() => {
  if (!getSession()) queryClient.clear();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);
