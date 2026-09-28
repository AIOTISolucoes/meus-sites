"""Trilha original do Reels (síntese própria, sem samples de terceiros).

    python trilha.py   ->  saida/trilha.wav (48 kHz, estéreo, -14 LUFS)

120 BPM (1 compasso = 2 s), acordes Gmaj7 | A6 | F#m7 | Bm7, resolvendo em
Dadd9 no cartão final. As seções seguem o roteiro da composicao.html:
  0-8   abertura (bumbo, chimbal, pad abrindo, baixo, piano elétrico)
  8-22  decorado (groove mais leve)
  22-32 lazer (energia máxima: palmas, chimbal aberto, shaker)
  32-36 plantas (respiro, sem bateria, subida para o final)
  36-41 cartão final (impacto e acorde de repouso)
Os whooshes caem nos cortes com transição (lista WHOOSH).
"""
import subprocess
from pathlib import Path

import numpy as np
from scipy import signal

ROOT = Path(__file__).resolve().parent
SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 41.0
N = int(DUR * SR)
rng = np.random.default_rng(7)

WHOOSH = [(3.0, 1.0), (5.0, .55), (7.0, 1.0), (9.0, .8), (11.5, .5), (13.5, .9), (15.0, .5),
          (16.5, .5), (19.5, .9), (22.0, .8), (32.0, .9)]

PROG = [  # (acorde em MIDI, baixo)
    ([55, 59, 62, 66, 69], 43),   # Gmaj9
    ([57, 61, 64, 66], 45),       # A6
    ([54, 57, 61, 64], 42),       # F#m7
    ([54, 57, 59, 62, 66], 35),   # Bm9-ish
]
FINAL = ([50, 57, 62, 64, 66, 69], 38)  # Dadd9 aberto


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def buf():
    return np.zeros(N)


def put(dst, x, t):
    i = int(round(t * SR))
    if i >= N:
        return
    j = min(N, i + len(x))
    dst[i:j] += x[: j - i]


def env_adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = t > hold
    e[rel] *= np.exp(-(t[rel] - hold) / max(r, 1e-4))
    return e


def lp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def chord_at(t):
    if t >= 36:
        return FINAL
    return PROG[int(t // BAR) % 4]


# ------------------------------------------------------------------ instrumentos
def kick(vel=1.0):
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / .035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / .22)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t / .004) * .25
    return np.tanh(1.6 * (body + click)) * vel


def hat(open_=False, vel=1.0):
    n = int((.32 if open_ else .07) * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7500, 4)
    return x * np.exp(-t / (.11 if open_ else .018)) * vel


def clap(vel=1.0):
    n = int(.45 * SR); t = np.arange(n) / SR
    e = np.zeros(n)
    for k, off in enumerate((0, .011, .023)):
        m = t >= off
        e[m] += np.exp(-(t[m] - off) / (.006 if k < 2 else .16))
    return bp(rng.standard_normal(n), 900, 3200) * e * vel


def shaker(vel=1.0):
    n = int(.09 * SR); t = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(t / .09, 0, 1)) ** 2
    return hp(rng.standard_normal(n), 5000) * e * vel


