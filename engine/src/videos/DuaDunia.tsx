// Dua Dunia — Stick-in-3D vertical video (9:16, 720x1280, 30fps, 74.33s / 2232 frames).
// S1 0.00-5.60: Alarm pagi buta, kamar kos sempit, Budi bangun bukan karena segar tapi takut telat.
// S2 5.60-12.20: Dua jam di jalan, KRL padat, desak-desakan, belum sampai kantor.
// S3 12.20-19.10: Kantor open-space, kerja nonstop, makan sambil meeting, deadline, nangis dalam hati.
// S4 19.10-28.60: Pulang malam, kos 3x3, dinding tipis berisik, sendirian di kota jutaan orang.
// S5 28.60-35.80: HP bergetar, Ibu telepon ("kapan pulang?"), tenggorokan terasa berat.
// S6 35.80-49.00: Flashback kampung: sawah, kabut tipis, ayam, sarapan meja kayu, ibu & ayah.
// S7 49.00-56.10: Malam itu Budi buka laptop, cari tiket kereta, 1 kursi tersisa, dia beli.
// S8 56.10-64.50: Kereta bergerak, gedung hilang, pohon muncul, langit besar, Budi tidur nyenyak.
// S9 64.50-74.33: Stasiun kecil, Ayah tunggu, pelukan cukup, sukses soal pulang ke mana.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, SceneFog, Desk, Clock, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, WallDoor, SideWall, Ceiling, CornerPillar, PropShadow, Glow, Shaft, Plant, Shelf, Frame, WindowCity, Lamp, PendantLamp, WallSconce, Monitor, Chair, Cabinet, Rug, Dust } from "../style/props";
import { Cam, Key, camAt, FaceGroup, hand, Building, StreetLamp, Bench, Mug, Stars, SpeechBubble } from "../style/extra";
import { HoloCard, Callout, StatMeter, SignalArc, StreetBackdrop } from "../style/explainer";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const posMod = (n: number, m: number) => ((n % m) + m) % m;

// --- Characters ---
const budi: Look = { skin: "#fbe3c8", body: "#3a6fd8", outfit: "shirt", hair: "short", hairColor: "#1b1b2a", shoe: "#1b1b2a" };
const budiKampung: Look = { skin: "#fbe3c8", body: "#38a169", outfit: "hoodie", hair: "short", hairColor: "#1b1b2a", shoe: "#5a3214" };
const ibu: Look = { skin: "#e6b892", body: "#d94a4a", outfit: "shirt", hair: "bob", hairColor: "#2a1a12", shoe: "#1b1b2a" };
const ayah: Look = { skin: "#d4a574", body: "#5c6b4a", outfit: "shirt", hair: "grey", hairColor: "#808080", shoe: "#2b1810" };
const crowd1: Look = { skin: "#e0c4a8", body: "#4a5568", outfit: "suit", tie: "#2b3350", hair: "swept", hairColor: "#2d3748", shoe: "#111" };
const crowd2: Look = { skin: "#c89e78", body: "#5a6478", outfit: "blazer", hair: "short", hairColor: "#222", shoe: "#111" };
const crowd3: Look = { skin: "#fbe3c8", body: "#6b7280", outfit: "hoodie", hair: "bob", hairColor: "#4a2a18", shoe: "#222" };

// --- Scene wrapper ---
const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.32, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 720 : 0, blur = !first && trans === "whip" ? (1 - ke) * 14 : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.32) contrast(1.07) brightness(1.02)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 58%, rgba(5,8,20,0.28) 100%)" }} />
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};

/* Reusable Kos 3x3 Shell (used in S1, S4, S5, S7) */
const KosShell: React.FC<{ t: number; night?: boolean; lampOn?: boolean }> = ({ t, night = false, lampOn = false }) => {
  const wallA = night ? "#2b3048" : "#49506a", wallB = night ? "#22273c" : "#3f465e";
  const trim = night ? "#1b2033" : "#2e3448";
  return (<>
    <StreetBackdrop p={[0, 3.8, -11]} s={[18, 9]} dusk />
    <Floor kind="concrete" a={night ? "#262a3d" : "#404558"} b={night ? "#1f2334" : "#363b4c"} w={16} d={16} />
    <WallDoor z={-4.5} W={14} kind="concrete" a={wallA} b={wallB} door={{ x: -3.4, w: 2.0, h: 4.0 }} base={trim} crown={trim} />
    <Box p={[-3.4, 2.0, -4.45]} s={[1.95, 3.95, 0.14]} color={night ? "#3d2b1f" : "#61422e"} line={3} />
    <Box p={[-2.65, 1.9, -4.34]} s={[0.18, 0.08, 0.1]} color="#d8b24a" line={2} />
    <SideWall x={-5.2} kind="concrete" a={wallA} b={wallB} d={16} base={trim} crown={trim} />
    <SideWall x={5.2} kind="concrete" a={wallA} b={wallB} d={16} base={trim} crown={trim} />
    <Ceiling y={6.8} w={14} d={16} color={night ? "#191c2b" : "#32374a"} beams={trim} beamCount={3} />
    <CornerPillar p={[-5.0, 0, -4.3]} h={6.8} color={trim} />
    <CornerPillar p={[5.0, 0, -4.3]} h={6.8} color={trim} />
    <WindowCity p={[1.5, 4.1, -4.42]} s={[2.3, 1.8]} dusk />
    <CanvasPlane p={[-1.0, 4.4, -4.42]} s={[1.1, 1.3]} px={[220, 260]} frame={INK} draw={(c, W, H) => {
      c.fillStyle = "#f4efe6"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#e23b3b"; c.fillRect(0, 0, W, 62);
      c.fillStyle = "#fff"; c.font = "900 32px Inter, Arial"; c.textAlign = "center"; c.fillText("JAKARTA", W / 2, 42);
      c.fillStyle = INK; c.font = "900 96px Inter, Arial"; c.fillText("14", W / 2, 165);
    }} />
    <Frame p={[-5.12, 4.0, -0.8]} s={[1.3, 1.0]} rot={[0, Math.PI / 2, 0]} art={2} />
    <PropShadow p={[-0.2, 0, 0]} s={[3.2, 4.6]} o={0.42} />
    <Box p={[-0.2, 0.14, 0]} s={[2.6, 0.28, 4.1]} color={night ? "#36445e" : "#566a8c"} />
    <Box p={[-0.2, 0.32, -1.35]} s={[1.6, 0.16, 0.8]} color={night ? "#5c6b85" : "#8ba0c4"} />
    <Box p={[-0.2, 0.30, 0.65]} s={[2.4, 0.08, 2.4]} color={night ? "#2d3c56" : "#445c82"} />
    <PropShadow p={[1.65, 0, -0.8]} s={[1.3, 1.1]} o={0.35} />
    <Box p={[1.65, 0.38, -0.8]} s={[1.0, 0.76, 0.9]} color="#6b482e" />
    <Cyl p={[1.9, 1.05, -0.95]} rt={0.11} h={0.58} color="#7ec8ff" line={2} />
    <Mug p={[1.4, 0.94, -0.6]} s={0.8} color="#e2e8f0" />
    <Rug p={[-0.2, 0, 2.4]} s={[2.4, 1.4]} a={night ? "#2a324b" : "#445275"} b={night ? "#475569" : "#64748b"} />
    <Box p={[-2.2, 0.25, -1.6]} s={[0.8, 0.45, 0.7]} color="#7a583b" />
    <Box p={[-2.4, 0.42, 1.2]} s={[0.75, 0.82, 0.45]} color="#1e293b" />
    <Box p={[-1.8, 0.06, 2.6]} s={[0.28, 0.08, 0.55]} color="#94a3b8" line={2} />
    <Box p={[-1.4, 0.06, 2.7]} s={[0.28, 0.08, 0.55]} color="#94a3b8" line={2} />
    <PendantLamp p={[0, 6.8, -0.2]} drop={1.7} color={lampOn ? "#f4b942" : "#475569"} glow={lampOn} />
    <WallSconce p={[-5.12, 3.8, 1.2]} color={lampOn ? "#ffd984" : "#64748b"} />
    <Plant p={[4.1, 0, -3.3]} s={0.95} pot="#7c4a2d" />
    <Dust t={t} n={8} area={[3.5, 4.5, 3]} color={lampOn ? "rgba(255,220,150,0.45)" : "rgba(130,155,210,0.35)"} />
  </>);
};

