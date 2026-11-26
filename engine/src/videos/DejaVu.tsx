// Déjà Vu — Stick-in-3D vertical video (9:16, 720x1280, 30fps, 45.42s).
// S1 0.00-4.70: Inside-looking-out Lisbon café doorway; hero pushes hollow glass door open & steps in.
// S2 4.70-10.10: Espresso counter macro-to-medium track; steam hiss, yellow mug clinks saucer, barista turns.
// S3 10.10-19.55: Hyper-focus tour; stomach drop, glowing floor tile crack by shoe, counter stain, 3 preview bubbles.
// S4 19.55-26.25: Frozen-time 90-deg orbit around hero mid-stride; suspended drops, magic swirl X-ed out.
// S5 26.25-32.60: Inside Lobus Temporal neural hub; rogue orb misfires & stamps "RUANGAN BARU" as "MEMORI LAMA".
// S6 32.60-38.10: Korteks Prefrontal fact-check desk; detective scans crate ("0 KUNJUNGAN") & slams "SALAH!" + siren.
// S7 38.10-45.45: Split-bridge tug-of-war ("ALARM PALSU" vs "LOGIKA"), "DÉJÀ VU" prism, glitch -> café receipt check.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Desk, Clock, Grade, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, WallDoor, SideWall, Glow, Shaft, Plant, Shelf, Frame, WindowCity, Lamp, Monitor, Chair, Cabinet, Rug, Dust } from "../style/props";
import { Cam, Key, camAt, hand, Building, StreetLamp, StreetSign, Taxi, HangLamp, Mug, Stars, Saucer, EspressoMachine, CashRegister, Siren, Receipt, SpeechBubble } from "../style/extra";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const hero: Look = { skin: "#fbe3c8", body: "#e85d2a", outfit: "hoodie", hair: "swept", hairColor: "#1d1a28", glasses: true, badge: "#ffd23a", shoe: "#1b1b2a" };
const barista: Look = { skin: "#e6b892", body: "#1d7a4a", outfit: "shirt", hair: "short", hairColor: "#2a1a12", badge: "#ffffff", shoe: "#1b1b2a" };
const lobeTech: Look = { skin: "#f5d0ff", body: "#ff4f7b", outfit: "hoodie", hair: "short", hairColor: "#2b1055", badge: "#ffd23a", shoe: "#1b1b2a" };
const prefrontal: Look = { skin: "#d9eeff", body: "#1d4ed8", outfit: "suit", tie: "#2fd46a", hair: "grey", glasses: true, shoe: "#0b0d1a" };

const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.32, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 720 : 0, blur = !first && trans === "whip" ? (1 - ke) * 14 : 0;
  const glitch = t > 42.54 && t < 43.12;
  const gx = glitch ? Math.sin(f * 13.7) * 16 : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx + gx}px) scale(${sc})`, background: bg, filter: `saturate(1.32) contrast(1.07) brightness(1.02)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}${glitch ? " hue-rotate(35deg)" : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};
const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);
const toWorld = (p: V3, loc: V3, cam: V3): V3 => { const y = yawTo(cam, p); return [p[0] + loc[0] * Math.cos(y) + loc[2] * Math.sin(y), p[1] + loc[1], p[2] - loc[0] * Math.sin(y) + loc[2] * Math.cos(y)]; };