def epiano(freqs, dur, vel=1.0):
    """Piano elétrico por FM (carrier 1:1 + tine 1:14)."""
    n = int((dur + 1.6) * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        idx = 1.8 * np.exp(-t / .5) + .25
        tine = .35 * np.exp(-t / .06) * np.sin(2 * np.pi * f * 14 * t)
        mod = idx * np.sin(2 * np.pi * f * t)
        tone = np.sin(2 * np.pi * f * t + mod) + tine
        out += tone * env_adsr(n, .004, .9, .0, .35, dur) / len(freqs) ** .5
    return out * vel


def pad_note(f, n):
    t = np.arange(n) / SR
    x = np.zeros(n)
    for c in (-8, 0, 7):
        ff = f * 2 ** (c / 1200)
        ph = (ff * t + rng.random()) % 1.0
        x += 2 * ph - 1
    return x / 3


def riser(n):
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    bands = [bp(x, lo, lo * 2.2) for lo in (300, 700, 1500, 3200, 6500)]
    pos = (t / t[-1]) * (len(bands) - 1)
    out = np.zeros(n)
    for k, b in enumerate(bands):
        w = np.clip(1 - np.abs(pos - k), 0, 1)
        out += b * w
    return out * (t / t[-1]) ** 2.2


def whoosh(length=.7):
    n = int(length * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    lo, mid, hi = bp(x, 250, 900), bp(x, 900, 2800), bp(x, 2800, 7000)
    p = t / t[-1]
    sweep = np.sin(np.pi * p)
    out = lo * (1 - sweep) + mid * sweep + hi * sweep ** 3 * .6
    return out * np.sin(np.pi * p) ** 2


# ------------------------------------------------------------------ arranjo
def arranjo():
    drums, bass, keys, pad, fx, side = buf(), buf(), buf(), buf(), buf(), buf()
    beats = int(DUR / BEAT)
    for b in range(beats):
        t = b * BEAT
        in_bar = b % 4
        sec_intro, sec_int, sec_laz, sec_br = t < 8, 8 <= t < 22, 22 <= t < 32, 32 <= t < 36
        final = t >= 36
        # bumbo
        if sec_intro or sec_int or sec_laz or (final and t < 39.5):
            v = .9 if sec_laz else (.6 if sec_int else .82)
            if final:
                v = 1.0 if t == 36 else .6
            put(drums, kick(v), t)
            put(side, np.exp(-np.arange(int(.3 * SR)) / SR / .09), t)
        # chimbal fechado nos contratempos
        if not sec_br and t < 39.5:
            put(drums, hat(False, .4 if sec_laz else (.2 if sec_int else .28)), t + BEAT / 2)
            if sec_laz and in_bar in (1, 3):
                put(drums, hat(True, .22), t + BEAT / 2)
        # palmas
        if sec_laz and in_bar in (1, 3):
            put(drums, clap(.55), t)
        if sec_int and in_bar == 3 and (b // 4) % 2 == 1:
            put(drums, clap(.3), t)
        # shaker 16avos no lazer
        if sec_laz:
            for k in range(4):
                put(drums, shaker(.12 if k % 2 else .07), t + k * BEAT / 4)
    # riser para o final e prato suave (ruído com cauda) no impacto
    put(fx, riser(int(2.0 * SR)) * .35, 34.0)
    n = int(2.6 * SR); tt = np.arange(n) / SR
    put(fx, hp(rng.standard_normal(n), 4000) * np.exp(-tt / .7) * .22, 36.0)
    for tw, v in WHOOSH:
        put(fx, whoosh() * .3 * v, tw - .35)

    # baixo
    for bar in range(int(DUR / BAR) + 1):
        t0 = bar * BAR
        if t0 >= DUR:
            break
        chord, root = chord_at(t0)
        f = hz(root)
        if 32 <= t0 < 36:
            hits = [(0, 1.9)]
        elif t0 >= 36:
            hits = [(0, 4.5)]
        elif t0 >= 22:
            hits = [(0, .45), (.75, .2), (1.5, .45), (2, .45), (2.75, .2), (3.5, .4)]
        else:
            hits = [(0, .9), (1.5, .4), (2, .9), (3.5, .4)]
        for beat, dur in hits:
            n = int((dur * BEAT * 2 + .3) * SR) if dur > 1 else int((dur + .15) * SR)
            tt = np.arange(n) / SR
            hold = dur * BEAT * 2 if dur > 1 else dur
            x = np.sin(2 * np.pi * f * tt) + .18 * np.sin(4 * np.pi * f * tt)
            x = np.tanh(1.4 * x) * env_adsr(n, .008, .5 if t0 < 36 else 1.2, .7 if t0 < 36 else .25, .08, hold)
            put(bass, x * .55, t0 + beat * BEAT)

        # piano elétrico
        freqs = [hz(m) for m in chord]
        if t0 >= 36:
            put(keys, epiano(freqs, 4.0, .75), t0)
        elif 32 <= t0 < 36:
            put(keys, epiano(freqs, 1.6, .6), t0)
            put(keys, epiano([hz(m + 12) for m in chord[1:3]], .4, .25), t0 + 3 * BEAT)
        else:
            for beat, d, v in ((0, .5, .55), (1.5, .3, .42), (3.0, .35, .38)):
                put(keys, epiano(freqs, d, v), t0 + beat * BEAT)

        # pad (sustentado o compasso inteiro, com leve crossfade)
        n = int((BAR + .6) * SR)
        x = sum(pad_note(hz(m), n) for m in chord) / len(chord) ** .5
        e = env_adsr(n, .35, 1.0, 1.0, .4, BAR)
        put(pad, x * e, t0)

    # pad abre o filtro na introdução e fecha nas plantas
    t = np.arange(N) / SR
    dark, bright = lp(pad, 700), lp(pad, 2600)
    openness = np.interp(t, [0, 7.5, 22, 32, 36, 41], [.0, .75, .85, .2, .9, .5])
    pad = dark * (1 - openness) + bright * openness
    return drums, bass, keys, pad, fx, side


def reverb(x, secs=2.2, wet=.25):
    n = int(secs * SR)
    t = np.arange(n) / SR
    irs = [lp(rng.standard_normal(n), 5000) * np.exp(-t / (secs / 5.5)) for _ in range(2)]
    irs = [ir / np.sqrt(np.sum(ir ** 2)) for ir in irs]
    wetL = signal.fftconvolve(x, irs[0])[: len(x)]
    wetR = signal.fftconvolve(x, irs[1])[: len(x)]
    return np.stack([x + wet * wetL, x + wet * wetR])


def main():
    drums, bass, keys, pad, fx, side = arranjo()
    duck = 1 - .55 * np.clip(side, 0, 1)
    bass *= duck
    pad *= 1 - .35 * np.clip(side, 0, 1)
    mix = (
        reverb(drums, 1.2, .08) * .5
        + np.stack([bass, bass]) * .52
        + reverb(keys, 2.4, .32) * 1.0
        + reverb(pad, 3.0, .3) * .6
        + reverb(fx, 1.8, .25) * .7
    )
    # leve abertura estéreo no pad/piano
    mix[0] += .04 * lp(keys, 3000)
    mix[1] -= .04 * lp(keys, 3000)
    mix = np.stack([hp(ch, 28) for ch in mix])
    t = np.arange(N) / SR
    mix *= np.clip((DUR - t) / 1.6, 0, 1) ** 1.5  # saída suave
    mix *= np.clip(t / .03, 0, 1)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix = np.tanh(1.2 * mix) / np.tanh(1.2)
    out = ROOT / "saida"
    out.mkdir(exist_ok=True)
    raw = out / "trilha-bruta.wav"
    import wave
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix.T, -1, 1) * 32767 * .9).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(out / "trilha.wav")], check=True)
    raw.unlink()
    print("trilha pronta", out / "trilha.wav")


if __name__ == "__main__":
    main()