/* ======= S1 0.00-5.60: Alarm pagi buta, kamar kos sempit ======= */
const S1 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 0.0, pos: [1.6, 1.7, 6.8], look: [0.2, 2.2, -0.3], fov: 66 },
    { t: 1.8, pos: [0.9, 2.1, 5.6], look: [0.1, 2.3, -0.2], fov: 60 },
    { t: 4.5, pos: [0.2, 2.3, 4.7], look: [0.0, 2.4, 0.0], fov: 56 },
    { t: 5.6, pos: [0.1, 2.3, 4.5], look: [0.0, 2.4, 0.0], fov: 56 },
  ];
  const alarmRing = t > 1.5 && t < 3.1;
  const ringShake = alarmRing ? Math.sin(t * 48) * 0.05 : 0;
  const wakeK = seg(t, 2.4, 3.6, Easing.out(Easing.back(1.4)));
  const cardK = seg(t, 0.5, 1.0, Easing.out(Easing.back(1.8))) * (1 - seg(t, 4.4, 4.7));
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#7a98e0" cool="#1b2559" ambient={1.0} keyInt={0.75} />
    <SceneFog color="#0a1230" near={8} far={24} />
    <KosShell t={t} />
    {/* Alarm clock on crate */}
    <group position={[1.55 + ringShake, 1.18, -0.85]}>
      <Clock p={[0, 0, 0]} r={0.38} t={t} speed={alarmRing ? 8 : 0.3} />
      <Glow p={[0, 0, 0.12]} r={alarmRing ? 1.5 : 0.55} color="rgba(255,65,65,0.95)" o={alarmRing ? 0.55 + 0.35 * Math.sin(t * 28) : 0.25} />
    </group>
    {alarmRing ? <SpeechBubble p={[1.15, 2.05, -0.7]} s={[1.05, 0.58]} text="KRING!" bg="#fee2e2" fg="#b91c1c" /> : null}
    <HoloCard p={[-0.65, 4.25, -1.3]} s={[2.1, 1.15]} title="04:30 WIB" lines={["Tidur: 4 jam", "Takut telat!"]} accent="#f87171" k={cardK} face />
    <Person p={[-0.2, 0.28, 0.1]} h={3.25} look={budi} f={f} pose={{
      mood: t < 1.65 ? "sleep" : t < 3.5 ? "shock" : "worry",
      hunch: lerp(0.55, 0.12, wakeK),
      arms: t > 1.7 && t < 3.1 ? "head" : "down",
      armK: seg(t, 1.7, 2.2) * (1 - seg(t, 2.8, 3.3)),
      nerv: seg(t, 4.2, 5.2) * 0.4,
      sweat: seg(t, 4.5, 5.4) * 0.5,
      squash: t > 2.4 && t < 3.0 ? Math.sin((t - 2.4) * 5) * 0.06 : 0,
    }} />
  </>);
};