/* Reusable Lisbon Café Shell for S1, S3, S4, S7b (counter top at y=1.64 so barista is clearly visible above!) */
const CafeShell: React.FC<{ t: number; f: number; doorOpen?: number; freeze?: boolean; steam?: number; stainGlow?: number; crackGlow?: number }> = ({ t, f, doorOpen = 0, freeze = false, steam = 1, stainGlow = 0, crackGlow = 0 }) => (
  <>
    {/* outdoor Lisbon street behind doorway (z < -6) */}
    <Stars p={[0, 14, -42]} s={[90, 36]} t={t} top="#40327a" bottom="#ffa45b" n={0} />
    <Surface p={[0, 0, -14]} s={[30, 16]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a="#9c8a7a" b="#8b7969" unit={1.2} />
    <Building p={[-8, 0, -17]} s={[7, 14, 6]} color="#f0b56a" face="+z" seed={3} lit={0.4} />
    <Building p={[8, 0, -18]} s={[7, 16, 6]} color="#e07a5f" face="+z" seed={7} lit={0.5} />
    <StreetLamp p={[-3.4, 0, -8.5]} h={5.2} on={0.7} />
    <StreetSign p={[3.3, 0, -8.2]} a="LISBOA" b="CAFE" h={4.0} />
    <Taxi p={[-2.2, 0, -11.5]} color="#ffd23a" />

    {/* indoor café floor & walls */}
    <Floor kind="tile" a="#d9a87e" b="#c48a62" unit={1.6} w={26} d={26} />
    <WallDoor z={-6} W={26} kind="wood" a="#8b4d2b" b="#7a4124" door={{ x: 0, w: 2.8, h: 4.5 }} base="#422010" />
    <SideWall x={-7.5} kind="brick" a="#c46a45" b="#b05a38" d={26} />
    <SideWall x={7.5} kind="brick" a="#c46a45" b="#b05a38" d={26} />
    {[-3, 0, 3, 6].map((z) => <Box key={z} p={[0, 8.2, z]} s={[15, 0.35, 0.45]} color="#422010" line={2} />)}

    {/* hollow wooden door frame + see-through glass leaf (opens +Z into the café, away from walker outside) */}
    <Box p={[-1.52, 2.25, -6]} s={[0.24, 4.7, 0.32]} color="#2b1810" />
    <Box p={[1.52, 2.25, -6]} s={[0.24, 4.7, 0.32]} color="#2b1810" />
    <Box p={[0, 4.65, -6]} s={[3.28, 0.28, 0.32]} color="#2b1810" />
    <group position={[-1.4, 0, -5.92]} rotation={[0, -doorOpen * 1.4, 0]}>
      {/* 4 wooden frame bars with an open center cutout so glass is truly see-through */}
      <Box p={[0.17, 2.25, 0]} s={[0.34, 4.46, 0.08]} color="#6b3e26" line={3} />
      <Box p={[2.59, 2.25, 0]} s={[0.34, 4.46, 0.08]} color="#6b3e26" line={3} />
      <Box p={[1.38, 4.21, 0]} s={[2.08, 0.54, 0.08]} color="#6b3e26" line={3} />
      <Box p={[1.38, 0.45, 0]} s={[2.08, 0.90, 0.08]} color="#6b3e26" line={3} />
      <CanvasPlane p={[1.38, 2.42, 0]} s={[2.08, 3.04]} px={[210, 304]} draw={(c, W, H) => {
        c.clearRect(0, 0, W, H);
        c.fillStyle = "rgba(185,235,255,0.22)"; c.fillRect(0, 0, W, H);
        c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 10;
        c.beginPath(); c.moveTo(24, 60); c.lineTo(95, 18); c.moveTo(28, 108); c.lineTo(145, 22); c.stroke();
        c.fillStyle = "#1b1b2a"; c.font = "900 30px Inter, Arial"; c.textAlign = "center"; c.fillText("CAFÉ", W / 2, H * 0.25);
      }} />
      <Box p={[2.46, 2.15, 0.1]} s={[0.12, 0.55, 0.12]} color="#ffc23a" line={2} />
      <Box p={[2.46, 2.15, -0.1]} s={[0.12, 0.55, 0.12]} color="#ffc23a" line={2} />
    </group>

    {/* windows, menu board, clock & frames */}
    <WindowCity p={[-4.8, 4.5, -5.9]} s={[2.6, 3.2]} dusk />
    <CanvasPlane p={[4.5, 4.7, -5.85]} s={[3.4, 2.4]} px={[340, 240]} frame="#422010" draw={(c, W, H) => {
      c.fillStyle = "#1a2420"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#ffd770"; c.font = "900 42px Inter, Arial"; c.textAlign = "center"; c.fillText("MENU", W / 2, 46);
      c.fillStyle = "#fff"; c.font = "800 26px Inter, Arial"; c.textAlign = "left";
      c.fillText("ESPRESSO .... 2€", 26, 102); c.fillText("CORTADO ..... 3€", 26, 146); c.fillText("PASTEL ...... 2€", 26, 190);
    }} />
    <Clock p={[-4.8, 7.0, -5.85]} r={0.55} t={freeze ? 20 : t} />
    <Frame p={[-7.4, 4.6, -1.5]} s={[1.6, 1.2]} rot={[0, Math.PI / 2, 0]} art={1} />
    <Frame p={[-7.4, 4.6, 2.5]} s={[1.6, 1.2]} rot={[0, Math.PI / 2, 0]} art={0} />

    {/* espresso bar counter on right side (top at y=1.64) */}
    <Box p={[4.8, 0.75, -1.0]} s={[2.4, 1.5, 6.2]} color="#5c311b" />
    <Box p={[4.75, 1.56, -1.0]} s={[2.7, 0.16, 6.5]} color="#f0e4d4" />
    <EspressoMachine p={[4.8, 1.64, -2.5]} rotY={-Math.PI / 2} s={0.95} steam={freeze ? 0 : steam} />
    <CashRegister p={[4.7, 1.64, 1.0]} rotY={-Math.PI / 2} s={0.85} />
    <Saucer p={[4.1, 1.65, -0.5]} s={0.95} />
    <Mug p={[4.1, 1.84, -0.5]} s={0.95} color="#ffd23a" />

    {/* coffee stain on counter near cash register */}
    <CanvasPlane p={[3.85, 1.655, 0.45]} rot={[-Math.PI / 2, 0, 0.4]} s={[0.68, 0.68]} px={[128, 128]} draw={(c, W, H) => {
      c.clearRect(0, 0, W, H);
      c.strokeStyle = "#4d2710"; c.lineWidth = 10; c.beginPath(); c.arc(W / 2, H / 2, W * 0.28, 0, 7); c.stroke();
      c.fillStyle = "rgba(90,46,18,0.65)"; c.beginPath(); c.ellipse(W * 0.55, H * 0.55, W * 0.14, H * 0.1, 0.3, 0, 7); c.fill();
      if (stainGlow > 0.02) {
        c.strokeStyle = `rgba(255,59,75,${stainGlow})`; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, H / 2, W * 0.44, 0, 7); c.stroke();
      }
    }} />

    {/* cracked tile on bare floor in front of rug right by hero's shoes */}
    <CanvasPlane p={[-0.45, 0.025, 1.28]} rot={[-Math.PI / 2, 0, 0]} s={[1.45, 1.45]} px={[192, 192]} draw={(c, W, H) => {
      c.clearRect(0, 0, W, H);
      c.strokeStyle = INK; c.lineWidth = 8;
      c.beginPath(); c.moveTo(24, 30); c.lineTo(86, 76); c.lineTo(74, 128); c.lineTo(154, 162);
      c.moveTo(86, 76); c.lineTo(148, 52); c.stroke();
      if (crackGlow > 0.02) {
        c.strokeStyle = `rgba(0,230,255,${crackGlow})`; c.lineWidth = 9;
        c.beginPath(); c.arc(W / 2, H / 2, W * 0.44, 0, 7); c.stroke();
      }
    }} />

    {/* café seating, shelves, plants, lamps & warm atmosphere (rug sits behind z=0.05 so tile crack is bare) */}
    <Desk p={[-4.5, 0, -2.5]} w={2.2} d={1.6} top="#e8c39e" leg="#3b2014" />
    <Chair p={[-4.5, 0, -1.2]} rotY={Math.PI} color="#d94a4a" />
    <Chair p={[-4.5, 0, -3.8]} rotY={0} color="#d94a4a" />
    <Desk p={[-4.6, 0, 2.2]} w={2.2} d={1.6} top="#e8c39e" leg="#3b2014" />
    <Chair p={[-3.2, 0, 2.2]} rotY={-Math.PI / 2} color="#1d7a4a" />
    <Mug p={[-4.4, 1.28, -2.4]} s={0.85} color="#ffd23a" />
    <Shelf p={[6.9, 0, -3.5]} w={1.1} rows={4} seed={5} wood="#422010" />
    <Plant p={[-6.5, 0, -4.8]} s={1.15} pot="#d96b38" />
    <Plant p={[6.2, 0, 3.2]} s={1.1} pot="#d96b38" />
    <Cabinet p={[-6.7, 0, 0.2]} w={1.1} h={2.0} color="#5c311b" />
    <Rug p={[-0.6, 0, -1.9]} s={[3.8, 3.2]} a="#7a2424" b="#f0c265" />
    <HangLamp p={[-3.2, 7.6, -1.5]} color="#e07a3a" />
    <HangLamp p={[3.8, 7.6, -0.5]} color="#ffc23a" />
    <Lamp p={[-6.5, 0, 4.2]} h={2.5} color="#ffe4a0" />
    <Shaft p={[-1.4, 4.2, -3.5]} s={[3.0, 9.0]} rot={[0, 0, 0.3]} color="255,215,140" o={0.18} />
    <Dust t={freeze ? 20 : t} area={[5, 6, 4]} color="rgba(255,230,175,.9)" />
  </>
);

