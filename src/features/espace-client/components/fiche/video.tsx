import { useState } from "react";
import { I } from "./Icon";

/** Lecture des vidéos : détection de la source (fichier, YouTube…) et lecteur. */
export type VideoSource =
  | { kind: "embed"; src: string; vertical?: boolean }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

/** Reconnaît YouTube / Vimeo / TikTok (lecteur intégré), les fichiers vidéo directs, sinon un simple lien. */
export function videoSourceOf(raw: string): VideoSource | null {
  const url = raw.trim();
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null; // jamais javascript: / data:
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const seg = u.pathname.split("/").filter(Boolean);

  let yt: string | null = null;
  if (host === "youtu.be") yt = seg[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") yt = u.searchParams.get("v");
    else if (["shorts", "embed", "live"].includes(seg[0])) yt = seg[1] ?? null;
  }
  if (yt && /^[\w-]{6,20}$/.test(yt))
    return {
      kind: "embed",
      src: `https://www.youtube-nocookie.com/embed/${yt}`,
      vertical: seg[0] === "shorts",
    };

  if (host === "vimeo.com") {
    const id = seg.find(x => /^\d+$/.test(x));
    if (id)
      return { kind: "embed", src: `https://player.vimeo.com/video/${id}` };
  }
  if (
    host === "player.vimeo.com" &&
    seg[0] === "video" &&
    /^\d+$/.test(seg[1] ?? "")
  )
    return { kind: "embed", src: url };

  if (host === "tiktok.com") {
    const i = seg.indexOf("video");
    if (i >= 0 && /^\d+$/.test(seg[i + 1] ?? ""))
      return {
        kind: "embed",
        src: `https://www.tiktok.com/embed/v2/${seg[i + 1]}`,
        vertical: true,
      };
  }

  if (
    /\.(mp4|webm|mov|m4v)$/i.test(u.pathname) ||
    u.pathname.includes("/api/media/")
  )
    return { kind: "file", src: url };
  return { kind: "link", src: url };
}

export function VideoItem({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const v = videoSourceOf(url);
  if (!v) return null;
  if (v.kind === "embed")
    return (
      <div className={`f-vid${v.vertical ? " v" : ""}`}>
        <iframe
          src={v.src}
          title="Vidéo"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  if (v.kind === "file" && !failed)
    return (
      <div className="f-vid">
        <video
          src={v.src}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      </div>
    );
  return (
    <a className="f-vid-link" href={v.src} target="_blank" rel="noreferrer">
      {failed
        ? "La vidéo ne peut pas être lue ici — l’ouvrir"
        : "Voir la vidéo"}
      <I n="arrow" s={14} />
    </a>
  );
}