/* ======= S2 5.60-12.20: KRL padat, 2 jam di jalan ======= */
const S2 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 5.5, pos: [-0.9, 2.7, 7.2], look: [0.0, 2.5, -0.5], fov: 66 },
    { t: 8.2, pos: [0.2, 2.6, 6.2], look: [0.0, 2.5, -0.3], fov: 62 },
    { t: 10.6, pos: [0.1, 2.5, 5.3], look: [0.0, 2.5, -0.1], fov: 58 },
    { t: 12.2, pos: [0.0, 2.5, 5.0], look: [0.0, 2.5, 0.0], fov: 56 },
  ];
  const sway = Math.sin(t * 2.3) * 0.05;
  const scrollX = (t - 5.6) * 14;
  const cardK = seg(t, 10.5, 11.0, Easing.out(Easing.back(1.6))) * (1 - seg(t, 11.4, 11.7));
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#cbd5e1" cool="#64748b" ambient={1.25} keyInt={0.8} />
    <SceneFog color="#94a3b8" near={10} far={28} />
    <Stars p={[0, 12, -26]} s={[70, 26]} t={t} top="#475569" bottom="#cbd5e1" n={0} />
    {[-18, -10, -2, 6, 14, 22].map((bx, i) => {
      const px = posMod(bx - scrollX, 40) - 20;
      return <Building key={i} p={[px, 0, -10 - (i % 2) * 3]} s={[4.2, 9 + (i % 3) * 3, 4]} color={i % 2 ? "#475569" : "#64748b"} lit={0.25} />;
    })}
    <Floor kind="slate" a="#64748b" b="#526071" w={22} d={16} />
    <Ceiling y={6.8} w={22} d={16} color="#e2e8f0" beams="#94a3b8" beamCount={4} />
    <Box p={[0, 1.0, -3.8]} s={[22, 2.0, 0.25]} color="#cbd5e1" />
    <Box p={[0, 5.9, -3.8]} s={[22, 1.8, 0.25]} color="#cbd5e1" />
    {[-7.5, -2.5, 2.5, 7.5].map((x) => <Box key={x} p={[x, 3.5, -3.8]} s={[1.1, 3.2, 0.28]} color="#94a3b8" />)}
    <CanvasPlane p={[0, 5.5, -3.62]} s={[4.4, 0.65]} px={[560, 84]} frame={INK} draw={(c, W, H) => {
      c.fillStyle = "#1e293b"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#facc15"; c.font = "900 34px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("KRL COMMUTER • PADAT", W / 2, H / 2 + 2);
    }} />
    <Cyl p={[0, 5.4, -0.5]} rt={0.045} h={16} color="#94a3b8" line={2} rot={[0, 0, Math.PI / 2]} />
    <Cyl p={[0, 5.4, 1.8]} rt={0.045} h={16} color="#94a3b8" line={2} rot={[0, 0, Math.PI / 2]} />
    {[-2.4, -1.2, 0, 1.2, 2.4].map((x, i) => (
      <group key={i} position={[x + sway * 1.4, 4.9, -0.5]}>
        <Cyl p={[0, 0.22, 0]} rt={0.025} h={0.45} color="#334155" line={1} />
        <Box p={[0, -0.04, 0]} s={[0.24, 0.22, 0.06]} color="#e2e8f0" line={2} />
      </group>
    ))}
    <Cyl p={[-1.4, 3.4, 0.6]} rt={0.06} h={6.8} color="#cbd5e1" line={2} />
    <Cyl p={[1.6, 3.4, -1.2]} rt={0.06} h={6.8} color="#cbd5e1" line={2} />
    <Box p={[-5.0, 0.6, -3.1]} s={[3.8, 0.22, 1.1]} color="#2563eb" />
    <Box p={[5.0, 0.6, -3.1]} s={[3.8, 0.22, 1.1]} color="#2563eb" />
    {/* Centered StatMeter & HoloCard */}
    <StatMeter p={[0.0, 4.55, -2.9]} s={[2.5, 0.72]} label="KAPASITAS" value={0.98} color="#ef4444" />
    <HoloCard p={[0.0, 4.05, -0.5]} s={[2.2, 1.12]} title="2 JAM MACET" lines={["Berdiri penuh", "Belum sampai!"]} accent="#fbbf24" k={cardK} face />
    {/* Tighter crowd spacing so all characters sit cleanly inside 9:16 */}
    <Person p={[-1.6 + sway, 0, -1.8]} h={3.1} look={crowd1} f={f} pose={{ mood: "deadpan", hunch: 0.12 }} />
    <Person p={[1.6 + sway, 0, -1.6]} h={3.1} look={crowd2} f={f} pose={{ mood: "deadpan", flip: true }} />
    <Person p={[-1.1 + sway, 0, 0.2]} h={3.2} look={crowd3} f={f} pose={{ mood: "worry", armL: [-0.15, 1.05], armLK: 0.8 }} />
    <Person p={[1.15 + sway, 0, 0.3]} h={3.25} look={crowd1} f={f} pose={{ mood: "deadpan", flip: true, armR: [0.18, 1.05], armRK: 0.8 }} />
    <Person p={[-1.85 + sway, 0, 1.8]} h={3.0} look={crowd2} f={f} pose={{ mood: "deadpan", hunch: 0.18 }} />
    <Person p={[1.8 + sway, 0, 1.9]} h={3.0} look={crowd3} f={f} pose={{ mood: "worry", flip: true }} />
    <Person p={[sway, 0, -0.3]} h={3.45} look={budi} f={f} pose={{
      mood: "worry",
      hunch: 0.16,
      armR: [0.18, 1.08], armRK: 0.9,
      nerv: 0.3,
      sweat: seg(t, 8.0, 11.2) * 0.65,
      tilt: sway * 0.5,
    }} />
  </>);
};