/* =================== S1 0.00 – 4.70  "Kau mendorong pintu kaca sebuah kafe sempit di kota asing..." =================== */
const K1: Key[] = [
  { t: 0.0, pos: [0.6, 3.0, -0.5], look: [0.0, 2.3, -6.5], fov: 58 },
  { t: 1.3, pos: [-0.4, 3.0, 1.8], look: [0.0, 2.1, -4.5], fov: 60 },
  { t: 2.8, pos: [-2.2, 3.1, 5.2], look: [0.4, 1.8, -1.2], fov: 62 },
  { t: 4.8, pos: [-2.6, 3.2, 6.4], look: [0.6, 1.8, -1.0], fov: 62 },
];
const S1 = ({ t, f }: Ctx) => {
  const reach = seg(t, 0.14, 0.45, Easing.inOut(Easing.sin)) * (1 - seg(t, 0.9, 1.3));
  const doorOpen = seg(t, 0.48, 1.25, Easing.out(Easing.cubic));
  const walk1 = seg(t, 0.0, 0.45, Easing.linear);
  const walk2 = seg(t, 0.65, 3.1, Easing.inOut(Easing.sin));
  const hz = t < 0.45 ? lerp(-7.3, -6.35, walk1) : lerp(-6.35, 0.55, walk2);
  const hx = lerp(0.2, -0.65, walk2);
  const dist = Math.hypot(hx - 0.2, hz + 7.3);
  const moving = t < 0.43 || (t > 0.65 && t < 3.08);
  return (<>
    <Cam t={t} keys={K1} />
    <Lights warm="#ffd5a0" />
    <CafeShell t={t} f={f} doorOpen={doorOpen} steam={t} />
    <Person p={[5.9, 0, -1.2]} h={3.9} look={barista} f={f} pose={{ mood: "smile", lookX: -0.6 }} />
    <Person p={[hx, 0, hz]} h={3.5} look={hero} f={f} pose={{
      mood: t < 2.2 ? "deadpan" : "smile",
      walk: moving ? dist * WALK : undefined,
      speed: moving ? 0.85 : 0,
      armR: reach > 0.05 ? [0.22, 0.52] : undefined, armRK: reach,
      lookX: t > 2.3 ? Math.sin((t - 2.3) * 2.2) * 0.6 : 0,
    }} />
  </>);
};

/* =================== S2 4.70 – 10.10  "Mesin kopi mendesis, cangkir kuning berdenting di atas lepek, dan barista menoleh ke arahmu." =================== */
const K2: Key[] = [
  { t: 4.5, pos: [1.5, 2.7, -0.8], look: [4.8, 2.4, -2.5], fov: 50 },
  { t: 6.2, pos: [1.3, 2.7, 1.3], look: [4.3, 2.1, -0.5], fov: 52 },
  { t: 7.6, pos: [1.4, 2.8, 1.8], look: [4.4, 2.2, -0.4], fov: 54 },
  { t: 8.6, pos: [1.4, 3.1, 2.4], look: [5.4, 2.6, -0.5], fov: 52 },
  { t: 10.2, pos: [1.6, 3.2, 2.6], look: [5.5, 2.6, -0.5], fov: 51 },
];
const S2 = ({ t, f }: Ctx) => {
  const steamPulse = t > 4.9 && t < 6.2 ? t * 1.4 : 0.2;
  const CLINK = 6.86;
  const lower = seg(t, 6.2, CLINK, Easing.in(Easing.quad));
  const bounce = t >= CLINK ? Math.abs(Math.sin((t - CLINK) * 26)) * Math.exp(-(t - CLINK) * 10) * 0.14 : 0;
  const mugY = lerp(2.75, 1.84, lower) + bounce;
  const clinkGlow = t >= CLINK && t < CLINK + 0.5 ? Math.exp(-(t - CLINK) * 7) : 0;
  const barP: V3 = [5.85, 0, -0.55];
  const relMug = seg(t, CLINK, CLINK + 0.35);
  const turn = seg(t, 8.85, 9.35, Easing.out(Easing.back(1.8)));
  return (<>
    <Cam t={t} keys={K2} />
    <Lights warm="#ffe0b2" />
    <Floor kind="tile" a="#173842" b="#122d36" unit={1.6} w={26} d={26} />
    <WallDoor z={-6} W={26} kind="brick" a="#1b424d" b="#15353f" base="#0a1c22" />
    <SideWall x={7.5} kind="wood" a="#5e321a" b="#4d2814" d={26} />
    <SideWall x={-7.5} kind="brick" a="#1b424d" b="#15353f" d={26} />
    {/* counter (top at y=1.64 so barista is framed cleanly above!) */}
    <Box p={[4.8, 0.75, -0.8]} s={[2.5, 1.5, 6.8]} color="#4d2614" />
    <Box p={[4.7, 1.56, -0.8]} s={[2.8, 0.16, 7.1]} color="#f5ebd8" />
    <EspressoMachine p={[4.8, 1.64, -2.5]} rotY={-Math.PI / 2} s={1.15} steam={steamPulse} />
    <Glow p={[4.1, 2.6, -1.7]} r={1.8} color="rgba(255,240,210,1)" o={t > 4.9 && t < 6.0 ? 0.35 : 0.1} />
    <CashRegister p={[4.7, 1.64, 1.3]} rotY={-Math.PI / 2} s={0.9} />
    <Saucer p={[3.95, 1.65, -0.55]} s={1.15} />
    <Mug p={[3.95, mugY, -0.55]} s={1.15} color="#ffd23a" />
    {clinkGlow > 0.02 ? <Glow p={[3.95, 1.85, -0.55]} r={1.3} color="rgba(255,240,120,1)" o={clinkGlow} /> : null}
    <Shelf p={[6.9, 0, -2.6]} w={1.1} rows={4} seed={9} wood="#2e180c" />
    <Shelf p={[6.9, 0, 1.4]} w={1.1} rows={4} seed={4} wood="#2e180c" />
    <Frame p={[2.5, 4.8, -5.9]} s={[2.2, 1.6]} art={2} />
    <Clock p={[-0.6, 5.2, -5.9]} r={0.65} t={t} />
    <Plant p={[0.8, 0, -4.8]} s={1.2} pot="#e07a3a" />
    <Plant p={[6.2, 0, 3.5]} s={1.1} pot="#e07a3a" />
    <HangLamp p={[3.9, 7.2, -1.5]} color="#ffc23a" />
    <HangLamp p={[3.9, 7.2, 1.2]} color="#ffc23a" />
    <Shaft p={[2.6, 4.5, -2.5]} s={[3.2, 9]} rot={[0, 0, 0.35]} color="255,220,150" o={0.18} />
    <Dust t={t} area={[4, 5, 3]} color="rgba(255,235,190,.9)" />
    <Person p={barP} h={3.95} look={barista} f={f} pose={{
      mood: t < 8.6 ? "deadpan" : "smile",
      lookX: lerp(0.5, -0.95, turn),
      armL: t < CLINK + 0.3 ? [-0.42, lerp(0.76, 0.46, lower)] : undefined,
      armLK: 1 - relMug,
    }} />
  </>);
};

