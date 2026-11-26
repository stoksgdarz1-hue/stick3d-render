# Approved upgrade rules (apply ON TOP of the finished draft, do not rebuild from scratch)
1. Environment (v5): 15-20 detail props per scene (shelves with varied books, layered-leaf plants, matted frames, cables, lamps, `PendantLamp`, `WallSconce`).
2. Architecture & Depth: Always include baseboard/crown molding/wainscoting (`WallDoor` props), `Ceiling` (with beams if indoor), `CornerPillar`, `PropShadow` under furniture, and `StreetBackdrop` behind any glass door or window (never flat voids).
3. Lighting & Atmosphere: `Lights` + `SceneFog` for background depth separation, `Glow` + `Shaft` + `Dust`, plus built-in `Scene` vignette.
4. Textured walls/floors: use `brick`, `wood`, `plank`, `tile`, `marble`, `carpet`, `wainscot`, `concrete`, `slate`.
5. Explainer Clarity: pair narration concepts with `HoloCard`, `Callout`, `StatMeter`, or `SignalArc` from `style/explainer.tsx` timed to the spoken word.
6. FOCUS = stick-figure acting (biggest priority): emotion-driven micro-motion driven by the VO words:
   nervous -> sweat drops that fall, shiver/jitter, trembling hands, darting eyes, gulp; shock -> squash/stretch, jump-back;
   plus idle breathing, anticipation/overshoot on every action, secondary motion (hat/hair/badge lag), gesture library.
7. Camera moves and actions follow the voiceover meaning (push-in on key words, whip on shocks, shake on tension).
8. Color: raise saturation, richer grade (warm/cool split), closer to reference.
9. Process: keep rules; iterate on the existing draft (`src/videos/<Name>.tsx` + `src/style/*`), partial renders only for changed scenes.
