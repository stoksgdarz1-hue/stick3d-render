import React from "react";
import * as THREE from "three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "./toon";
import { V3 } from "./kit";

export const Floor: React.FC<{ kind: "plank" | "tile" | "carpet" | "marble" | "slate" | "concrete"; a: string; b: string; w?: number; d?: number; unit?: number }> = ({ kind, a, b, w = 24, d = 24, unit = 2.2 }) => (
  <Surface p={[0, 0, -2]} s={[w, d]} rot={[-Math.PI / 2, 0, 0]} kind={kind} a={a} b={b} unit={unit} />
);

// Back wall with a real doorway hole (so characters can walk THROUGH it). Wall spans x:[-W/2,W/2], y:[0,9].
export const WallDoor: React.FC<{ z: number; W: number; kind: "brick" | "wood" | "plain" | "wainscot" | "concrete" | "slate"; a: string; b: string; door?: { x: number; w: number; h: number }; unit?: number; base?: string; crown?: string; wainscot?: [string, string]; ceiling?: string }> = ({ z, W, kind, a, b, door, unit = 1.6, base, crown, wainscot, ceiling }) => {
  const H = 9;
  const pieces: [number, number, number, number][] = [];
  if (!door) pieces.push([-W / 2, W / 2, 0, H]); else {
    const l = door.x - door.w / 2 - 0.25, r = door.x + door.w / 2 + 0.25;
    pieces.push([-W / 2, l, 0, H], [r, W / 2, 0, H], [l, r, door.h + 0.3, H]);
  }
  return (<>
    {pieces.map(([x0, x1, y0, y1], i) => <Surface key={i} p={[(x0 + x1) / 2, (y0 + y1) / 2, z]} s={[x1 - x0, y1 - y0]} kind={kind} a={a} b={b} unit={unit} />)}
    {wainscot ? pieces.slice(0, door ? 2 : 1).map(([x0, x1], i) => <React.Fragment key={"w" + i}>
      <Surface p={[(x0 + x1) / 2, 1.15, z + 0.02]} s={[x1 - x0, 2.3]} kind="wainscot" a={wainscot[0]} b={wainscot[1]} unit={1.8} />
      <Box p={[(x0 + x1) / 2, 2.34, z + 0.06]} s={[x1 - x0, 0.14, 0.14]} color={base ?? wainscot[0]} line={2} />
    </React.Fragment>) : null}
    {base ? pieces.slice(0, door ? 2 : 1).map(([x0, x1], i) => <Box key={"b" + i} p={[(x0 + x1) / 2, 0.22, z + 0.06]} s={[x1 - x0, 0.44, 0.14]} color={base} line={3} />) : null}
    {crown ? <Box p={[0, H - 0.2, z + 0.08]} s={[W, 0.4, 0.18]} color={crown} line={3} /> : null}
    {ceiling ? <Surface p={[0, H, -2]} s={[W, 24]} rot={[Math.PI / 2, 0, 0]} kind="plain" a={ceiling} b={ceiling} unit={4} /> : null}
  </>);
};

export const SideWall: React.FC<{ x: number; kind: "brick" | "wood" | "plain" | "wainscot" | "concrete" | "slate"; a: string; b: string; d?: number; unit?: number; base?: string; crown?: string }> = ({ x, kind, a, b, d = 24, unit = 1.6, base, crown }) => (
  <>
    <Surface p={[x, 4.5, -2]} s={[d, 9]} rot={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} kind={kind} a={a} b={b} unit={unit} />
    {base ? <Box p={[x + (x < 0 ? 0.06 : -0.06), 0.22, -2]} s={[0.14, 0.44, d]} color={base} line={2} /> : null}
    {crown ? <Box p={[x + (x < 0 ? 0.08 : -0.08), 8.8, -2]} s={[0.18, 0.4, d]} color={crown} line={2} /> : null}
  </>
);

export const Ceiling: React.FC<{ y?: number; w?: number; d?: number; color?: string; beams?: string; beamCount?: number }> = ({ y = 9, w = 24, d = 24, color = "#e9e2d6", beams, beamCount = 4 }) => (
  <group>
    <Surface p={[0, y, -2]} s={[w, d]} rot={[Math.PI / 2, 0, 0]} kind="plain" a={color} b={color} unit={4} />
    {beams ? Array.from({ length: beamCount }, (_, i) => {
      const bz = -d / 2 + (i + 0.5) * (d / beamCount) - 2;
      return <Box key={i} p={[0, y - 0.18, bz]} s={[w, 0.36, 0.45]} color={beams} line={3} />;
    }) : null}
  </group>
);