/* =================== S3 10.10 – 19.55  "Sebelum dia bersuara, perutmu terasa mencelos. Kau sudah hafal retakan ubin..." =================== */
const K3: Key[] = [
  { t: 9.9, pos: [-2.6, 3.0, 5.2], look: [-0.8, 1.85, 0.9], fov: 58 },
  { t: 11.78, pos: [-2.4, 2.8, 4.6], look: [-0.8, 1.85, 0.9], fov: 50 },
  { t: 13.7, pos: [-2.0, 1.45, 3.6], look: [-0.55, 0.05, 1.25], fov: 54 },
  { t: 15.5, pos: [1.0, 2.7, 2.9], look: [3.95, 1.75, 0.6], fov: 52 },
  { t: 17.0, pos: [1.8, 3.1, 3.1], look: [5.4, 2.7, -0.4], fov: 54 },
  { t: 19.65, pos: [1.9, 3.1, 3.3], look: [5.4, 2.7, -0.4], fov: 54 },
];
const S3 = ({ t, f }: Ctx) => {
  const drop = seg(t, 11.75, 12.15, Easing.out(Easing.back(2)));
  const crackGlow = seg(t, 13.74, 14.3) * (1 - seg(t, 15.1, 15.5));
  const stainGlow = seg(t, 15.58, 16.0) * (1 - seg(t, 16.6, 17.0));
  const b1 = seg(t, 17.12, 17.32, Easing.out(Easing.back(2.4)));
  const b2 = seg(t, 17.42, 17.62, Easing.out(Easing.back(2.4)));
  const b3 = seg(t, 17.74, 17.94, Easing.out(Easing.back(2.4)));
  return (<>
    <Cam t={t} keys={K3} fovKick={[11.78]} />
    <Lights warm="#a5d8ff" />
    <CafeShell t={t} f={f} doorOpen={0.15} steam={t} stainGlow={stainGlow} crackGlow={crackGlow} />
    <Person p={[-0.95, 0, 0.95]} h={3.5} look={hero} f={f} pose={{
      mood: t < 11.75 ? "deadpan" : t < 13.0 ? "gulp" : "worry",
      nerv: t > 11.75 ? 0.55 : 0.1,
      sweat: t > 11.8 ? 0.85 : 0,
      squash: t > 11.75 && t < 12.5 ? -0.14 * Math.sin(clamp((t - 11.75) / 0.75) * Math.PI) : 0,
      arms: t > 11.78 ? "chest" : "down",
      armK: drop,
      lookX: t < 13.4 ? 0.4 : 0.9,
      hunch: t > 11.8 ? 0.45 : 0,
    }} />
    <Person p={[5.8, 0, -0.5]} h={3.95} look={barista} f={f} pose={{ mood: "deadpan", lookX: -0.9 }} />
    {b1 > 0.02 ? <SpeechBubble p={[4.5, 4.15, 0.1]} s={[0.95, 0.6]} text="KOPI" bg="#d8f5ff" fg="#0b1830" scale={b1} /> : null}
    {b2 > 0.02 ? <SpeechBubble p={[5.5, 4.85, 0.1]} s={[1.0, 0.6]} text="PANAS," bg="#d8f5ff" fg="#0b1830" scale={b2} /> : null}
    {b3 > 0.02 ? <SpeechBubble p={[6.4, 4.15, 0.1]} s={[0.92, 0.6]} text="PAK?" bg="#d8f5ff" fg="#0b1830" scale={b3} /> : null}
  </>);
};

