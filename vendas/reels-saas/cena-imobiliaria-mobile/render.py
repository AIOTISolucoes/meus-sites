from __future__ import annotations

import argparse
import functools
import http.server
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import Route, sync_playwright


ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT.parents[2]
HTML_PATH = ROOT.relative_to(WORKSPACE).as_posix() + "/index.html"
CONFIG_PATH = WORKSPACE / "ah-imobiliaria" / "js" / "config.js"
DEFAULT_OUTPUT = ROOT / "cena-imobiliaria-mobile.mp4"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *_args: object) -> None:
        return


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def local_config() -> str:
    source = CONFIG_PATH.read_text(encoding="utf-8")
    source = re.sub(r"supabaseUrl:\s*'[^']*'", "supabaseUrl: ''", source, count=1)
    source = re.sub(r"supabaseAnonKey:\s*'[^']*'", "supabaseAnonKey: ''", source, count=1)
    return source


def render(output: Path, fps: int, duration: float, crf: int, stills: bool) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg and not stills:
        raise RuntimeError("ffmpeg não foi encontrado no PATH.")

    port = free_port()
    handler = functools.partial(QuietHandler, directory=str(WORKSPACE))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    patched_config = local_config()
    frame_count = round(duration * fps)
    try:
        with tempfile.TemporaryDirectory(prefix="cena-imobiliaria-mobile-") as temp_dir:
            frame_dir = Path(temp_dir)
            still_dir = ROOT / "stills"
            if stills:
                still_dir.mkdir(parents=True, exist_ok=True)

            with sync_playwright() as playwright:
                try:
                    browser = playwright.chromium.launch(headless=True)
                except Exception:
                    browser = playwright.chromium.launch(headless=True, channel="msedge")

                page = browser.new_page(
                    viewport={"width": 1080, "height": 1920},
                    device_scale_factor=1,
                    reduced_motion="no-preference",
                )

                def replace_config(route: Route) -> None:
                    route.fulfill(
                        status=200,
                        content_type="application/javascript; charset=utf-8",
                        body=patched_config,
                    )

                page.route("**/ah-imobiliaria/js/config.js", replace_config)
                page.goto(f"http://127.0.0.1:{port}/{HTML_PATH}?render=1", wait_until="load")
                try:
                    page.wait_for_function("window.__ready === true", timeout=20_000)
                except Exception as exc:
                    detail = page.evaluate("window.__bootstrapError || 'sem detalhe no navegador'")
                    raise RuntimeError(f"A cena não terminou de iniciar: {detail}") from exc

                if stills:
                    moments = [0.8, 2.7, 3.9, 5.35, 6.75, 7.9, 9.3, 10.4, 12.35, 13.7, 14.65]
                    for index, moment in enumerate(moments):
                        page.evaluate("ms => window.__setTime(ms)", moment * 1000)
                        page.screenshot(
                            path=str(still_dir / f"still-{index:02d}-{moment:05.2f}s.png"),
                            animations="disabled",
                        )
                    print(f"Stills criados em: {still_dir}")
                    browser.close()
                    return

                for frame in range(frame_count):
                    page.evaluate("ms => window.__setTime(ms)", frame * 1000 / fps)
                    page.screenshot(path=str(frame_dir / f"frame-{frame:05d}.png"), animations="disabled")
                    if frame % fps == 0:
                        print(f"Quadro {frame}/{frame_count}", flush=True)

                browser.close()

            output.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(
                [
                    ffmpeg,
                    "-y",
                    "-framerate", str(fps),
                    "-i", str(frame_dir / "frame-%05d.png"),
                    "-c:v", "libx264",
                    "-preset", "medium",
                    "-crf", str(crf),
                    "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart",
                    str(output),
                ],
                check=True,
            )
    finally:
        server.shutdown()
        server.server_close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Renderiza a demonstração mobile da Ah Imobiliária.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--duration", type=float, default=15.0)
    parser.add_argument("--crf", type=int, default=18)
    parser.add_argument("--stills", action="store_true", help="Gera apenas quadros-chave para revisar a direção visual.")
    args = parser.parse_args()

    try:
        render(args.output.resolve(), args.fps, args.duration, args.crf, args.stills)
    except Exception as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    if not args.stills:
        print(f"Vídeo criado em: {args.output.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