/* ======= S3 12.20-19.10: Kantor open-space, makan sambil meeting, deadline ======= */
const S3 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 12.1, pos: [1.2, 5.0, 7.8], look: [0.0, 2.2, -0.5], fov: 66 },
    { t: 14.5, pos: [-0.6, 3.0, 6.2], look: [0.1, 2.2, 0.0], fov: 60 },
    { t: 17.2, pos: [-0.2, 2.7, 5.5], look: [0.0, 2.3, 0.0], fov: 56 },
    { t: 19.1, pos: [-0.1, 2.6, 5.3], look: [0.0, 2.3, 0.0], fov: 56 },
  ];
  const typing = t < 16.5;
  const crying = seg(t, 16.8, 18.0);
  const energy = lerp(0.55, 0.08, seg(t, 13.0, 18.2));
  const deadK = seg(t, 15.8, 16.4, Easing.out(Easing.back(1.8))) * (1 - seg(t, 18.1, 18.4));
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#f8fafc" cool="#bfdbfe" ambient={1.6} keyInt={1.1} />
    <SceneFog color="#e2e8f0" near={12} far={30} />
    <StreetBackdrop p={[4.5, 4.2, -12]} s={[16, 9]} />
    <Floor kind="tile" a="#e2e8f0" b="#cbd5e1" w={24} d={24} />
    <WallDoor z={-6.5} W={24} kind="wainscot" a="#f1f5f9" b="#e2e8f0" door={{ x: -5.5, w: 2.4, h: 4.3 }} base="#64748b" crown="#94a3b8" />
    <SideWall x={-8.0} kind="plain" a="#e2e8f0" b="#cbd5e1" d={24} base="#64748b" crown="#94a3b8" />
    <SideWall x={8.0} kind="plain" a="#e2e8f0" b="#cbd5e1" d={24} base="#64748b" crown="#94a3b8" />
    <Ceiling y={8.0} w={24} d={24} color="#f8fafc" beams="#cbd5e1" beamCount={4} />
    <CornerPillar p={[-7.8, 0, -6.3]} h={8.0} color="#94a3b8" />
    <CornerPillar p={[7.8, 0, -6.3]} h={8.0} color="#94a3b8" />
    <WindowCity p={[3.8, 4.3, -6.42]} s={[4.2, 3.0]} />
    <Clock p={[-1.2, 5.7, -6.42]} r={0.6} t={t} speed={4} />
    <Frame p={[-7.92, 4.5, -2.0]} s={[1.6, 1.1]} rot={[0, Math.PI / 2, 0]} art={0} />
    <Desk p={[-4.8, 0, -2.5]} w={3.0} top="#f8fafc" leg="#94a3b8" />
    <Monitor p={[-4.8, 1.1, -2.9]} s={0.85} />
    <Person p={[-4.8, 0, -3.5]} h={3.0} look={crowd1} f={f} pose={{ mood: "deadpan", arms: "point", armK: 0.4 }} />
    <Desk p={[4.8, 0, -2.8]} w={3.0} top="#f8fafc" leg="#94a3b8" />
    <Monitor p={[4.8, 1.1, -3.2]} s={0.85} />
    <Person p={[4.8, 0, -3.8]} h={3.0} look={crowd2} f={f} pose={{ mood: "deadpan", flip: true }} />
    <Cabinet p={[-7.2, 0, -5.2]} w={1.5} h={2.3} />
    <Plant p={[7.0, 0, -5.4]} s={1.2} />
    <Shelf p={[7.3, 0, -1.5]} w={1.2} rows={4} seed={3} wood="#475569" />
    <PendantLamp p={[0, 8.0, 0]} drop={2.0} color="#3b82f6" />
    <PendantLamp p={[-4.8, 8.0, -2.5]} drop={2.0} color="#64748b" />
    <Rug p={[0, 0, 0.2]} s={[5.2, 4.0]} a="#cbd5e1" b="#94a3b8" />
    <Person p={[-0.35, 0, -0.35]} h={3.45} look={budi} f={f} pose={{
      mood: crying > 0.3 ? "worry" : "deadpan",
      arms: crying > 0.3 ? "head" : typing ? "hold" : "down",
      armK: crying > 0.3 ? crying : 0.75,
      hunch: lerp(0.18, 0.38, crying),
      nerv: crying * 0.55,
      sweat: crying * 0.7,
    }} />
    <PropShadow p={[0.1, 0, 0.7]} s={[3.8, 2.0]} />
    <Desk p={[0.1, 0, 0.7]} w={3.6} d={1.4} top="#f8fafc" leg="#64748b" />
    <Monitor p={[1.1, 1.1, 0.65]} rot={[0, -0.55, 0]} s={0.9} screen={crying > 0.3 ? "#7f1d1d" : "#1e3a8a"} />
    <Box p={[-0.95, 1.18, 0.85]} s={[0.65, 0.18, 0.45]} color="#f59e0b" line={2} />
    <Box p={[-0.95, 1.28, 0.85]} s={[0.48, 0.06, 0.32]} color="#fef3c7" line={1} />
    <Mug p={[-0.35, 1.28, 0.95]} s={0.85} color="#3b82f6" />
    <Chair p={[-0.35, 0, -1.3]} rotY={0} color="#1e3a8a" />
    {/* Compact, centered HUD panels that fit cleanly in 9:16 */}
    <StatMeter p={[-0.95, 4.3, -1.4]} s={[1.85, 0.6]} label="ENERGI" value={energy} color={energy < 0.25 ? "#ef4444" : "#f59e0b"} />
    <HoloCard p={[1.05, 4.15, -1.4]} s={[2.0, 1.15]} title="DEADLINE!" lines={["12:00 Meeting", "14:00 Revisi", "Nangis di hati"]} accent="#ef4444" k={deadK} face />
    <Dust t={t} n={8} area={[5, 6, 4]} color="rgba(220,230,255,0.4)" />
  </>);
};

/* ======= S4 19.10-28.60: Kos malam, dinding tipis berisik, sendirian ======= */
const S4 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 19.0, pos: [0.6, 2.4, 5.2], look: [-0.2, 2.1, 0.0], fov: 58 },
    { t: 22.8, pos: [-0.3, 2.4, 5.4], look: [-0.6, 2.2, 0.0], fov: 60 },
    { t: 26.2, pos: [-0.3, 3.3, 6.8], look: [0.0, 2.2, -1.0], fov: 64 },
    { t: 28.6, pos: [-0.2, 3.5, 7.2], look: [0.0, 2.2, -1.0], fov: 64 },
  ];
  const noiseOn = t > 22.2 && t < 25.2;
  const noisePulse = noiseOn ? Math.abs(Math.sin(t * 14)) : 0;
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#334175" cool="#0f172a" ambient={0.72} keyInt={0.45} />
    <SceneFog color="#080e24" near={7} far={22} />
    <KosShell t={t} night />
    <Cyl p={[1.65, 0.94, -1.05]} rt={0.16} rb={0.12} h={0.32} color="#ef4444" line={2} />
    {noiseOn ? <>
      <Callout from={[-2.6, 3.2, -1.2]} to={[-1.05, 4.1, -0.4]} label="BERISIK!" accent="#f87171" k={seg(t, 22.4, 23.2)} />
      <Glow p={[-4.5, 2.9, 0.0]} r={1.8} color="rgba(248,113,113,0.7)" o={0.25 + 0.35 * noisePulse} />
    </> : null}
    <Person p={[-0.2, 0.28, 0.2]} h={3.2} look={budi} f={f} pose={{
      mood: t > 25.0 ? "worry" : "deadpan",
      hunch: 0.42,
      arms: "chest",
      armK: 0.55,
      lookX: noiseOn ? -0.6 : Math.sin(t * 0.5) * 0.25,
    }} />
  </>);
};