/* =================== S4 19.55 – 26.25  "Kau membeku di tengah langkah ... Tidak ada sihir di sini." =================== */
const K4: Key[] = [
  { t: 19.4, pos: [-3.4, 2.7, 5.4], look: [-0.5, 1.75, 0.85], fov: 56 },
  { t: 21.0, pos: [-0.4, 2.8, 6.0], look: [-0.5, 1.75, 0.85], fov: 56 },
  { t: 23.0, pos: [2.8, 2.9, 5.0], look: [-0.5, 1.75, 0.85], fov: 56 },
  { t: 24.8, pos: [3.4, 3.0, 4.5], look: [-0.5, 1.85, 0.85], fov: 54 },
  { t: 26.35, pos: [3.2, 3.0, 4.6], look: [-0.5, 1.85, 0.85], fov: 54 },
];
const S4 = ({ t, f }: Ctx) => {
  const pre = seg(t, 19.55, 19.84, Easing.linear);
  const hx = lerp(-0.95, -0.5, pre), hz = lerp(0.95, 0.85, pre);
  const frozen = t >= 19.84;
  const noMagic = seg(t, 25.06, 25.45, Easing.out(Easing.back(2)));
  const ring = seg(t, 20.5, 21.4);
  return (<>
    <Cam t={t} keys={K4} />
    <Lights warm="#c4b5fd" />
    <CafeShell t={t} f={f} doorOpen={0.1} freeze={frozen} />
    <Person p={[5.8, 0, -0.5]} h={3.95} look={barista} f={frozen ? 10 : f} pose={{ mood: "deadpan", lookX: -0.9 }} />
    {[[2.4, 2.3, 0.4], [2.65, 1.95, 0.6], [2.2, 1.7, 0.25], [2.8, 2.65, 0.1]].map(([x, y, z], i) => (
      <Ball key={i} p={[x, y, z]} r={0.12} color="#fff7d6" ink={0.03} />
    ))}
    <CanvasPlane p={[hx, 0.03, hz]} rot={[-Math.PI / 2, 0, 0]} s={[3.2 * ring + 0.01, 3.2 * ring + 0.01]} px={[256, 256]} draw={(c, W, H) => {
      c.clearRect(0, 0, W, H);
      c.strokeStyle = "#a78bfa"; c.lineWidth = 10; c.setLineDash([22, 14]);
      c.beginPath(); c.arc(W / 2, H / 2, W * 0.42, 0, 7); c.stroke();
    }} />
    <Person p={[hx, 0, hz]} h={3.5} look={hero} f={frozen ? 24 : f} pose={{
      mood: t < 19.84 ? "worry" : "shock",
      walk: 1.35, speed: t < 19.84 ? 0.85 : 0.75,
      nerv: 0, sweat: 0.9, arms: "hold", armK: 1,
    }} />
    {t > 24.4 && t < 26.25 ? (
      <CanvasPlane p={[hx, 4.25, hz]} s={[2.1, 1.2]} px={[320, 180]} face draw={(c, W, H) => {
        c.clearRect(0, 0, W, H);
        const fade = 1 - seg(t, 25.6, 26.1);
        c.globalAlpha = fade;
        c.fillStyle = "#ffd23a"; c.font = "900 54px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText("✨ SIHIR ✨", W / 2, H / 2);
        if (noMagic > 0.05) {
          c.strokeStyle = "#ff2b3b"; c.lineWidth = 18; c.lineCap = "round";
          const k = clamp(noMagic);
          c.beginPath(); c.moveTo(40, 26); c.lineTo(lerp(40, W - 40, k), lerp(26, H - 26, k));
          c.moveTo(W - 40, 26); c.lineTo(lerp(W - 40, 40, k), lerp(26, H - 26, k)); c.stroke();
        }
      }} />
    ) : null}
  </>);
};

