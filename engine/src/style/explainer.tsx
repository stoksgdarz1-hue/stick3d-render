// Explainer & layered background components (v5). Logged in rules/ACTION-LIBRARY.md.
import React from "react";
import { Box, Ball, Cyl, CanvasPlane, INK } from "./toon";
import { V3, lerp, clamp } from "./kit";
import { Glow } from "./props";

/**
 * Floating or wall-mounted explainer panel with crisp header, icon/diagram, and animated pop/reveal.
 * Use to explain concepts, mechanisms, or stats clearly inside the 3D scene.
 */
export const HoloCard: React.FC<{
  p: V3;
  s?: [number, number];
  rot?: V3;
  title: string;
  lines: string[];
  accent?: string;
  bg?: string;
  k?: number;
  face?: boolean;
}> = ({ p, s = [3.6, 2.2], rot = [0, 0, 0], title, lines, accent = "#38bdf8", bg = "#0f172a", k = 1, face }) => {
  const sc = clamp(k);
  if (sc <= 0.01) return null;
  return (
    <group position={p} rotation={rot} scale={[sc, sc, sc]}>
      <CanvasPlane
        p={[0, 0, 0]}
        s={s}
        face={face}
        px={[Math.round(s[0] * 220), Math.round(s[1] * 220)]}
        frame={accent}
        draw={(c, W, H) => {
          c.fillStyle = bg;
          c.fillRect(0, 0, W, H);
          // Subtle tech grid
          c.strokeStyle = "rgba(255,255,255,0.06)";
          c.lineWidth = 2;
          for (let x = 40; x < W; x += 48) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
          for (let y = 40; y < H; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
          // Header bar
          c.fillStyle = accent;
          c.fillRect(0, 0, W, H * 0.24);
          c.fillStyle = "#0b0d1a";
          c.font = `900 ${Math.round(H * 0.12)}px Inter, Arial`;
          c.textAlign = "left";
          c.textBaseline = "middle";
          c.fillText(title.toUpperCase(), 24, H * 0.125);
          // Bullet lines
          c.fillStyle = "#f8fafc";
          c.font = `700 ${Math.round(H * 0.095)}px Inter, Arial`;
          lines.forEach((ln, idx) => {
            const yy = H * 0.4 + idx * (H * 0.2);
            c.fillStyle = accent;
            c.beginPath();
            c.arc(34, yy, H * 0.03, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#f8fafc";
            c.fillText(ln, 58, yy + 2);
          });
        }}
      />
    </group>
  );
};

/**
 * 3D Callout pin: glowing anchor dot -> angled leader line -> crisp label pill.
 * Great for pointing out specific details in the scene.
 */
export const Callout: React.FC<{
  from: V3;
  to: V3;
  label: string;
  accent?: string;
  k?: number;
}> = ({ from, to, label, accent = "#fbbf24", k = 1 }) => {
  const u = clamp(k);
  if (u <= 0.01) return null;
  const tip: V3 = [lerp(from[0], to[0], u), lerp(from[1], to[1], u), lerp(from[2], to[2], u)];
  const dx = tip[0] - from[0], dy = tip[1] - from[1], dz = tip[2] - from[2];
  const len = Math.hypot(dx, dy, dz) || 0.01;
  const mid: V3 = [(from[0] + tip[0]) / 2, (from[1] + tip[1]) / 2, (from[2] + tip[2]) / 2];
  const rz = -Math.atan2(dx, dy);
  return (
    <group>
      <Ball p={from} r={0.09} color={accent} ink={0.03} />
      <Glow p={from} r={0.35} color={accent} o={0.55} />
      <Cyl p={mid} rt={0.025} h={len} color={accent} line={1} rot={[0, 0, rz]} />
      {u > 0.7 ? (
        <CanvasPlane
          p={[to[0], to[1] + 0.28, to[2]]}
          s={[Math.max(1.8, label.length * 0.16), 0.52]}
          px={[440, 120]}
          face
          frame={INK}
          draw={(c, W, H) => {
            c.fillStyle = accent;
            c.fillRect(0, 0, W, H);
            c.fillStyle = INK;
            c.font = "900 54px Inter, Arial";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(label, W / 2, H / 2 + 2);
          }}
        />
      ) : null}
    </group>
  );
};

/**
 * Animated comparison / percentage meter inside the 3D world.
 */
export const StatMeter: React.FC<{
  p: V3;
  s?: [number, number];
  label: string;
  value: number; // 0..1
  color?: string;
  rot?: V3;
  face?: boolean;
}> = ({ p, s = [3.2, 0.95], label, value, color = "#22c55e", rot = [0, 0, 0], face }) => (
  <CanvasPlane
    p={p}
    s={s}
    rot={rot}
    face={face}
    px={[560, 170]}
    frame={INK}
    draw={(c, W, H) => {
      c.fillStyle = "#111827";
      c.fillRect(0, 0, W, H);
      c.fillStyle = "#e2e8f0";
      c.font = "800 38px Inter, Arial";
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.fillText(label, 24, H * 0.3);
      c.fillStyle = color;
      c.textAlign = "right";
      c.fillText(`${Math.round(clamp(value) * 100)}%`, W - 24, H * 0.3);
      c.fillStyle = "#1e293b";
      c.fillRect(24, H * 0.56, W - 48, H * 0.28);
      c.fillStyle = color;
      c.fillRect(24, H * 0.56, (W - 48) * clamp(value), H * 0.28);
      c.strokeStyle = "#f8fafc";
      c.lineWidth = 3;
      c.strokeRect(24, H * 0.56, W - 48, H * 0.28);
    }}
  />
);

/**
 * Animated glowing pulse travelling along a parabolic/curved arc from A to B.
 */
export const SignalArc: React.FC<{
  from: V3;
  to: V3;
  arcH?: number;
  t: number;
  speed?: number;
  color?: string;
  pulses?: number;
}> = ({ from, to, arcH = 1.2, t, speed = 1.4, color = "#38bdf8", pulses = 3 }) => (
  <group>
    {Array.from({ length: 12 }, (_, i) => {
      const u = i / 11;
      const x = lerp(from[0], to[0], u);
      const y = lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * arcH;
      const z = lerp(from[2], to[2], u);
      return <Ball key={"n" + i} p={[x, y, z]} r={0.04} color="rgba(255,255,255,0.45)" ink={0.01} />;
    })}
    {Array.from({ length: pulses }, (_, i) => {
      const u = (t * speed + i / pulses) % 1;
      const x = lerp(from[0], to[0], u);
      const y = lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * arcH;
      const z = lerp(from[2], to[2], u);
      return (
        <React.Fragment key={"p" + i}>
          <Ball p={[x, y, z]} r={0.11} color={color} ink={0.02} />
          <Glow p={[x, y, z]} r={0.45} color={color} o={0.7} />
        </React.Fragment>
      );
    })}
  </group>
);

/**
 * Multi-layer exterior street/skyline backdrop for placing behind glass doors or open doorways.
 * Eliminates empty flat gradients outside doorways.
 */
export const StreetBackdrop: React.FC<{
  p?: V3;
  s?: [number, number];
  dusk?: boolean;
}> = ({ p = [0, 3.6, -12], s = [18, 9], dusk = false }) => (
  <group position={p}>
    <CanvasPlane
      p={[0, 0, 0]}
      s={s}
      px={[900, 450]}
      draw={(c, W, H) => {
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, dusk ? "#1e1b4b" : "#38bdf8");
        g.addColorStop(0.65, dusk ? "#f97316" : "#bae6fd");
        g.addColorStop(1, dusk ? "#fbbf24" : "#e0f2fe");
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
        // Far skyline
        for (let i = 0; i < 12; i++) {
          const bw = W / 10;
          const bh = H * (0.28 + ((i * 31) % 35) / 100);
          c.fillStyle = dusk ? "#312e81" : "#93c5fd";
          c.fillRect(i * bw * 0.88 - 10, H * 0.78 - bh, bw, bh);
        }
        // Mid buildings with lit windows
        for (let i = 0; i < 9; i++) {
          const bw = W / 8;
          const bh = H * (0.36 + ((i * 47) % 38) / 100);
          const bx = i * bw * 0.94 - 15;
          const by = H * 0.82 - bh;
          c.fillStyle = dusk ? "#1e293b" : "#475569";
          c.fillRect(bx, by, bw - 8, bh);
          c.fillStyle = dusk ? "#fde047" : "#e2e8f0";
          for (let yy = by + 16; yy < H * 0.78; yy += 24) {
            for (let xx = bx + 12; xx < bx + bw - 22; xx += 20) {
              if (((xx * 3 + yy * 7) | 0) % 4 > 0) c.fillRect(xx, yy, 10, 14);
            }
          }
        }
        // Sidewalk + road strip
        c.fillStyle = dusk ? "#334155" : "#94a3b8";
        c.fillRect(0, H * 0.8, W, H * 0.2);
        c.fillStyle = dusk ? "#1e293b" : "#64748b";
        c.fillRect(0, H * 0.88, W, H * 0.12);
      }}
    />
    {/* Foreground exterior trees/lamp silhouettes for parallax */}
    <Cyl p={[-3.2, -1.8, 1.2]} rt={0.14} h={2.8} color="#4a3525" line={2} />
    <Ball p={[-3.2, -0.2, 1.2]} r={0.85} color="#2d9c54" />
    <Cyl p={[3.4, -1.8, 1.5]} rt={0.14} h={2.6} color="#4a3525" line={2} />
    <Ball p={[3.4, -0.3, 1.5]} r={0.78} color="#36b362" />
    <Box p={[0, -3.55, 1.0]} s={[s[0], 0.2, 2.5]} color="#94a3b8" line={2} />
  </group>
);
