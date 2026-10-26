import { useEffect, useState } from "react";
import type { DependencyList } from "react";
import { errMsg } from "../../../lib/apiError";

/** Charge des données : [données (null avant la 1re réponse), recharger, message d'erreur]. */
export function useData<T>(
  fn: () => Promise<T>,
  deps: DependencyList = [],
): [T | null, () => void, string | null] {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let on = true;
    setErr(null);
    fn()
      .then(d => on && setData(d))
      .catch((e: unknown) => on && setErr(errMsg(e)));
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return [data, () => setN(x => x + 1), err];
}

/** Valeur retardée (saisie de recherche) : évite un appel API à chaque frappe. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