/* =================== S5 26.25 – 32.60  "Jauh di dalam lobus temporal otakmu, sinyal rasa akrab salah menembak..." =================== */
const K5: Key[] = [
  { t: 26.1, pos: [-3.4, 3.5, 7.6], look: [-0.4, 2.2, -1.5], fov: 60 },
  { t: 28.4, pos: [-2.2, 3.0, 6.4], look: [-1.4, 2.0, -1.0], fov: 56 },
  { t: 29.8, pos: [0.6, 3.1, 7.2], look: [1.4, 1.9, -1.2], fov: 58 },
  { t: 31.4, pos: [2.2, 3.2, 7.4], look: [2.2, 1.65, -1.5], fov: 56 },
  { t: 32.7, pos: [2.3, 3.2, 7.5], look: [2.2, 1.65, -1.5], fov: 56 },
];
const S5 = ({ t, f }: Ctx) => {
  const pullLever = seg(t, 29.1, 29.55, Easing.inOut(Easing.sin)) * (1 - seg(t, 29.7, 30.1));
  const fire = seg(t, 29.58, 30.45, Easing.out(Easing.quad));
  const orbX = lerp(-1.8, 2.6, fire);
  const orbY = 2.1 + Math.sin(fire * Math.PI) * 1.3;
  const hit = t >= 30.45;
  const stampDrop = hit ? seg(t, 31.35, 31.76, Easing.in(Easing.cubic)) : 0;
  const stamped = t >= 31.76;
  return (<>
    <Cam t={t} keys={K5} impacts={[[30.45, 0.04], [31.76, 0.06]]} />
    <Lights warm="#ffb5e8" />
    <Floor kind="tile" a="#2b0f45" b="#230b38" unit={2.0} w={30} d={30} />
    <WallDoor z={-7} W={30} kind="plain" a="#1c0830" b="#1c0830" base="#0d031a" />
    <SideWall x={-9} kind="plain" a="#240b3c" b="#240b3c" d={30} />
    <SideWall x={9} kind="plain" a="#240b3c" b="#240b3c" d={30} />

    {[-3.5, 0, 3.5].map((z, i) => <Cyl key={i} p={[0, 6.2 + (i % 2) * 0.5, z - 2]} rt={0.14} h={18} color="#ff4f7b" rot={[0, 0, Math.PI / 2]} line={2} />)}
    <CanvasPlane p={[0, 5.5, -6.8]} s={[7.8, 1.8]} px={[780, 180]} frame="#ff4f7b" draw={(c, W, H) => {
      c.fillStyle = "#160526"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#ffd23a"; c.font = "900 66px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("LOBUS TEMPORAL", W / 2, H / 2 + 4);
    }} />
    <Shelf p={[-6.5, 0, -5.8]} w={2.8} rows={4} seed={2} wood="#3a165e" />
    <Shelf p={[6.5, 0, -5.8]} w={2.8} rows={4} seed={8} wood="#3a165e" />
    <Cabinet p={[-6.8, 0, -1.0]} w={1.6} h={2.4} color="#522280" />
    <Cabinet p={[6.8, 0, -1.0]} w={1.6} h={2.4} color="#522280" />
    <Monitor p={[-4.2, 1.1, -4.5]} screen="#ff4f7b" /><Desk p={[-4.2, 0, -4.5]} w={2.6} top="#522280" leg="#2b1045" />
    <Chair p={[-4.2, 0, -3.2]} rotY={0.3} color="#ff4f7b" />
    <Lamp p={[6.5, 0, 2.5]} h={2.8} color="#ffb5e8" />
    <Rug p={[0.4, 0, -1.2]} s={[7.0, 4.2]} a="#361058" b="#ff4f7b" />
    <Dust t={t} area={[6, 6, 4]} color="rgba(255,150,220,.9)" />
    <Shaft p={[-1.5, 5, -3]} s={[3.5, 10]} rot={[0, 0, 0.3]} color="255,100,180" o={0.18} />

    <group position={[-2.4, 0, -1.2]}>
      <Box p={[0, 0.7, 0]} s={[1.8, 1.4, 1.4]} color="#3a1860" />
      <Cyl p={[0.8, 1.7, 0]} rt={0.35} rb={0.48} h={1.5} color="#ff4f7b" rot={[0, 0, -1.1]} />
      <Cyl p={[-0.6, 1.75, 0.5]} rt={0.08} h={0.9} color="#ffd23a" rot={[0, 0, lerp(0.4, -0.5, pullLever)]} line={2} />
      <Ball p={[-0.6 - lerp(0.4, -0.5, pullLever) * 0.4, 2.15, 0.5]} r={0.18} color="#ff2b3b" />
    </group>

    {t >= 29.5 && !hit ? (
      <>
        <Ball p={[orbX, orbY, -1.2]} r={0.42} color="#ff3b4b" />
        <Glow p={[orbX, orbY, -1.0]} r={1.8} color="rgba(255,80,100,1)" o={0.85} />
      </>
    ) : null}

    <group position={[2.6, 0, -1.4]}>
      <Box p={[0, 1.15, 0]} s={[2.4, 2.3, 2.0]} color={stamped ? "#6a1b3a" : "#2f8cff"} />
      <CanvasPlane p={[0, 1.25, 1.02]} s={[2.1, 1.8]} px={[420, 360]} draw={(c, W, H) => {
        c.fillStyle = stamped ? "#3a0b1e" : "#122a4e"; c.fillRect(0, 0, W, H);
        c.fillStyle = "#ffd2a0"; c.fillRect(40, 26, W - 80, 150);
        c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(40, 26, W - 80, 150);
        /* mini café icon inside preview */
        c.fillStyle = "#8b4d2b"; c.fillRect(150, 54, 120, 96); c.fillStyle = "#9fd4ff"; c.fillRect(175, 70, 70, 64);
        c.fillStyle = "#fff"; c.font = "900 30px Inter, Arial"; c.textAlign = "center"; c.fillText("RUANGAN BARU", W / 2, 224);
        if (stamped) {
          c.save(); c.translate(W / 2, H * 0.46); c.rotate(-0.12);
          c.fillStyle = "#ff2b3b"; c.fillRect(-170, -42, 340, 84); c.strokeStyle = "#fff"; c.lineWidth = 5; c.strokeRect(-170, -42, 340, 84);
          c.fillStyle = "#fff"; c.font = "900 42px Inter, Arial"; c.textBaseline = "middle"; c.fillText("MEMORI LAMA", 0, 2);
          c.restore();
        }
      }} />
      <Box p={[0, lerp(4.8, 2.6, stampDrop), 0]} s={[2.0, 0.5, 1.6]} color="#ff2b3b" />
      <Cyl p={[0, lerp(6.6, 4.4, stampDrop), 0]} rt={0.22} h={3.2} color="#9aa0b8" />
    </group>
    {hit ? <Glow p={[2.6, 1.4, -0.2]} r={3.2} color="rgba(255,60,90,0.9)" o={0.7 * Math.exp(-(t - 30.45) * 4)} /> : null}

    <Person p={[-4.1, 0, -0.8]} h={3.4} look={lobeTech} f={f} pose={{
      mood: t < 29.5 ? "grin" : "shock",
      nerv: t > 29.6 ? 0.55 : 0.1,
      sweat: t > 29.8 ? 0.8 : 0,
      armR: t < 29.8 ? [0.28, lerp(0.58, 0.44, pullLever)] : undefined,
      arms: t >= 29.8 ? "head" : undefined, armK: 1,
      lookX: 0.7,
    }} />
  </>);
};

