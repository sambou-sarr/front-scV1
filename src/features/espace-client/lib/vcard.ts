// « Enregistrer le contact » : fiche vCard 3.0 téléchargée (reconnue par iPhone et Android)
import type { FicheRecord } from "../../../types";

export function downloadVCard(f: FicheRecord, url: string) {
  const esc = (s = "") => String(s).replace(/([,;\\])/g, "\\$1");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(f.nom)};${esc(f.prenom)};;;`,
    `FN:${esc(`${f.prenom} ${f.nom}`.trim())}`,
    f.entreprise && `ORG:${esc(f.entreprise)}`,
    f.fonction && `TITLE:${esc(f.fonction)}`,
    f.telephone && `TEL;TYPE=CELL:${f.telephone}`,
    f.email && `EMAIL:${f.email}`,
    f.site && `URL:${f.site}`,
    url && `URL:${url}`,
    f.adresse && `ADR:;;${esc(f.adresse)};;;;`,
    "END:VCARD",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], {
    type: "text/vcard;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${f.prenom}-${f.nom}.vcf`.replace(/\s+/g, "-");
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