/* ======= S5 28.60-35.80: HP bergetar, Ibu telepon, tenggorokan berat ======= */
const S5 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 28.5, pos: [1.0, 1.9, 3.8], look: [1.3, 1.0, -0.3], fov: 56 },
    { t: 30.2, pos: [0.2, 2.4, 5.0], look: [0.0, 2.3, 0.0], fov: 58 },
    { t: 33.4, pos: [-0.2, 2.5, 4.5], look: [-0.1, 2.3, 0.1], fov: 52 },
    { t: 35.8, pos: [-0.2, 2.5, 4.2], look: [-0.1, 2.3, 0.1], fov: 50 },
  ];
  const cam = camAt(t, camKeys);
  const vib = t < 29.8 ? Math.sin(t * 48) * 0.05 : 0;
  const pickK = seg(t, 29.6, 30.6, Easing.out(Easing.cubic));
  const warmK = seg(t, 29.2, 33.0);
  const budiP: V3 = [-0.2, 0.28, 0.2];
  const phoneGoal: [number, number] = [0.32, 0.74];
  const phoneStart: [number, number] = [0.55, 0.18];
  const curHand: [number, number] = [lerp(phoneStart[0], phoneGoal[0], pickK), lerp(phoneStart[1], phoneGoal[1], pickK)];
  const hLoc = hand(3.25, curHand);
  const callCardK = seg(t, 30.7, 31.2, Easing.out(Easing.back(1.8))) * (1 - seg(t, 33.6, 34.0));
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm={warmK > 0.4 ? "#ffd27d" : "#475580"} cool="#1e293b" ambient={lerp(0.75, 1.05, warmK)} keyInt={lerp(0.5, 0.9, warmK)} />
    <SceneFog color="#0c1428" near={7} far={22} />
    <KosShell t={t} night lampOn={warmK > 0.5} />
    {t < 29.6 ? (
      <group position={[1.4 + vib, 0.80, -0.5]}>
        <Box p={[0, 0, 0]} s={[0.24, 0.05, 0.44]} color="#111827" line={2} />
        <Box p={[0, 0.03, 0]} s={[0.20, 0.01, 0.36]} color="#fde047" line={1} />
        <Glow p={[0, 0.15, 0]} r={1.1} color="rgba(253,224,71,0.9)" o={0.6} />
        <SignalArc from={[0, 0.1, 0]} to={[-1.2, 1.4, 0.6]} arcH={0.7} t={t} speed={2.2} color="#fde047" />
      </group>
    ) : (
      <FaceGroup p={budiP}>
        <Box p={hLoc} s={[0.14, 0.28, 0.06]} color="#111827" line={2} />
        <Glow p={hLoc} r={0.85} color="rgba(255,215,120,0.9)" o={0.55} />
      </FaceGroup>
    )}
    <HoloCard
      p={[0.15, 4.1, -0.4]}
      s={[2.35, 1.15]}
      title="TELEPON: IBU"
      lines={['"Budi, kapan pulang?"', '"Ayah tanya terus."']}
      accent="#fbbf24"
      bg="#1c1917"
      k={callCardK}
      face
    />
    <Person p={budiP} h={3.25} look={budi} f={f} pose={{
      mood: t > 33.6 ? "gulp" : "worry",
      hunch: lerp(0.18, 0.32, seg(t, 33.5, 35.0)),
      armR: curHand, armRK: seg(t, 29.3, 29.8),
      nerv: seg(t, 33.6, 35.4) * 0.35,
      sweat: seg(t, 34.0, 35.5) * 0.45,
      lookX: cam.pos[0] * 0.05,
    }} />
  </>);
};

/* ======= S6 35.80-49.00: Flashback kampung — sawah, kabut, ayam, sarapan ======= */
const S6 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 35.7, pos: [0.0, 3.6, 10.4], look: [0.0, 2.2, -3.0], fov: 68 },
    { t: 39.2, pos: [1.5, 2.8, 8.2], look: [0.6, 2.0, -0.5], fov: 64 },
    { t: 42.5, pos: [-0.2, 2.7, 7.2], look: [0.0, 2.1, 0.5], fov: 62 },
    { t: 46.2, pos: [0.0, 2.9, 7.6], look: [0.0, 2.2, 0.0], fov: 62 },
    { t: 49.0, pos: [-0.2, 3.1, 7.8], look: [0.0, 2.2, 0.0], fov: 62 },
  ];
  const mistDrift = Math.sin(t * 0.6) * 1.2;
  const roosterBob = Math.abs(Math.sin(t * 6)) * (t > 38.8 && t < 40.5 ? 0.18 : 0.02);
  const ibuScold = seg(t, 42.3, 44.0);
  const ayahLaugh = seg(t, 44.3, 45.6);
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#ffe699" cool="#86efac" ambient={1.65} keyInt={1.35} />
    <SceneFog color="#dcfce7" near={14} far={42} />
    <Stars p={[0, 14, -34]} s={[70, 28]} t={t} top="#60a5fa" bottom="#fde68a" n={0} />
    <Ball p={[-4.5, 9.5, -28]} r={2.2} color="#fef08a" ink={0.0} />
    <Glow p={[-4.5, 9.5, -27]} r={6.0} color="rgba(254,240,138,0.85)" o={0.75} />
    <Box p={[-8, 2.5, -22]} s={[16, 6, 3]} color="#6ee7b7" />
    <Box p={[7, 3.0, -24]} s={[18, 7, 3]} color="#34d399" />
    <Box p={[0, 0.25, -14]} s={[34, 0.5, 8]} color="#4ade80" />
    <Box p={[0, 0.55, -17]} s={[34, 0.5, 6]} color="#22c55e" />
    <Floor kind="plank" a="#84a955" b="#739846" w={32} d={24} unit={2.6} />
    <CanvasPlane p={[mistDrift, 1.8, -11]} s={[24, 2.4]} px={[256, 64]} draw={(c, W, H) => {
      c.clearRect(0, 0, W, H);
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, "rgba(255,252,240,0.45)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }} />
    <WallDoor z={-5.5} W={18} kind="wood" a="#a47148" b="#8b5e34" door={{ x: 0, w: 2.8, h: 4.0 }} base="#583118" crown="#6f4525" wainscot={["#bc8a5f", "#a47148"]} />
    <Ceiling y={6.8} w={18} d={10} color="#bc8a5f" beams="#583118" beamCount={3} />
    <CornerPillar p={[-8.6, 0, -5.3]} h={6.8} color="#6f4525" trim="#4a2810" />
    <CornerPillar p={[8.6, 0, -5.3]} h={6.8} color="#6f4525" trim="#4a2810" />
    <Frame p={[-4.5, 4.3, -5.42]} s={[1.8, 1.3]} art={0} frameColor="#583118" />
    <Plant p={[-6.8, 0, -4.0]} s={1.35} pot="#b45309" />
    <Plant p={[6.8, 0, -4.0]} s={1.35} pot="#b45309" />
    <Bench p={[-5.2, 0, -1.6]} rotY={0.3} />
    <group position={[3.6, 0, -3.5]}>
      <Cyl p={[0, 0.7, 0]} rt={0.14} h={1.4} color="#78350f" line={2} />
      <Ball p={[0, 1.65 + roosterBob, 0]} r={0.32} color="#f59e0b" />
      <Ball p={[0.18, 1.92 + roosterBob, 0.1]} r={0.18} color="#fffbeb" />
      <Box p={[0.22, 2.08 + roosterBob, 0.1]} s={[0.14, 0.14, 0.06]} color="#ef4444" line={1} />
      <Box p={[-0.3, 1.75 + roosterBob, 0]} s={[0.25, 0.3, 0.12]} color="#dc2626" line={1} />
      {t > 38.8 && t < 40.5 ? <SpeechBubble p={[-0.2, 2.75, 0]} s={[1.4, 0.65]} text="KOKOK!" bg="#fef9c3" fg="#854d0e" /> : null}
    </group>
    {/* Family behind table — tighter spacing so Ibu, Budi, Ayah all sit cleanly inside frame */}
    <Person p={[-1.38, 0, 0.25]} h={3.2} look={ibu} f={f} pose={{
      mood: ibuScold > 0.2 && ibuScold < 0.9 ? "angry" : "smile",
      arms: ibuScold > 0.2 ? "point" : "down",
      armK: ibuScold,
      lookX: 0.4,
    }} />
    <Person p={[0.0, 0, 0.2]} h={3.05} look={budiKampung} f={f} pose={{
      mood: "grin",
      arms: "down",
    }} />
    <Person p={[1.38, 0, 0.25]} h={3.35} look={ayah} f={f} pose={{
      mood: ayahLaugh > 0.2 ? "laugh" : "smile",
      arms: ayahLaugh > 0.2 ? "shrug" : "down",
      armK: ayahLaugh,
      lookX: -0.3,
    }} />
    <PropShadow p={[0, 0, 1.35]} s={[4.0, 2.2]} />
    <Desk p={[0, 0, 1.35]} w={3.8} d={1.6} top="#b47b44" leg="#6f4525" />
    <Cyl p={[-1.0, 1.16, 1.35]} rt={0.26} rb={0.18} h={0.12} color="#fffbeb" line={2} />
    <Cyl p={[0.0, 1.16, 1.35]} rt={0.26} rb={0.18} h={0.12} color="#fffbeb" line={2} />
    <Cyl p={[1.0, 1.16, 1.35]} rt={0.26} rb={0.18} h={0.12} color="#fffbeb" line={2} />
    <Mug p={[-1.4, 1.28, 1.15]} s={0.9} color="#ef4444" />
    <Mug p={[1.4, 1.28, 1.15]} s={0.9} color="#3b82f6" />
    <Cyl p={[0.45, 1.28, 1.1]} rt={0.22} rb={0.26} h={0.34} color="#78350f" line={2} />
    <Shaft p={[-1.2, 4.8, -1.5]} s={[3.8, 9]} rot={[0, 0, 0.25]} color="255,232,140" o={0.32} />
    <Dust t={t} n={16} area={[6, 5, 5]} color="rgba(255,236,150,0.6)" fall />
  </>);
};

