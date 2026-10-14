import React, { useEffect, useRef } from "react";
import { LAND_W, LAND_H, LAND_BITS } from "./landmask";
import "./DottedGlobe.css";

const DOT = "#1E293B";
const MARKER = "#F97316";

/* Orange glowing markers (lat, lon, radius scale). */
const MARKERS = [
  { lat: 40.7128, lon: -74.006, s: 1.15 }, // New York
  { lat: -23.5558, lon: -46.6396, s: 0.9 }, // São Paulo
  { lat: 20.5937, lon: 78.9629, s: 1 }, // India
  { lat: 51.5074, lon: -0.1278, s: 0.8 }, // London
];

const toRad = (d) => (d * Math.PI) / 180;

/* Decode the embedded land bitmask into unit vectors. */
const buildLandVectors = () => {
  const bin = atob(LAND_BITS);
  const vecs = [];
  for (let r = 0; r < LAND_H; r++) {
    const lat = toRad(90 - (r + 0.5) * (180 / LAND_H));
    const cLat = Math.cos(lat);
    const z0 = Math.sin(lat);
    for (let c = 0; c < LAND_W; c++) {
      const idx = r * LAND_W + c;
      if (((bin.charCodeAt(idx >> 3) >> (idx & 7)) & 1) === 0) continue;
      const lon = toRad(-180 + (c + 0.5) * (360 / LAND_W));
      vecs.push([cLat * Math.cos(lon), cLat * Math.sin(lon), z0]);
    }
  }
  return vecs;
};

const buildMarkers = () =>
  MARKERS.map((m) => {
    const la = toRad(m.lat);
    const lo = toRad(m.lon);
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la), m.s];
  });

/* Dotted-matrix rotating earth on 2D canvas (no WebGL). */
const DottedGlobe = ({ size = 560 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const staticMode =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.scale(dpr, dpr);

    const land = buildLandVectors();
    const markers = buildMarkers();
    const R = size * 0.42;
    const cx = size / 2;
    const cy = size / 2;
    const TILT = 0.38;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    let yaw = 1.05; // start facing the Americas/Atlantic, like the reference
    let raf = 0;
    let running = true;

    const project = (x0, y0, z0) => {
      const cY = Math.cos(yaw);
      const sY = Math.sin(yaw);
      const X = x0 * cY - y0 * sY;
      const Y = y0 * cY + x0 * sY;
      const sy = Y * cosT - z0 * sinT;
      const sz = Y * sinT + z0 * cosT;
      return [cx + R * X, cy - R * sy, sz];
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      for (let i = 0; i < land.length; i++) {
        const v = land[i];
        const p = project(v[0], v[1], v[2]);
        const z = p[2];
        if (z <= 0.02) continue;
        const s = 0.7 + 1.15 * z;
        ctx.globalAlpha = 0.28 + 0.66 * z;
        ctx.fillStyle = DOT;
        ctx.fillRect(p[0], p[1], s, s);
      }

      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        const p = project(m[0], m[1], m[2]);
        if (p[2] <= 0.05) continue;
        const r = 3.4 * m[3] * (0.6 + 0.5 * p[2]);
        const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 3);
        g.addColorStop(0, "rgba(249,115,22,0.9)");
        g.addColorStop(0.35, "rgba(249,115,22,0.35)");
        g.addColorStop(1, "rgba(249,115,22,0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = MARKER;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (!running) return;
      yaw += 0.0022;
      draw();
      raf = requestAnimationFrame(tick);
    };

    if (staticMode) {
      draw();
      return undefined;
    }

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              const vis = entries[0].isIntersecting;
              if (vis && !running) {
                running = true;
                raf = requestAnimationFrame(tick);
              } else if (!vis && running) {
                running = false;
                cancelAnimationFrame(raf);
              }
            },
            { threshold: 0 }
          )
        : null;

    if (io) io.observe(canvas);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className="dearth-canvas"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export default DottedGlobe;
