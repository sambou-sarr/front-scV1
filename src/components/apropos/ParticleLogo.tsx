import { useEffect, useRef } from 'react';

/*
  Le symbole S officiel recomposé en « modules » de QR code (Canvas 2D).
  Les pixels du logo sont échantillonnés, chaque module rejoint sa place avec un ressort,
  s'écarte sous le doigt ou la souris, puis revient. Respiration légère au repos.
  Pause automatique hors écran (IntersectionObserver). Mouvement réduit : image fixe.
*/
interface Particle { tx: number; ty: number; x: number; y: number; vx: number; vy: number; c: string; s: number; ph: number }

export default function ParticleLogo({ src = '/images/symbole-s.webp', className = '' }: { src?: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null), cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current!, c = cv.current!, ctx = c.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let parts: Particle[] = [], raf = 0, visible = true, W = 0, H = 0, dpr = 1, t0 = performance.now();
    const ptr = { x: -9999, y: -9999, on: false };
    const img = new Image(); img.src = src;

    const build = () => {
      const r = box.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.min(W * .78 / img.width, H * .78 / img.height);
      const iw = Math.round(img.width * scale), ih = Math.round(img.height * scale);
      const off = document.createElement('canvas'); off.width = iw; off.height = ih;
      const o = off.getContext('2d')!; o.drawImage(img, 0, 0, iw, ih);
      const data = o.getImageData(0, 0, iw, ih).data;
      const gap = W < 420 ? 5 : 6, ox = (W - iw) / 2, oy = (H - ih) / 2;
      const old = parts; parts = [];
      for (let y = 0; y < ih; y += gap) for (let x = 0; x < iw; x += gap) {
        const k = (y * iw + x) * 4;
        if (data[k + 3] > 140) {
          const prev = old[parts.length];
          const a = Math.random() * Math.PI * 2, d = Math.max(W, H) * (.6 + Math.random() * .4);
          parts.push({
            tx: ox + x, ty: oy + y,
            x: prev ? prev.x : (reduce ? ox + x : W / 2 + Math.cos(a) * d), y: prev ? prev.y : (reduce ? oy + y : H / 2 + Math.sin(a) * d),
            vx: 0, vy: 0, c: `rgb(${data[k]},${data[k + 1]},${data[k + 2]})`, s: gap * .72, ph: Math.random() * 6.28,
          });
        }
      }
    };

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (!reduce) {
          const bx = p.tx + Math.sin(t * 1.2 + p.ph) * .6, by = p.ty + Math.cos(t * 1.1 + p.ph) * .6;
          p.vx += (bx - p.x) * .055; p.vy += (by - p.y) * .055;
          if (ptr.on) {
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy, R = 70;
            if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (R - d) / R * 6; p.vx += dx / d * f; p.vy += dy / d * f; }
          }
          p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    };
    const loop = (now: number) => { draw(now); raf = visible && !reduce ? requestAnimationFrame(loop) : 0; };
    const start = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; };
    const leave = () => { ptr.on = false; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    const ro = new ResizeObserver(() => { if (img.complete && img.naturalWidth) { build(); if (reduce) draw(performance.now()); } });

    img.onload = () => { build(); if (reduce) draw(performance.now()); else start(); ro.observe(box); io.observe(box); };
    c.addEventListener('pointermove', move); c.addEventListener('pointerleave', leave); c.addEventListener('pointerup', leave);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); c.removeEventListener('pointermove', move); c.removeEventListener('pointerleave', leave); c.removeEventListener('pointerup', leave); };
  }, [src]);

  return <div className={`plogo ${className}`} ref={wrap}><canvas ref={cv} aria-hidden="true" /></div>;
}