/* ======= S7 49.00-56.10: Buka laptop, cari tiket kereta, dia beli ======= */
const S7 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 48.9, pos: [0.8, 2.8, 5.8], look: [0.0, 2.1, 0.0], fov: 62 },
    { t: 51.6, pos: [0.4, 2.5, 5.2], look: [0.1, 2.1, 0.0], fov: 58 },
    { t: 54.0, pos: [0.2, 2.4, 4.9], look: [0.1, 2.1, 0.0], fov: 56 },
    { t: 56.1, pos: [0.2, 2.4, 4.8], look: [0.1, 2.1, 0.0], fov: 56 },
  ];
  const ticketStep = seg(t, 52.2, 54.2);
  const boughtK = seg(t, 55.4, 55.9, Easing.out(Easing.back(2.0)));
  const cardK = seg(t, 50.2, 50.8, Easing.out(Easing.back(1.6)));
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#fbbf24" cool="#1e3a8a" ambient={0.95} keyInt={0.85} />
    <SceneFog color="#141828" near={8} far={24} />
    <KosShell t={t} night lampOn />
    {/* Budi clearly visible on left, reaching to raised laptop on right */}
    <Person p={[-0.75, 0.28, 0.15]} h={3.2} look={budi} f={f} pose={{
      mood: boughtK > 0.3 ? "smile" : "deadpan",
      hunch: 0.16,
      armR: [0.44, 0.44], armRK: 0.85,
      lookX: 0.55,
    }} />
    {/* Raised desk/crate so laptop sits cleanly above lower-third captions */}
    <PropShadow p={[0.8, 0, 0.3]} s={[1.6, 1.3]} />
    <Box p={[0.8, 0.62, 0.3]} s={[1.3, 1.24, 0.95]} color="#784b2a" />
    <group position={[0.75, 1.26, 0.3]} rotation={[0, -0.42, 0]}>
      <Box p={[0, 0.03, 0.12]} s={[1.05, 0.05, 0.72]} color="#334155" line={2} />
      <Box p={[0, 0.38, -0.26]} s={[1.05, 0.7, 0.05]} color="#1e293b" line={2} rot={[-0.22, 0, 0]} />
      <CanvasPlane p={[0, 0.38, -0.22]} rot={[-0.22, 0, 0]} s={[0.94, 0.6]} px={[360, 230]} draw={(c, W, H) => {
        c.fillStyle = "#0f172a"; c.fillRect(0, 0, W, H);
        c.fillStyle = "#38bdf8"; c.fillRect(0, 0, W, 44);
        c.fillStyle = "#0b0d1a"; c.font = "900 22px Inter, Arial"; c.textAlign = "center"; c.fillText("TIKET KERETA", W / 2, 29);
        c.fillStyle = "#f8fafc"; c.font = "800 20px Inter, Arial"; c.fillText("JUMAT MALAM", W / 2, 84);
        c.fillStyle = ticketStep > 0.5 ? "#fbbf24" : "#94a3b8";
        c.font = "900 26px Inter, Arial"; c.fillText("1 KURSI TERSISA", W / 2, 134);
        c.fillStyle = boughtK > 0.2 ? "#22c55e" : "#f97316";
        c.fillRect(55, 162, W - 110, 48);
        c.fillStyle = "#fff"; c.font = "900 24px Inter, Arial";
        c.fillText(boughtK > 0.2 ? "TERBELI ✓" : "BELI TIKET", W / 2, 193);
      }} />
      <Glow p={[0, 0.45, 0.1]} r={1.8} color="rgba(56,189,248,0.65)" o={0.35} />
    </group>
    <HoloCard
      p={[0.25, 3.85, -0.6]}
      s={[2.25, 1.25]}
      title="JUMAT MALAM"
      lines={[
        "Tujuan: Kampung",
        ticketStep > 0.4 ? "Sisa: 1 Kursi!" : "Mencari rute...",
        boughtK > 0.3 ? "Status: DIBELI ✓" : "Klik Pesan →",
      ]}
      accent={boughtK > 0.3 ? "#22c55e" : "#fb923c"}
      k={cardK}
      face
    />
  </>);
};