/* =================== S6 32.60 – 38.10  "Sepersekian detik kemudian, korteks prefrontal melakukan cek fakta dan menangkap kesalahannya." =================== */
const K6: Key[] = [
  { t: 32.4, pos: [-2.4, 3.3, 7.6], look: [0.3, 2.2, -1.0], fov: 58 },
  { t: 34.4, pos: [-1.0, 3.1, 6.8], look: [0.4, 2.1, -1.0], fov: 56 },
  { t: 35.8, pos: [0.2, 3.0, 6.2], look: [0.5, 2.1, -1.2], fov: 54 },
  { t: 37.0, pos: [0.6, 3.2, 6.5], look: [0.5, 2.2, -1.2], fov: 58 },
  { t: 38.2, pos: [0.7, 3.2, 6.6], look: [0.5, 2.2, -1.2], fov: 58 },
];
const S6 = ({ t, f }: Ctx) => {
  const slide = seg(t, 32.78, 34.1, Easing.out(Easing.cubic));
  const crateX = lerp(-7.5, -0.8, slide);
  const scan = t > 35.3 && t < 36.85;
  const slam = seg(t, 36.85, 37.1, Easing.in(Easing.cubic));
  const stamped = t >= 37.08;
  return (<>
    <Cam t={t} keys={K6} impacts={[[37.08, 0.06]]} />
    <Lights warm="#bfe6ff" />
    <Floor kind="marble" a="#0b2447" b="#081c38" unit={2.2} w={30} d={30} />
    <WallDoor z={-7} W={30} kind="plain" a="#091f3d" b="#091f3d" base="#051122" />
    <SideWall x={-9} kind="plain" a="#0b2548" b="#0b2548" d={30} />
    <SideWall x={9} kind="plain" a="#0b2548" b="#0b2548" d={30} />

    <CanvasPlane p={[0.4, 5.1, -6.7]} s={[7.8, 3.6]} px={[780, 360]} frame="#2f8cff" draw={(c, W, H) => {
      c.fillStyle = "#061428"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#6ec8ff"; c.font = "900 36px Inter, Arial"; c.textAlign = "left"; c.fillText("KORTEKS PREFRONTAL • CEK FAKTA", 28, 54);
      c.strokeStyle = "rgba(110,200,255,0.28)"; c.lineWidth = 3; c.strokeRect(22, 82, W - 44, H - 106);
      c.fillStyle = "#fff"; c.font = "800 35px Inter, Arial"; c.fillText("KAFE LISBON: 0x KUNJUNGAN", 42, 148);
      c.fillStyle = "#ffd23a"; c.fillText("LABEL: MEMORI LAMA ???", 42, 212);
      if (stamped) {
        c.fillStyle = "#ff2b3b"; c.font = "900 66px Inter, Arial"; c.fillText("ERROR: PALSU!", 42, 302);
      } else if (scan) {
        c.fillStyle = "#2fd46a"; c.font = "900 50px Inter, Arial"; c.fillText("MEMINDAI DATA...", 42, 302);
      }
    }} />
    <Shelf p={[-6.4, 0, -5.8]} w={2.6} rows={4} seed={1} wood="#163560" />
    <Shelf p={[6.6, 0, -5.8]} w={2.6} rows={4} seed={6} wood="#163560" />
    <Cabinet p={[-6.8, 0, -1.5]} color="#25548f" />
    <Cabinet p={[6.8, 0, -1.5]} color="#25548f" />
    <Clock p={[-5.4, 5.4, -6.8]} r={0.55} t={t} />
    <Lamp p={[6.2, 0, 2.2]} h={2.8} color="#9ad8ff" />
    <Plant p={[-5.4, 0, 2.2]} s={1.1} pot="#2f8cff" />
    <Rug p={[0.4, 0, -0.5]} s={[6.8, 4.0]} a="#0f2d56" b="#2fd46a" />
    <Dust t={t} area={[5, 6, 4]} color="rgba(160,220,255,.9)" />

    <Desk p={[0.4, 0, -1.4]} w={5.6} d={2.2} top="#dceeff" leg="#2b4c7e" />
    <Monitor p={[2.1, 1.1, -1.9]} rot={[0, -0.35, 0]} screen={stamped ? "#ff2b3b" : "#2fd46a"} />
    <Siren p={[2.5, 1.1, -0.8]} on={stamped} t={t} />
    <Box p={[-5.2, 0.85, -1.4]} s={[4.0, 0.25, 1.8]} color="#4a6592" rot={[0, 0, -0.18]} />

    <group position={[crateX, 1.65, -1.3]}>
      <Box p={[0, 0, 0]} s={[1.25, 1.15, 1.1]} color={stamped ? "#7a1d32" : "#2f8cff"} />
      <CanvasPlane p={[0, 0, 0.57]} s={[1.05, 0.95]} px={[220, 200]} draw={(c, W, H) => {
        c.fillStyle = "#162d50"; c.fillRect(0, 0, W, H);
        c.fillStyle = "#fff"; c.font = "900 28px Inter, Arial"; c.textAlign = "center"; c.fillText("MEMORI", W / 2, 54); c.fillText("LAMA", W / 2, 90);
        if (stamped) {
          c.fillStyle = "#ff2b3b"; c.fillRect(16, 118, W - 32, 58);
          c.fillStyle = "#fff"; c.font = "900 36px Inter, Arial"; c.fillText("SALAH!", W / 2, 158);
        }
      }} />
      {scan ? <Glow p={[0, 0.2, 0.7]} r={1.6} color="rgba(47,212,106,0.9)" o={0.55 + 0.2 * Math.sin(f * 1.2)} /> : null}
    </group>

    <Person p={[1.1, 0, -2.5]} h={3.6} look={prefrontal} f={f} pose={{
      mood: stamped ? "angry" : "deadpan",
      lookX: -0.7,
      armL: stamped ? [-0.36, lerp(0.75, 0.44, slam)] : scan ? [-0.38, 0.55] : [-0.25, 0.45],
      armLK: 1,
      squash: stamped && t < 37.3 ? -0.1 * Math.exp(-(t - 37.08) * 10) : 0,
    }} />
  </>);
};

