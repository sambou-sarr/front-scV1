import { useMemo } from "react";
import { qrMatrix } from "../../../../utils/qr";

/** QR code SVG de la fiche, avec logo optionnel au centre. */
export function QR({
  text,
  logo,
  size = 200,
}: {
  text: string;
  logo?: string;
  size?: number;
}) {
  const m = useMemo(() => qrMatrix(text), [text]);
  if (!m)
    return (
      <div className="qr-fallback" style={{ width: size, height: size }}>
        QR
      </div>
    );
  const q = 4,
    n = m.n + q * 2,
    rects: string[] = [];
  for (let r = 0; r < m.n; r++)
    for (let c = 0; c < m.n; c++)
      if (m.dark(r, c)) rects.push(`M${c + q} ${r + q}h1v1h-1z`);
  const hole = Math.round(m.n * 0.26),
    start = q + Math.floor((m.n - hole) / 2);
  return (
    <svg
      className="qr"
      viewBox={`0 0 ${n} ${n}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code de la fiche"
      shapeRendering="crispEdges"
    >
      <rect width={n} height={n} fill="#fff" />
      <path d={rects.join("")} fill="#0c0c0c" />
      {logo && (
        <>
          <rect
            x={start - 0.5}
            y={start - 0.5}
            width={hole + 1}
            height={hole + 1}
            rx="1.2"
            fill="#fff"
          />
          <image
            href={logo}
            x={start}
            y={start}
            width={hole}
            height={hole}
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      )}
    </svg>
  );
}