/* ======= S8 56.10-64.50: Kereta bergerak, gedung hilang, pohon muncul, tidur nyenyak ======= */
const S8 = ({ t, f }: Ctx) => {
  const prog = seg(t, 56.2, 63.6);
  const skyR = Math.round(lerp(22, 110, prog));
  const skyG = Math.round(lerp(30, 185, prog));
  const skyB = Math.round(lerp(72, 238, prog));
  const skyHex = `rgb(${skyR},${skyG},${skyB})`;
  const camKeys: Key[] = [
    { t: 56.0, pos: [0.5, 2.7, 5.2], look: [0.8, 2.8, -2.5], fov: 64 },
    { t: 59.5, pos: [0.1, 2.6, 4.8], look: [0.0, 2.6, -1.5], fov: 60 },
    { t: 62.6, pos: [-0.3, 2.5, 4.4], look: [-0.4, 2.4, -0.8], fov: 56 },
    { t: 64.5, pos: [-0.3, 2.5, 4.2], look: [-0.4, 2.4, -0.8], fov: 55 },
  ];
  const scrollX = (t - 56.1) * 11;
  const cityFade = 1 - seg(t, 57.2, 59.2);
  const treeScale = seg(t, 58.2, 60.2);
  const sleeping = t > 62.4;
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm={prog > 0.5 ? "#ffe8a3" : "#93c5fd"} cool="#1e293b" ambient={lerp(0.85, 1.55, prog)} keyInt={lerp(0.6, 1.2, prog)} />
    <SceneFog color={skyHex} near={12} far={38} />
    <Stars p={[0, 10, -28]} s={[70, 26]} t={t} top={prog > 0.45 ? "#38bdf8" : "#0f172a"} bottom={prog > 0.45 ? "#fef08a" : "#312e81"} n={prog < 0.45 ? 90 : 0} />
    {/* Distant hills & ground */}
    <Box p={[0, 0.2, -16]} s={[60, 0.6, 18]} color={prog > 0.45 ? "#4ade80" : "#334155"} />
    <Box p={[0, 1.4, -22]} s={[60, 2.4, 4]} color={prog > 0.45 ? "#86efac" : "#1e293b"} />
    {cityFade > 0.03 ? [-16, -9, -2, 5, 12, 19].map((bx, i) => {
      const px = posMod(bx - scrollX, 42) - 21;
      return <Building key={"b" + i} p={[px, 0, -10 - (i % 2) * 3]} s={[3.8, (8 + (i % 3) * 3) * cityFade, 3.8]} color="#475569" lit={0.45 * cityFade} />;
    }) : null}
    {treeScale > 0.03 ? [-18, -12, -6, 0, 6, 12, 18].map((tx, i) => {
      const px = posMod(tx - scrollX, 42) - 21;
      const sc = treeScale * (0.9 + (i % 3) * 0.25);
      return (
        <group key={"tr" + i} position={[px, 0.3, -8 - (i % 2) * 3]} scale={[sc, sc, sc]}>
          <Cyl p={[0, 1.6, 0]} rt={0.22} h={3.2} color="#5c3a21" line={2} />
          <Ball p={[0, 3.5, 0]} r={1.45} color={i % 2 ? "#22c55e" : "#16a34a"} />
        </group>
      );
    }) : null}
    <Floor kind="carpet" a="#334155" b="#1e293b" w={16} d={14} />
    <Ceiling y={6.8} w={16} d={14} color="#e2e8f0" beams="#94a3b8" beamCount={3} />
    <Box p={[0, 1.0, -3.6]} s={[16, 2.0, 0.3]} color="#cbd5e1" />
    <Box p={[0, 6.0, -3.6]} s={[16, 1.6, 0.3]} color="#cbd5e1" />
    <Box p={[-5.2, 3.6, -3.6]} s={[4.4, 3.4, 0.3]} color="#94a3b8" />
    <Box p={[5.2, 3.6, -3.6]} s={[4.4, 3.4, 0.3]} color="#94a3b8" />
    <Box p={[0, 5.2, -3.35]} s={[6.2, 0.16, 0.3]} color="#475569" />
    <Box p={[-1.4, 5.55, -3.3]} s={[1.1, 0.55, 0.45]} color="#1e293b" />
    <SideWall x={-5.8} kind="wainscot" a="#cbd5e1" b="#94a3b8" d={14} />
    <SideWall x={5.8} kind="wainscot" a="#cbd5e1" b="#94a3b8" d={14} />
    {/* Teal-slate train seat so Budi's blue shirt contrasts cleanly */}
    <PropShadow p={[-0.6, 0, -0.8]} s={[3.0, 2.0]} />
    <Box p={[-0.6, 0.55, -0.9]} s={[2.4, 0.3, 1.6]} color="#0f766e" />
    <Box p={[-0.6, 1.45, -1.6]} s={[2.4, 1.5, 0.28]} color="#0f766e" />
    <Box p={[1.5, 0.95, -0.8]} s={[1.0, 0.12, 0.9]} color="#e2e8f0" />
    <Mug p={[1.5, 1.18, -0.8]} s={0.8} color="#f59e0b" />
    {prog > 0.55 ? <Shaft p={[0.4, 3.8, -1.5]} s={[3.2, 7.5]} rot={[0, 0, 0.35]} color="255,238,165" o={(prog - 0.55) * 0.65} /> : null}
    <Dust t={t} n={10} area={[4, 4, 3]} color="rgba(255,240,180,0.45)" />
    <Person p={[-0.6, 0.7, -0.8]} h={3.15} look={budi} f={f} pose={{
      mood: sleeping ? "sleep" : "smile",
      arms: "chest",
      armK: 0.45,
      tilt: sleeping ? 0.08 : 0.02,
      hunch: 0.14,
      lookX: 0.35,
    }} />
  </>);
};

