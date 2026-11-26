#!/usr/bin/env python3
"""Forced alignment: align.py audio.wav script.txt out.json  -> [{word,start,end}] seconds (10ms resolution).
Script words are used as-is (so captions match the script exactly), timestamps come from the audio.
Uses faster-whisper (cross-platform, works on Windows & supports EN/ID) with SequenceMatcher alignment."""
import sys, os, re, json, wave, difflib, tempfile, subprocess
import numpy as np
from faster_whisper import WhisperModel

wav, scr, out = sys.argv[1:4]
over = {}
p = os.path.join(os.path.dirname(scr), 'spoken.json')
if os.path.exists(p):
    over = json.load(open(p, encoding='utf-8'))

text = open(scr, encoding='utf-8').read()
disp = text.split()
if not disp:
    json.dump([], open(out, 'w', encoding='utf-8'))
    sys.exit(0)

def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

tmp = os.path.join(tempfile.gettempdir(), '_al16.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-ar', '16000', '-ac', '1', tmp], check=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', tmp]))

with wave.open(tmp, 'rb') as wf:
    raw = wf.readframes(wf.getnframes())
audio_np = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

model = WhisperModel('base', device='cpu', compute_type='int8')
segments, _ = model.transcribe(audio_np, word_timestamps=True, initial_prompt=text)
rec = []
for seg in segments:
    for w in (seg.words or []):
        nw = norm(w.word)
        if nw:
            rec.append((nw, float(w.start), float(w.end)))

# Expand script tokens with spoken.json overrides for better matching
exp_norm, owner = [], []
for i, w in enumerate(disp):
    s = over.get(w, over.get(w.rstrip('.,!?;:'), w))
    parts = [norm(x) for x in s.split() if norm(x)]
    if not parts:
        parts = [norm(w) or "x"]
    for pt in parts:
        exp_norm.append(pt)
        owner.append(i)

rec_words = [r[0] for r in rec]
sm = difflib.SequenceMatcher(None, exp_norm, rec_words, autojunk=False)
exp_times = [None] * len(exp_norm)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1):
            exp_times[i1 + k] = (rec[j1 + k][1], rec[j1 + k][2])
    elif tag == 'replace' and (i2 - i1) > 0 and (j2 - j1) > 0:
        t0, t1 = rec[j1][1], rec[j2 - 1][2]
        n = i2 - i1
        for k in range(n):
            exp_times[i1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)

# Interpolate any remaining gaps (deletions/unmatched)
n_exp = len(exp_times)
i = 0
while i < n_exp:
    if exp_times[i] is None:
        j = i
        while j < n_exp and exp_times[j] is None:
            j += 1
        t0 = exp_times[i - 1][1] if i > 0 else 0.0
        t1 = exp_times[j][0] if j < n_exp else dur
        if t1 < t0:
            t1 = t0 + 0.05 * (j - i)
        cnt = j - i
        for k in range(cnt):
            exp_times[i + k] = (t0 + (t1 - t0) * k / cnt, t0 + (t1 - t0) * (k + 1) / cnt)
        i = j
    else:
        i += 1

words = {}
for (st, en), o in zip(exp_times, owner):
    if o in words:
        words[o][2] = max(words[o][2], en)
    else:
        words[o] = [disp[o], st, en]

res = [{'word': v[0], 'start': round(v[1], 3), 'end': round(v[2], 3)} for k, v in sorted(words.items())]
json.dump(res, open(out, 'w', encoding='utf-8'), indent=1)
print(f'{len(res)} words aligned, last end {res[-1]["end"]}s')