export const CornerPillar: React.FC<{ p: V3; h?: number; w?: number; color?: string; trim?: string }> = ({ p, h = 9, w = 0.6, color = "#dcd4c8", trim }) => (
  <group position={p}>
    <Box p={[0, h / 2, 0]} s={[w, h, w]} color={color} line={3} />
    <Box p={[0, 0.22, 0]} s={[w + 0.12, 0.44, w + 0.12]} color={trim ?? color} line={2} />
    <Box p={[0, h - 0.22, 0]} s={[w + 0.12, 0.44, w + 0.12]} color={trim ?? color} line={2} />
  </group>
);

export const PropShadow: React.FC<{ p: V3; s: [number, number]; o?: number }> = ({ p, s, o = 0.32 }) => {
  const tex = React.useMemo(() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 128; const g = c.getContext("2d")!;
    const rg = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    rg.addColorStop(0, `rgba(0,0,0,${o})`); rg.addColorStop(0.7, `rgba(0,0,0,${o * 0.45})`); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, [o]);
  return <mesh position={[p[0], p[1] + 0.015, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={s} /><meshBasicMaterial map={tex} transparent depthWrite={false} /></mesh>;
};

export const Glow: React.FC<{ p: V3; r: number; color: string; o?: number }> = ({ p, r, color, o = 0.6 }) => (
  <CanvasPlane p={p} s={[r * 2, r * 2]} px={[128, 128]} face additive draw={(c, W, H) => { c.clearRect(0, 0, W, H); const g = c.createRadialGradient(W / 2, H / 2, 2, W / 2, H / 2, W / 2); g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)"); c.globalAlpha = o; c.fillStyle = g; c.fillRect(0, 0, W, H); }} />
);
export const Shaft: React.FC<{ p: V3; s: [number, number]; rot?: V3; color?: string; o?: number }> = ({ p, s, rot, color = "255,236,150", o = 0.28 }) => (
  <CanvasPlane p={p} s={s} rot={rot} px={[64, 256]} additive draw={(c, W, H) => { c.clearRect(0, 0, W, H); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(${color},${o})`); g.addColorStop(1, `rgba(${color},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H); const g2 = c.createLinearGradient(0, 0, W, 0); g2.addColorStop(0, "rgba(0,0,0,1)"); g2.addColorStop(0.5, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,1)"); c.globalCompositeOperation = "destination-out"; c.globalAlpha = 0.7; c.fillStyle = g2; c.fillRect(0, 0, W, H); }} />
);

export const Plant: React.FC<{ p: V3; s?: number; pot?: string }> = ({ p, s = 1, pot = "#c0643a" }) => (
  <group position={p} scale={s}>
    <PropShadow p={[0, 0, 0]} s={[1.1, 1.1]} o={0.35} />
    <Cyl p={[0, 0.34, 0]} rt={0.42} rb={0.3} h={0.68} color={pot} />
    <Cyl p={[0, 0.68, 0]} rt={0.46} rb={0.43} h={0.12} color={pot} line={2} />
    <Cyl p={[0, 0.72, 0]} rt={0.39} rb={0.39} h={0.05} color="#3b2618" line={1} />
    <Cyl p={[0, 1.05, 0]} rt={0.04} rb={0.06} h={0.7} color="#287a44" line={2} />
    {[
      { pos: [-0.32, 1.08, 0.16] as V3, rot: [0.3, 0.4, 0.65] as V3, col: "#35b060", sc: [0.42, 0.06, 0.24] as V3 },
      { pos: [0.34, 1.12, 0.12] as V3, rot: [0.25, -0.35, -0.6] as V3, col: "#43c46e", sc: [0.44, 0.06, 0.25] as V3 },
      { pos: [0.05, 1.24, -0.32] as V3, rot: [-0.6, 0.1, 0.15] as V3, col: "#2c9c54", sc: [0.26, 0.06, 0.42] as V3 },
      { pos: [-0.08, 1.38, 0.28] as V3, rot: [0.55, -0.2, -0.1] as V3, col: "#4ed17c", sc: [0.24, 0.06, 0.38] as V3 },
      { pos: [0.24, 1.48, -0.14] as V3, rot: [-0.35, -0.5, -0.45] as V3, col: "#3bc068", sc: [0.36, 0.06, 0.22] as V3 },
      { pos: [-0.22, 1.52, -0.12] as V3, rot: [-0.3, 0.45, 0.48] as V3, col: "#57dc86", sc: [0.34, 0.06, 0.2] as V3 },
    ].map((lf, i) => (
      <group key={i} position={lf.pos} rotation={lf.rot}>
        <Box p={[0, 0, 0]} s={lf.sc} color={lf.col} line={2} />
      </group>
    ))}
    <Ball p={[0, 1.56, 0]} r={0.18} color="#4ed17c" ink={0.04} />
  </group>
);
export const Shelf: React.FC<{ p: V3; w?: number; rows?: number; seed?: number; wood?: string }> = ({ p, w = 3, rows = 4, seed = 1, wood = "#7a4a2a" }) => {
  const cols = ["#d94a4a", "#3a6fd8", "#e5b43a", "#2f9e6a", "#7a54d6", "#e0743a", "#f2f2f2", "#2b3350"];
  return (<group position={p}>
    <PropShadow p={[0, 0, 0.05]} s={[w + 0.3, 1.0]} o={0.3} />
    <Box p={[0, rows * 0.55 + 0.07, -0.1]} s={[w, rows * 1.1 + 0.15, 0.5]} color={wood} />
    <Box p={[0, rows * 1.1 + 0.18, 0.02]} s={[w + 0.14, 0.1, 0.78]} color={wood} line={2} />
    {Array.from({ length: rows }, (_, r) => {
      let x = -w / 2 + 0.22, i = 0;
      const items: React.ReactNode[] = [
        <Box key={"ledge" + r} p={[0, r * 1.1 + 0.11, 0.04]} s={[w - 0.06, 0.09, 0.74]} color={wood} line={2} />,
      ];
      while (x < w / 2 - 0.36) {
        const bw = 0.13 + ((seed * 7 + r * 13 + i * 5) % 5) * 0.032;
        const bh = 0.62 + ((seed * 3 + r * 11 + i * 7) % 4) * 0.1;
        const col = cols[(seed + r * 3 + i) % cols.length];
        const lean = (i === 4 && r % 2 === 1) ? 0.16 : 0;
        items.push(
          <group key={i} position={[x + bw / 2, r * 1.1 + 0.16 + bh / 2, 0.16]} rotation={[0, 0, lean]}>
            <Box p={[0, 0, 0]} s={[bw, bh, 0.45]} color={col} line={2} />
            <Box p={[0, bh * 0.22, 0.235]} s={[bw * 0.72, 0.06, 0.02]} color="#fff5d6" line={1} />
          </group>
        );
        x += bw + (lean ? 0.08 : 0.02); i++;
      }
      return <React.Fragment key={r}>{items}</React.Fragment>;
    })}
  </group>);
};
export const Frame: React.FC<{ p: V3; s: [number, number]; art?: number; rot?: V3; frameColor?: string }> = ({ p, s, art = 0, rot, frameColor = "#e8c06a" }) => (
  <CanvasPlane p={p} s={s} rot={rot} px={[Math.round(s[0] * 220), Math.round(s[1] * 220)]} frame={frameColor} draw={(c, W, H) => {
    const pal = [["#8ed0ff", "#ffd36a", "#3a9e6a"], ["#ffb38a", "#7a54d6", "#2b3350"], ["#bfe9ff", "#e5483f", "#1d2f66"]][art % 3];
    c.fillStyle = "#faf6ec"; c.fillRect(0, 0, W, H);
    const pad = Math.min(W, H) * 0.11;
    c.strokeStyle = "#cfc6b4"; c.lineWidth = 4; c.strokeRect(pad, pad, W - pad * 2, H - pad * 2);
    c.save(); c.beginPath(); c.rect(pad, pad, W - pad * 2, H - pad * 2); c.clip();
    c.fillStyle = pal[0]; c.fillRect(pad, pad, W - pad * 2, H - pad * 2);
    c.fillStyle = pal[1]; c.beginPath(); c.arc(W * 0.68, H * 0.34, H * 0.14, 0, 7); c.fill();
    c.fillStyle = pal[2]; c.beginPath(); c.moveTo(0, H); c.lineTo(W * 0.36, H * 0.44); c.lineTo(W * 0.62, H * 0.73); c.lineTo(W * 0.82, H * 0.56); c.lineTo(W, H); c.fill();
    c.fillStyle = "rgba(255,255,255,0.18)"; c.beginPath(); c.moveTo(0, 0); c.lineTo(W * 0.35, 0); c.lineTo(0, H * 0.55); c.closePath(); c.fill();
    c.restore();
  }} />
);
export const WindowCity: React.FC<{ p: V3; s: [number, number]; dusk?: boolean; sill?: string }> = ({ p, s, dusk, sill = "#e8e0d2" }) => (
  <group>
    <CanvasPlane p={p} s={s} px={[Math.round(s[0] * 180), Math.round(s[1] * 180)]} frame="#2b3350" draw={(c, W, H) => {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dusk ? "#1f2466" : "#3c9af5"); g.addColorStop(1, dusk ? "#ff9857" : "#d8f0ff"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (dusk) {
        c.fillStyle = "#fff6c2"; for (let i = 0; i < 16; i++) { c.beginPath(); c.arc(((i * 97) % W), ((i * 53) % (H * 0.45)), 2 + (i % 2), 0, 7); c.fill(); }
      } else {
        c.fillStyle = "rgba(255,255,255,0.75)"; c.beginPath(); c.arc(W * 0.25, H * 0.24, H * 0.08, 0, 7); c.arc(W * 0.33, H * 0.22, H * 0.1, 0, 7); c.arc(W * 0.42, H * 0.25, H * 0.07, 0, 7); c.fill();
      }
      for (let i = 0; i < 7; i++) { const bw = W / 6, bh = H * (0.28 + ((i * 43) % 30) / 100), x = i * bw * 0.9 - 6; c.fillStyle = dusk ? "#252c68" : "#7fa3e0"; c.fillRect(x, H - bh, bw, bh); }
      for (let i = 0; i < 9; i++) {
        const bw = W / 8, bh = H * (0.34 + ((i * 37) % 45) / 100), x = i * bw * 0.95 - 10;
        c.fillStyle = dusk ? "#141a46" : "#4b6db0"; c.fillRect(x, H - bh, bw, bh);
        if (i % 3 === 0) c.fillRect(x + bw * 0.35, H - bh - 16, bw * 0.3, 16);
        c.fillStyle = dusk ? "#ffd36a" : "#e3f2ff";
        for (let yy = H - bh + 10; yy < H - 8; yy += 18) for (let xx = x + 6; xx < x + bw - 8; xx += 14) if (((xx * 7 + yy * 3) | 0) % 5 > 1) c.fillRect(xx, yy, 6, 8);
      }
      c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
    }} />
    <Box p={[p[0], p[1] - s[1] / 2 - 0.1, p[2] + 0.12]} s={[s[0] + 0.34, 0.14, 0.32]} color={sill} line={3} />
  </group>
);
export const Lamp: React.FC<{ p: V3; h?: number; color?: string }> = ({ p, h = 2.6, color = "#ffe9a8" }) => (
  <group position={p}>
    <PropShadow p={[0, 0, 0]} s={[0.85, 0.85]} o={0.3} />
    <Cyl p={[0, 0.08, 0]} rt={0.35} h={0.16} color="#2b3350" />
    <Cyl p={[0, h / 2, 0]} rt={0.05} h={h} color="#8c92a8" line={2} />
    <Cyl p={[0, h + 0.1, 0]} rt={0.3} rb={0.52} h={0.62} color={color} />
    <Glow p={[0, h + 0.02, 0.15]} r={1.0} color="rgba(255,232,160,0.9)" o={0.35} />
  </group>
);
export const PendantLamp: React.FC<{ p: V3; drop?: number; color?: string; glow?: boolean }> = ({ p, drop = 1.6, color = "#f4b942", glow = true }) => (
  <group position={p}>
    <Cyl p={[0, drop / 2, 0]} rt={0.03} h={drop} color={INK} line={1} />
    <Cyl p={[0, 0.14, 0]} rt={0.16} rb={0.48} h={0.32} color={color} line={3} />
    <Ball p={[0, -0.02, 0]} r={0.13} color="#fff6c8" ink={0.02} />
    {glow ? <Glow p={[0, -0.05, 0]} r={1.25} color="rgba(255,235,165,0.9)" o={0.42} /> : null}
  </group>
);
export const WallSconce: React.FC<{ p: V3; color?: string }> = ({ p, color = "#ffd984" }) => (
  <group position={p}>
    <Box p={[0, 0, 0]} s={[0.24, 0.42, 0.08]} color="#2b3350" line={2} />
    <Cyl p={[0, 0.12, 0.16]} rt={0.18} rb={0.1} h={0.28} color={color} line={2} />
    <Glow p={[0, 0.2, 0.24]} r={0.95} color="rgba(255,226,145,0.85)" o={0.38} />
  </group>
);
export const Monitor: React.FC<{ p: V3; rot?: V3; s?: number; screen?: string }> = ({ p, rot, s = 1, screen = "#1c2a5a" }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box p={[0, 0.07, 0]} s={[0.52, 0.06, 0.42]} color="#2b3350" line={2} />
    <Box p={[0, 0.3, 0]} s={[0.1, 0.4, 0.1]} color="#2b3350" line={2} />
    <Box p={[0, 0.78, 0]} s={[1.2, 0.74, 0.08]} color="#1b1f33" line={3} />
    <Box p={[0, 0.78, 0.05]} s={[1.08, 0.62, 0.02]} color={screen} line={1} />
    <Box p={[0, 0.04, 0.42]} s={[0.72, 0.04, 0.24]} color="#d7dce8" line={2} />
  </group>
);
export const Chair: React.FC<{ p: V3; rotY?: number; color?: string }> = ({ p, rotY = 0, color = "#3b4a8a" }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <PropShadow p={[0, 0, 0]} s={[1.15, 1.15]} o={0.32} />
    <Cyl p={[0, 0.35, 0]} rt={0.06} h={0.7} color="#2b3350" line={2} />
    <Box p={[0, 0.78, 0]} s={[1.0, 0.18, 1.0]} color={color} />
    <Box p={[0, 1.4, -0.45]} s={[1.0, 1.1, 0.14]} color={color} />
    <Box p={[-0.48, 1.02, 0.02]} s={[0.1, 0.08, 0.76]} color="#2b3350" line={2} />
    <Box p={[0.48, 1.02, 0.02]} s={[0.1, 0.08, 0.76]} color="#2b3350" line={2} />
    <Box p={[0, 0.05, 0]} s={[0.9, 0.08, 0.9]} color="#2b3350" line={2} />
  </group>
);
export const Cooler: React.FC<{ p: V3 }> = ({ p }) => (<group position={p}><Cyl p={[0, 0.7, 0]} rt={0.4} h={1.4} color="#e8eef8" /><Cyl p={[0, 1.8, 0]} rt={0.32} h={0.9} color="#7ec8ff" /><Box p={[0, 1.1, 0.4]} s={[0.2, 0.12, 0.1]} color="#e23b3b" line={2} /></group>);
export const Cabinet: React.FC<{ p: V3; w?: number; h?: number; color?: string }> = ({ p, w = 1.6, h = 2.2, color = "#8a96b8" }) => (<group position={p}><Box p={[0, h / 2, 0]} s={[w, h, 0.9]} color={color} />{[0.3, 0.55, 0.8].map((k) => <Box key={k} p={[0, h * k, 0.47]} s={[w - 0.2, 0.04, 0.04]} color={INK} line={2} />)}{[0.18, 0.42, 0.68].map((k) => <Box key={k} p={[0, h * k, 0.5]} s={[0.3, 0.07, 0.07]} color="#d8d8e0" line={2} />)}</group>);
export const Rug: React.FC<{ p: V3; s: [number, number]; a: string; b: string }> = ({ p, s, a, b }) => (
  <CanvasPlane p={[p[0], p[1] + 0.02, p[2]]} s={s} rot={[-Math.PI / 2, 0, 0]} px={[256, Math.round(256 * s[1] / s[0])]} draw={(c, W, H) => { c.fillStyle = a; c.fillRect(0, 0, W, H); c.strokeStyle = b; c.lineWidth = 14; c.strokeRect(18, 18, W - 36, H - 36); c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6); c.strokeStyle = b; c.lineWidth = 5; c.strokeRect(46, 46, W - 92, H - 92); }} />
);
export const Dust: React.FC<{ t: number; n?: number; area: [number, number, number]; color?: string; fall?: boolean }> = ({ t, n = 14, area, color = "rgba(255,240,200,.9)", fall }) => (
  <>{Array.from({ length: n }, (_, i) => { const u = (t * (fall ? 0.5 : 0.07) + i * 0.137) % 1; return <Glow key={i} p={[Math.sin(i * 12.9) * area[0], fall ? area[1] * (1 - u) : area[1] * (0.3 + ((i * 0.37) % 1) * 0.7) + Math.sin(t + i) * 0.1, -1 + Math.cos(i * 7.7) * area[2]]} r={fall ? 0.09 : 0.06} color={color} o={0.8} />; })}</>
);