/* ======= S9 64.50-74.33: Stasiun kecil, Ayah tunggu, pelukan cukup ======= */
const S9 = ({ t, f }: Ctx) => {
  const camKeys: Key[] = [
    { t: 64.4, pos: [0.6, 2.6, 8.5], look: [0.0, 2.2, -1.0], fov: 66 },
    { t: 67.6, pos: [0.2, 2.4, 5.4], look: [0.0, 2.3, 0.2], fov: 56 },
    { t: 70.0, pos: [0.0, 2.5, 5.0], look: [0.0, 2.4, 0.2], fov: 55 },
    { t: 74.3, pos: [0.0, 3.6, 8.8], look: [0.0, 2.4, -1.0], fov: 64 },
  ];
  const walkK = seg(t, 65.0, 67.6, Easing.inOut(Easing.sin));
  const budiX = lerp(4.6, 0.58, walkK);
  const hugging = t >= 67.6;
  const hugK = seg(t, 67.6, 68.3, Easing.out(Easing.cubic));
  const dist = Math.abs(4.6 - budiX);
  return (<>
    <Cam t={t} keys={camKeys} />
    <Lights warm="#ffe099" cool="#fde68a" ambient={1.65} keyInt={1.35} />
    <SceneFog color="#fef3c7" near={16} far={46} />
    <Stars p={[0, 15, -34]} s={[80, 30]} t={t} top="#f59e0b" bottom="#fef3c7" n={0} />
    <Box p={[-9, 3.0, -24]} s={[18, 7, 3]} color="#6ee7b7" />
    <Box p={[9, 3.5, -24]} s={[18, 8, 3]} color="#34d399" />
    <Floor kind="concrete" a="#d6cbb8" b="#c5b9a5" w={32} d={26} />
    <group position={[-7.5, 0, -4.5]}>
      <Box p={[0, 1.8, 0]} s={[7.0, 3.4, 2.6]} color="#e2e8f0" />
      <Box p={[0, 1.5, 1.32]} s={[7.0, 0.55, 0.04]} color="#2563eb" line={2} />
      <Box p={[0, 1.0, 1.32]} s={[7.0, 0.35, 0.04]} color="#f97316" line={2} />
      {[-2.2, -0.6, 1.0, 2.4].map((x) => <Box key={x} p={[x, 2.35, 1.32]} s={[1.1, 0.9, 0.04]} color="#93c5fd" line={2} />)}
    </group>
    <WallDoor z={-6.2} W={20} kind="wood" a="#c49a6c" b="#b0875a" door={{ x: 0, w: 2.8, h: 4.1 }} base="#6b4423" crown="#8b5e34" wainscot={["#e7d8c5", "#d4c2aa"]} />
    <Box p={[0, 7.2, -5.2]} s={[20, 0.5, 3.4]} color="#9a3412" />
    <CanvasPlane p={[0, 5.5, -6.08]} s={[5.2, 1.1]} px={[560, 120]} frame="#583118" draw={(c, W, H) => {
      c.fillStyle = "#fffbeb"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#451a03"; c.font = "900 52px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("STASIUN KAMPUNG", W / 2, H / 2 + 2);
    }} />
    <Clock p={[4.2, 5.4, -6.08]} r={0.58} t={t} speed={0.5} />
    <Bench p={[-4.5, 0, -3.0]} />
    <Bench p={[4.5, 0, -3.0]} />
    <StreetLamp p={[-4.8, 0, 1.5]} h={5.4} on={0.4} />
    <StreetLamp p={[4.8, 0, 1.5]} h={5.4} on={0.4} flip />
    <Plant p={[-7.2, 0, -1.5]} s={1.35} pot="#b45309" />
    <Plant p={[7.2, 0, -3.8]} s={1.45} pot="#b45309" />
    {[-10, 10, 0].map((tx, i) => (
      <group key={i} position={[tx, 0, -12 - i * 2]}>
        <Cyl p={[0, 1.8, 0]} rt={0.28} h={3.6} color="#5c3a21" line={2} />
        <Ball p={[0, 4.2, 0]} r={2.2} color={i === 1 ? "#22c55e" : "#16a34a"} />
      </group>
    ))}
    <Shaft p={[-2.0, 5.0, -1.5]} s={[4.2, 9]} rot={[0, 0, 0.2]} color="255,220,120" o={0.34} />
    <Shaft p={[2.8, 5.0, 0.0]} s={[3.6, 8]} rot={[0, 0, -0.18]} color="255,232,140" o={0.28} />
    <Dust t={t} n={18} area={[7, 6, 5]} color="rgba(255,224,130,0.58)" fall />
    {/* Ayah & Budi side-by-side at x = ±0.58 so billboard quads never bisect each other's faces */}
    <Person p={[-0.58, 0, 0.05]} h={3.5} look={ayah} f={f} pose={{
      mood: hugging ? "grin" : "smile",
      armR: hugging ? [0.38, 0.58] : undefined, armRK: hugK,
      armL: hugging ? [0.22, 0.46] : undefined, armLK: hugK,
      lookX: 0.45,
    }} />
    <Person p={[hugging ? 0.58 : budiX, 0, 0.25]} h={3.4} look={budiKampung} f={f} pose={{
      mood: hugging ? "grin" : "smile",
      walk: !hugging ? dist * WALK : undefined,
      speed: !hugging ? 0.85 : 0,
      flip: true,
      armL: hugging ? [-0.38, 0.58] : undefined, armLK: hugK,
      armR: hugging ? [-0.22, 0.46] : undefined, armRK: hugK,
    }} />
    {t > 68.5 ? <Glow p={[0, 2.8, 1.5]} r={5.5} color="rgba(255,220,120,0.55)" o={seg(t, 68.5, 71.5) * 0.42} /> : null}
  </>);
};

// ============= Main composition =============
export const DuaDunia: React.FC = () => {
  const f = useCurrentFrame();
  void f; void seg;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={0} end={5.60} bg="#0a1230">{(c) => <S1 {...c} />}</Scene>
      <Scene start={5.60} end={12.20} trans="whip" bg="#94a3b8">{(c) => <S2 {...c} />}</Scene>
      <Scene start={12.20} end={19.10} trans="ghost" bg="#e2e8f0">{(c) => <S3 {...c} />}</Scene>
      <Scene start={19.10} end={28.60} trans="zoom" bg="#080e24">{(c) => <S4 {...c} />}</Scene>
      <Scene start={28.60} end={35.80} trans="ghost" bg="#0c1428">{(c) => <S5 {...c} />}</Scene>
      <Scene start={35.80} end={49.00} trans="flash" bg="#dcfce7">{(c) => <S6 {...c} />}</Scene>
      <Scene start={49.00} end={56.10} trans="zoom" bg="#141828">{(c) => <S7 {...c} />}</Scene>
      <Scene start={56.10} end={64.50} trans="whip" bg="#1e2850">{(c) => <S8 {...c} />}</Scene>
      <Scene start={64.50} end={74.33} trans="flash" bg="#fef3c7">{(c) => <S9 {...c} />}</Scene>
      <Captions />
    </AbsoluteFill>
  );
};
