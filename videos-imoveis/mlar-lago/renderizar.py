"""Renderiza o Reels do M.Lar Lago quadro a quadro.

    python renderizar.py                 # vídeo completo (com trilha, se existir)
    python renderizar.py --quadros 0.5 9.3 32.8   # só PNGs de conferência em saida/quadros/

Serve a pasta por HTTP local, abre composicao.html?render=1 no Chromium do
Playwright, chama render(t) para cada quadro (30 fps) e envia as capturas para
o ffmpeg. Saídas em saida/:
  mlar-lago-reels.mp4              1080x1920, H.264, com a trilha original
  mlar-lago-reels-sem-musica.mp4   o mesmo vídeo sem áudio, para usar música do Instagram
"""
import argparse
import base64
import functools
import http.server
import multiprocessing as mp
import shutil
import subprocess
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "saida"
W, H, FPS = 1080, 1920, 30


def servidor():
    class Quieto(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    handler = functools.partial(Quieto, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def abrir(pw, port):
    browser = pw.chromium.launch(args=["--force-color-profile=srgb", "--disable-lcd-text"])
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto(f"http://127.0.0.1:{port}/composicao.html?render=1")
    page.evaluate("() => window.ready")
    return browser, page


def quadro(page, t, cdp=None):
    page.evaluate(f"() => {{ render({t:.6f}); }}")
    # dois rAF garantem que o layout e a pintura do novo estado terminaram
    page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
    cdp = cdp or page.context.new_cdp_session(page)
    # PNG sem perdas; optimizeForSpeed só troca a compressão, não a imagem
    d = cdp.send("Page.captureScreenshot", {"format": "png", "optimizeForSpeed": True,
                                            "clip": {"x": 0, "y": 0, "width": W, "height": H, "scale": 1}})
    return base64.b64decode(d["data"])


def trabalhador(k, n, total, pasta):
    """Renderiza os quadros k, k+n, k+2n... num navegador próprio."""
    srv = servidor()
    with sync_playwright() as pw:
        browser, page = abrir(pw, srv.server_address[1])
        cdp = page.context.new_cdp_session(page)
        for i in range(k, total, n):
            (pasta / f"f{i:05d}.png").write_bytes(quadro(page, i / FPS, cdp))
            if k == 0 and i % (n * 30) == 0:
                print(f"{i}/{total}", flush=True)
        browser.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quadros", nargs="*", type=float)
    ap.add_argument("--ate", type=float, help="renderiza só até este segundo (teste)")
    ap.add_argument("--workers", type=int, default=3, help="navegadores em paralelo")
    args = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    srv = servidor()
    port = srv.server_address[1]
    with sync_playwright() as pw:
        browser, page = abrir(pw, port)
        dur = page.evaluate("() => ROTEIRO.duracao")
        if args.quadros is not None:
            pasta = OUT / "quadros"
            pasta.mkdir(exist_ok=True)
            for t in args.quadros:
                (pasta / f"q-{t:06.2f}.png").write_bytes(quadro(page, t))
            print("quadros em", pasta)
            return
        browser.close()
    total = round((args.ate or dur) * FPS)
    pasta = OUT / "quadros-tmp"
    shutil.rmtree(pasta, ignore_errors=True)
    pasta.mkdir()
    procs = [mp.Process(target=trabalhador, args=(k, args.workers, total, pasta)) for k in range(args.workers)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
        if p.exitcode:
            raise SystemExit(f"trabalhador falhou ({p.exitcode})")
    faltando = [i for i in range(total) if not (pasta / f"f{i:05d}.png").exists()]
    if faltando:
        raise SystemExit(f"quadros faltando: {faltando[:10]}")
    mudo = OUT / "mlar-lago-reels-sem-musica.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(pasta / "f%05d.png"),
        "-vf", "scale=in_range=full:out_range=tv,format=yuv420p",
        "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-profile:v", "high", "-level", "4.2",
        "-x264-params", "keyint=60:min-keyint=30",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
        "-movflags", "+faststart", str(mudo)], check=True)
    shutil.rmtree(pasta)
    trilha = OUT / "trilha.wav"
    if trilha.exists():
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(mudo), "-i", str(trilha),
            "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
            "-shortest", "-movflags", "+faststart", str(OUT / "mlar-lago-reels.mp4")], check=True)
    print("pronto")


if __name__ == "__main__":
    main()
