export const ENV: Partial<ImportMetaEnv> =
  (typeof import.meta !== "undefined" && import.meta.env) || {};
 