/* =================== S7 38.10 – 45.45  "Tarik-menarik antara alarm ingatan palsu dan logika itulah déjà vu, saat otakmu nge-glitch lalu memeriksa struknya sendiri secara langsung." =================== */
const K7: Key[] = [
  { t: 37.9, pos: [0.0, 3.2, 11.4], look: [0.0, 2.0, -1.0], fov: 60 },
  { t: 40.8, pos: [0.0, 3.1, 10.6], look: [0.0, 2.2, -1.0], fov: 58 },
  { t: 42.4, pos: [0.0, 3.2, 11.0], look: [0.0, 2.2, -1.0], fov: 60 },
  { t: 43.25, pos: [-1.1, 2.9, 6.2], look: [0.4, 1.9, -0.2], fov: 56 },
  { t: 45.5, pos: [-0.9, 2.9, 5.8], look: [0.4, 1.9, -0.2], fov: 55 },
];
const S7 = ({ t, f }: Ctx) => {
  const showCafe = t >= 43.18;
  const pullOsc = Math.sin(t * 7.5) * 0.16;
  const dejaPop = seg(t, 41.25, 41.65, Easing.out(Easing.back(2.6)));
  const recUnroll = seg(t, 43.55, 44.3, Easing.out(Easing.cubic));
  const cam = camAt(t, K7).pos;
  const heroP: V3 = [-0.6, 0, 0.8];
  const rHand = toWorld(heroP, hand(3.5, [0.3, 0.58], 0, false, 0.16), cam);
  return (<>
    <Cam t={t} keys={K7} fovKick={[41.39]} />
    {!showCafe ? (<>
      <Lights warm="#ffd4f0" />
      <Stars p={[0, 12, -45]} s={[90, 40]} t={t} top="#180528" bottom="#10254a" n={90} />
      <Surface p={[-6, 0, -1]} s={[12, 8]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a="#4a0e28" b="#38081c" unit={1.6} />
      <Surface p={[6, 0, -1]} s={[12, 8]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a="#0b2f5c" b="#082348" unit={1.6} />
      <Box p={[-6, 0.4, -5.1]} s={[12, 0.8, 0.35]} color="#ff2b3b" />
      <Box p={[6, 0.4, -5.1]} s={[12, 0.8, 0.35]} color="#2f8cff" />
      <Siren p={[-2.6, 0.8, -5.1]} on t={t} />
      <Siren p={[2.6, 0.8, -5.1]} on t={t} color="#2f8cff" />
      <CanvasPlane p={[-1.85, 4.4, -2.6]} s={[2.4, 0.9]} px={[280, 105]} frame="#ff2b3b" draw={(c, W, H) => {
        c.fillStyle = "#2b0614"; c.fillRect(0, 0, W, H); c.fillStyle = "#ff5c6c"; c.font = "900 32px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ALARM PALSU", W / 2, H / 2);
      }} />
      <CanvasPlane p={[1.85, 4.4, -2.6]} s={[2.4, 0.9]} px={[280, 105]} frame="#2f8cff" draw={(c, W, H) => {
        c.fillStyle = "#081c38"; c.fillRect(0, 0, W, H); c.fillStyle = "#6ec8ff"; c.font = "900 36px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("LOGIKA", W / 2, H / 2);
      }} />
      <Glow p={[-2.5, 2.5, -2]} r={4} color="rgba(255,40,70,0.75)" o={0.35} />
      <Glow p={[2.5, 2.5, -2]} r={4} color="rgba(50,150,255,0.75)" o={0.35} />
      <Dust t={t} area={[6, 5, 3]} color="rgba(255,230,255,.9)" />

      {/* glowing tug-of-war energy rope */}
      <Cyl p={[pullOsc, 1.75, 0]} rt={0.1} h={3.2} color="#ffd23a" rot={[0, 0, Math.PI / 2]} line={2} />
      <Ball p={[pullOsc, 1.75, 0]} r={0.32} color="#ffffff" />
      <Glow p={[pullOsc, 1.75, 0.3]} r={1.8} color="rgba(255,220,120,1)" o={0.75} />

      {dejaPop > 0.02 ? (
        <group position={[0, 5.4, -0.5]} scale={dejaPop}>
          <CanvasPlane p={[0, 0, 0]} s={[3.5, 1.15]} px={[420, 140]} frame="#ffd23a" draw={(c, W, H) => {
            const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#7a1438"); g.addColorStop(1, "#12346e");
            c.fillStyle = g; c.fillRect(0, 0, W, H);
            c.fillStyle = "#fff"; c.font = "900 78px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
            c.fillText("DÉJÀ VU", W / 2, H / 2 + 4);
          }} />
        </group>
      ) : null}

      <Person p={[-1.75 + pullOsc, 0, 0]} h={3.4} look={lobeTech} f={f} pose={{
        mood: "angry", tilt: -0.22, nerv: 0.4, sweat: 0.8, lookX: 0.8,
        armR: [0.3, 0.5], armL: [0.18, 0.48], armRK: 1, armLK: 1,
      }} />
      <Person p={[1.75 + pullOsc, 0, 0]} h={3.4} look={prefrontal} f={f} pose={{
        mood: "angry", tilt: 0.22, nerv: 0.4, sweat: 0.8, lookX: -0.8,
        armL: [-0.3, 0.5], armR: [-0.18, 0.48], armRK: 1, armLK: 1,
      }} />
    </>) : (<>
      <Lights warm="#ffd9a8" />
      <CafeShell t={t} f={f} doorOpen={0.1} steam={t} />
      <Person p={[5.8, 0, -0.5]} h={3.95} look={barista} f={f} pose={{ mood: "smile", lookX: -0.85 }} />
      <Person p={heroP} h={3.5} look={hero} f={f} pose={{
        mood: "smile", lookX: 0.4,
        armR: [0.28, 0.56], armL: [-0.05, 0.5], armRK: 1, armLK: 1,
      }} />
      <Receipt p={[rHand[0] + 0.45, rHand[1] + 0.12, rHand[2] + 0.18]} rot={[0, -0.2, 0.06]} s={[0.88, 1.65]} scaleY={recUnroll} />
    </>)}
  </>);
};

const CUTS = [0, 4.70, 10.10, 19.55, 26.25, 32.60, 38.10, 45.45];
export const DejaVu: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={CUTS[0]} end={CUTS[1]} bg="#4a281c">{(c) => <S1 {...c} />}</Scene>
      <Scene start={CUTS[1]} end={CUTS[2]} bg="#122d36" trans="whip">{(c) => <S2 {...c} />}</Scene>
      <Scene start={CUTS[2]} end={CUTS[3]} bg="#102038" trans="zoom">{(c) => <S3 {...c} />}</Scene>
      <Scene start={CUTS[3]} end={CUTS[4]} bg="#1c1442" trans="ghost">{(c) => <S4 {...c} />}</Scene>
      <Scene start={CUTS[4]} end={CUTS[5]} bg="#240b36" trans="flash">{(c) => <S5 {...c} />}</Scene>
      <Scene start={CUTS[5]} end={CUTS[6]} bg="#081c38" trans="whip">{(c) => <S6 {...c} />}</Scene>
      <Scene start={CUTS[6]} end={CUTS[7]} bg="#160c2e" trans="zoom">{(c) => <S7 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={
        t < CUTS[1] ? "rgba(255,170,80,.06)" :
        t < CUTS[2] ? "rgba(40,200,210,.06)" :
        t < CUTS[3] ? "rgba(40,120,255,.09)" :
        t < CUTS[4] ? "rgba(130,60,255,.10)" :
        t < CUTS[5] ? "rgba(255,60,150,.08)" :
        t < CUTS[6] ? "rgba(40,180,255,.08)" :
        t < 43.18 ? "rgba(200,60,180,.08)" : "rgba(255,190,100,.06)"
      } />
      <Captions />
    </AbsoluteFill>
  );
};
