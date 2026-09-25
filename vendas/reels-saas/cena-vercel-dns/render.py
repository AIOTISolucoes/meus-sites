from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent
HTML = ROOT / "index.html"
DEFAULT_OUTPUT = ROOT / "cena-vercel-dns.mp4"


def render(output: Path, fps: int, duration: float, crf: int) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg não foi encontrado no PATH.")

    frame_count = round(duration * fps)
    with tempfile.TemporaryDirectory(prefix="cena-vercel-dns-") as temp_dir:
        frame_dir = Path(temp_dir)
        with sync_playwright() as playwright:
            try:
                browser = playwright.chromium.launch(headless=True)
            except Exception:
                browser = playwright.chromium.launch(headless=True, channel="msedge")

            page = browser.new_page(
                viewport={"width": 1080, "height": 1920},
                device_scale_factor=1,
            )
            page.goto(f"{HTML.as_uri()}?render=1", wait_until="load")

            for frame in range(frame_count):
                page.evaluate("ms => window.__setTime(ms)", frame * 1000 / fps)
                page.screenshot(
                    path=str(frame_dir / f"frame-{frame:05d}.png"),
                    animations="disabled",
                )
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Renderiza a cena vertical de DNS da Vercel.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--duration", type=float, default=6.6)
    parser.add_argument("--crf", type=int, default=18)
    args = parser.parse_args()

    try:
        render(args.output.resolve(), args.fps, args.duration, args.crf)
    except Exception as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    print(f"Vídeo criado em: {args.output.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
