"""Grava vídeos curtos dos três prospectos criados em setembro de 2026.

O roteiro combina desktop, interação principal, uma passagem responsiva dentro
de uma moldura mobile e uma conversa real com o agente publicado. A captura é
feita quadro a quadro, como nos vídeos de venda anteriores do workspace.

Uso:
    python vendas/gravar-videos-prospectos.py
    python vendas/gravar-videos-prospectos.py --only vizzio

O repositório precisa estar servido em http://127.0.0.1:8602, por exemplo:
    python -m http.server 8602 --bind 127.0.0.1
"""

from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
import time
import urllib.request

from playwright.sync_api import Browser, BrowserContext, Frame, Page, sync_playwright


ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:8602/portifolio-site"
CHAT_APP = "http://127.0.0.1:8512/"
W, H = 1440, 900
FPS = 25
WAIT_CAP = 3.0

SITES = {
    "vizzio": {
        "slug": "otica-vizzio-fashion",
        "agent": "vizzio_fashion",
        "color": "c8ff32",
        "bg": "#111210",
        "ink": "#f2f3ee",
        "name": "Vizzio Fashion",
        "mobile_title": "Seu estilo também cabe no bolso.",
        "question": "Oi! Procuro uma armação leve e transparente. Como posso escolher?",
        "output": ROOT / "vendas" / "video-vizzio-fashion.mp4",
    },
    "morada": {
        "slug": "restaurante-morada-nova",
        "agent": "morada_nova",
        "color": "ffd12f",
        "bg": "#8b160d",
        "ink": "#fff8e8",
        "name": "Restaurante Morada Nova",
        "mobile_title": "Do cardápio ao pedido, sem atrito.",
        "question": "Oi! Quero pedir um cozido de boi. Tem disponível hoje?",
        "output": ROOT / "vendas" / "video-morada-nova.mp4",
    },
    "louro": {
        "slug": "louro-caipira",
        "agent": "louro_caipira",
        "color": "ff632f",
        "bg": "#061c15",
        "ink": "#e9eee7",
        "name": "Louro Caipira",
        "mobile_title": "Sabores e reserva em qualquer tela.",
        "question": "Oi! Quero solicitar uma reserva para 4 pessoas no domingo ao meio-dia.",
        "output": ROOT / "vendas" / "video-louro-caipira.mp4",
    },
    "bar": {
        "slug": "bar-do-peixe",
        "agent": "bar_do_peixe",
        "color": "ff7658",
        "bg": "#0a2b24",
        "ink": "#f4eee2",
        "name": "Bar do Peixe",
        "mobile_title": "Da margem para a mesa, em qualquer tela.",
        "question": "Oi! Quero pedir peixe frito para duas pessoas. Como funciona?",
        "output": ROOT / "vendas" / "video-bar-do-peixe.mp4",
    },
    "farmacia": {
        "slug": "farmacia-central",
        "agent": "farmacia_central",
        "color": "ff7968",
        "bg": "#173f35",
        "ink": "#f4f0e8",
        "name": "Farmácia Central",
        "mobile_title": "Cuidado próximo, unidade por unidade.",
        "question": "Oi! Procuro protetor solar. Vocês conseguem verificar opções e estoque na unidade Serrinha?",
        "output": ROOT / "vendas" / "video-farmacia-central.mp4",
    },
    "pro_otica": {
        "slug": "pro-otica",
        "agent": "pro_otica",
        "color": "78a8ff",
        "bg": "#101722",
        "ink": "#f4f7fb",
        "name": "Pró-Ótica",
        "mobile_title": "Seu próximo olhar também começa no toque.",
        "question": "Oi! Quero uma armação leve e translúcida. A equipe pode me ajudar a experimentar opções?",
        "output": ROOT / "vendas" / "video-pro-otica.mp4",
    },
}


CURSOR = """
() => {
  if (document.querySelector('#__video_cursor')) return;
  const cursor = document.createElement('div');
  cursor.id = '__video_cursor';
  cursor.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:25px;height:25px;pointer-events:none;will-change:left,top';
  cursor.innerHTML = '<svg viewBox="0 0 24 24" width="25" height="25">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(12,16,14,.82)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-10px;top:-10px;width:45px;height:45px;border-radius:50%;' +
    'border:2px solid var(--video-accent,#fff);opacity:0;transform:scale(.25)"></i>';
  document.body.append(cursor);
  const ring = cursor.querySelector('i');
  window.__videoCursor = (x, y) => { cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; };
  window.__videoPulse = () => {
    ring.style.transition = 'none'; ring.style.opacity = '.95'; ring.style.transform = 'scale(.25)';
    requestAnimationFrame(() => {
      ring.style.transition = 'transform .45s ease-out, opacity .45s ease-out';
      ring.style.opacity = '0'; ring.style.transform = 'scale(1)';
    });
  };
}
"""


class Recorder:
    def __init__(self, directory: pathlib.Path) -> None:
        self.directory = directory
        self.frames: list[tuple[str, float]] = []
        self.number = 0
        self.cursor = [W / 2, H / 2]

    def save(self, page: Page, duration: float) -> None:
        self.number += 1
        target = self.directory / f"f{self.number:05d}.jpg"
        page.screenshot(path=str(target), type="jpeg", quality=87)
        self.frames.append((target.name, max(duration, 0.001)))

    def realtime(self, page: Page, seconds: float, fps: int = 11) -> None:
        end = time.perf_counter() + seconds
        previous = time.perf_counter()
        while time.perf_counter() < end:
            self.save(page, 0.001)
            now = time.perf_counter()
            self.frames[-1] = (self.frames[-1][0], max(now - previous, 0.001))
            previous = now
            rest = (1 / fps) - (time.perf_counter() - now)
            if rest > 0:
                time.sleep(rest)

    def scroll(self, page: Page | Frame, capture_page: Page, start: float, end: float,
               seconds: float) -> float:
        count = max(1, int(seconds * FPS))
        for index in range(count):
            t = (index + 1) / count
            smooth = t * t * (3 - 2 * t)
            page.evaluate("y => window.scrollTo(0, y)", start + (end - start) * smooth)
            self.save(capture_page, 1 / FPS)
        return end

    def move(self, page: Page, x: float, y: float) -> None:
        page.mouse.move(x, y)
        page.evaluate("([x,y]) => window.__videoCursor(x,y)", [x, y])
        self.cursor[:] = [x, y]

    def move_to(self, page: Page, x: float, y: float, seconds: float,
                curve: float = 0) -> None:
        x0, y0 = self.cursor
        count = max(1, int(seconds * FPS))
        for index in range(count):
            t = (index + 1) / count
            smooth = t * t * (3 - 2 * t)
            bend = curve * 4 * t * (1 - t)
            self.move(page, x0 + (x - x0) * smooth, y0 + (y - y0) * smooth + bend)
            self.save(page, 1 / FPS)

    def click(self, page: Page, selector: str, pause: float = 0.7) -> None:
        locator = page.locator(selector).first
        locator.scroll_into_view_if_needed()
        box = locator.bounding_box()
        if not box:
            raise RuntimeError(f"Elemento sem área visível: {selector}")
        x = box["x"] + box["width"] / 2
        y = box["y"] + box["height"] / 2
        self.move_to(page, x, y, 0.55, curve=-16)
        page.evaluate("() => window.__videoPulse()")
        locator.click()
        self.realtime(page, pause)

    def compress_since(self, index: int, ceiling: float = WAIT_CAP) -> None:
        elapsed = sum(duration for _, duration in self.frames[index:])
        if elapsed <= ceiling:
            return
        ratio = ceiling / elapsed
        for position in range(index, len(self.frames)):
            name, duration = self.frames[position]
            self.frames[position] = (name, duration * ratio)

    def write_manifest(self) -> pathlib.Path:
        manifest = self.directory / "lista.txt"
        lines: list[str] = []
        for name, duration in self.frames:
            lines.extend((f"file '{name}'\n", f"duration {duration:.5f}\n"))
        lines.append(f"file '{self.frames[-1][0]}'\n")
        manifest.write_text("".join(lines), encoding="utf-8")
        return manifest


def absolute_y(page: Page, selector: str) -> float:
    return float(page.eval_on_selector(
        selector, "el => el.getBoundingClientRect().top + window.scrollY"
    ))


def install_cursor(page: Page, accent: str) -> None:
    page.evaluate("color => document.documentElement.style.setProperty('--video-accent', color)", accent)
    page.evaluate(CURSOR)


def find_agent_frame(page: Page) -> Frame:
    limit = time.perf_counter() + 90
    while time.perf_counter() < limit:
        iframe = page.locator("#ai-box iframe")
        if iframe.count():
            handle = iframe.element_handle()
            frame = handle.content_frame() if handle else None
            if frame:
                return frame
        time.sleep(0.15)
    raise RuntimeError("O iframe do agente não carregou.")


def wait_for_answer(recorder: Recorder, page: Page, frame: Frame,
                    before: int, timeout: float = 70) -> bool:
    limit = time.perf_counter() + timeout
    stable = 0
    previous = time.perf_counter()
    while time.perf_counter() < limit:
        recorder.save(page, 0.001)
        now = time.perf_counter()
        recorder.frames[-1] = (recorder.frames[-1][0], max(now - previous, 0.001))
        previous = now
        try:
            state = frame.evaluate("""() => ({
                count: document.querySelectorAll('[data-testid="stChatMessage"]').length,
                thinking: document.body.innerText.includes('Pensando')
            })""")
            if state["count"] >= before + 2 and not state["thinking"]:
                stable += 1
                if stable >= 3:
                    return True
            else:
                stable = 0
        except Exception:
            stable = 0
        time.sleep(0.11)
    return False


def type_message(recorder: Recorder, page: Page, frame: Frame, text: str) -> None:
    field = frame.locator("textarea, [contenteditable=true]").first
    field.click()
    for character in text:
        field.type(character, delay=0)
        recorder.save(page, 0.035)


def prepare_chat(page: Page, chat_url: str) -> Frame:
    page.locator("#ai-btn").click()
    iframe = page.locator("#ai-box iframe")
    iframe.wait_for(timeout=30_000)
    iframe.evaluate("(element, url) => { element.src = url; }", chat_url)
    frame = find_agent_frame(page)
    frame.locator("textarea, [contenteditable=true]").first.wait_for(timeout=120_000)
    page.locator("#ai-close").click()
    page.evaluate("window.scrollTo(0,0)")
    return frame


def vizzio_sequence(rec: Recorder, page: Page) -> None:
    rec.realtime(page, 1.8)
    collection = absolute_y(page, "#colecao")
    position = rec.scroll(page, page, 0, collection + 270, 2.2)
    media = page.locator("[data-magnify]").first
    box = media.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .36,
                    box["y"] + box["height"] * .48, .8, curve=24)
        rec.move_to(page, box["x"] + box["width"] * .66,
                    box["y"] + box["height"] * .38, 1.0, curve=-20)
        rec.realtime(page, .7)
    finder = absolute_y(page, "#provador")
    rec.scroll(page, page, position, finder - 70, 2.0)
    rec.click(page, '[data-face="round"]', .35)
    rec.click(page, '[data-vibe="marcante"]', 1.3)


def morada_sequence(rec: Recorder, page: Page) -> None:
    rec.realtime(page, 1.8)
    repeat = absolute_y(page, ".repeat-story")
    position = rec.scroll(page, page, 0, repeat + 170, 2.4)
    tile = page.locator("[data-repeat-image]")
    box = tile.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .58,
                    box["y"] + box["height"] * .5, .9, curve=-28)
        rec.realtime(page, 1.2)
    menu = absolute_y(page, ".menu-pan")
    position = rec.scroll(page, page, position, menu + 450, 2.0)
    rec.realtime(page, .8)
    page.evaluate("document.querySelector('[data-add=\"Cozido de boi\"]').click()")
    rec.realtime(page, 1.5)


def louro_sequence(rec: Recorder, page: Page) -> None:
    rec.realtime(page, 1.8)
    manifesto = absolute_y(page, ".manifesto")
    position = rec.scroll(page, page, 0, manifesto + 260, 1.8)
    flavors = absolute_y(page, "#sabores")
    position = rec.scroll(page, page, position, flavors + 320, 1.9)
    second = page.locator(".flavor").nth(1)
    box = second.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .56,
                    box["y"] + box["height"] * .45, .8, curve=25)
        rec.realtime(page, .8)
    page.locator('.select-dish[data-dish="Camarão alho e óleo"]').click()
    rec.realtime(page, .65)
    experience = absolute_y(page, "#experiencia")
    rec.scroll(page, page, position, experience + 300, 2.2)
    deck = page.locator(".deck")
    box = deck.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .68,
                    box["y"] + min(box["height"] * .34, 360), .9, curve=-20)
        rec.realtime(page, 1.0)


def bar_sequence(rec: Recorder, page: Page) -> None:
    rec.realtime(page, 1.8)
    hero = page.locator(".hero")
    box = hero.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .72,
                    box["y"] + box["height"] * .36, .8, curve=20)
        rec.move_to(page, box["x"] + box["width"] * .42,
                    box["y"] + box["height"] * .58, .8, curve=-18)
    story = absolute_y(page, "#sabores")
    position = rec.scroll(page, page, 0, story + 260, 2.0)
    flavours = absolute_y(page, ".flavours")
    position = rec.scroll(page, page, position, flavours + 280, 1.7)
    panel = page.locator(".food-panel").nth(1)
    box = panel.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .52,
                    box["y"] + box["height"] * .48, .65, curve=-16)
        panel.click()
        rec.realtime(page, .8)
    order = absolute_y(page, "#pedido")
    rec.scroll(page, page, position, order + 260, 1.8)
    rec.click(page, '[data-dish="Peixe frito"]', 1.4)


def farmacia_sequence(rec: Recorder, page: Page) -> None:
    rec.realtime(page, 1.8)
    media = page.locator(".hero-media")
    box = media.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .7,
                    box["y"] + box["height"] * .42, .8, curve=-20)
        rec.move_to(page, box["x"] + box["width"] * .38,
                    box["y"] + box["height"] * .63, .7, curve=17)
    care = absolute_y(page, "#cuidados")
    position = rec.scroll(page, page, 0, care + 430, 2.2)
    rec.click(page, '[data-care="Proteção solar e pele"]', .9)
    stores = absolute_y(page, "#unidades")
    rec.scroll(page, page, position, stores + 300, 2.0)
    rec.click(page, '[data-unit="Serrinha"] button', 1.5)


def pro_otica_sequence(rec: Recorder, page: Page) -> None:
    rec.realtime(page, 1.8)
    hero = page.locator(".hero")
    box = hero.bounding_box()
    if box:
        rec.move_to(page, box["x"] + box["width"] * .76,
                    box["y"] + box["height"] * .35, .85, curve=18)
        rec.move_to(page, box["x"] + box["width"] * .46,
                    box["y"] + box["height"] * .55, .75, curve=-15)
    collection = absolute_y(page, "#colecao")
    position = rec.scroll(page, page, 0, collection + 1250, 3.0)
    finder = absolute_y(page, "#estilo")
    position = rec.scroll(page, page, position, max(position + 300, finder + 220), 2.0)
    rec.click(page, '[data-vibe="criativa"]', .4)
    rec.click(page, '[data-material="translucida"]', 1.5)


SEQUENCES = {
    "vizzio": vizzio_sequence,
    "morada": morada_sequence,
    "louro": louro_sequence,
    "bar": bar_sequence,
    "farmacia": farmacia_sequence,
    "pro_otica": pro_otica_sequence,
}


def mobile_stage_html(config: dict[str, object], site_url: str) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
      *{{box-sizing:border-box}} body{{margin:0;width:100vw;height:100vh;overflow:hidden;background:{config['bg']};
      color:{config['ink']};font-family:Arial,sans-serif;display:grid;grid-template-columns:1fr 520px;align-items:center;
      padding:38px 110px;position:relative}} body:before{{content:'';position:absolute;inset:0;opacity:.045;
      background-image:radial-gradient(circle at 20% 20%,#{config['color']} 0 1px,transparent 1px);background-size:18px 18px}}
      .copy{{position:relative;max-width:650px}} small{{color:#{config['color']};font-size:13px;font-weight:800;
      letter-spacing:.28em}} h1{{font-size:76px;line-height:.92;letter-spacing:-.065em;margin:28px 0}} p{{font-size:20px;
      line-height:1.55;max-width:510px;opacity:.72}} .tag{{display:inline-flex;margin-top:24px;border:1px solid #ffffff38;
      border-radius:999px;padding:12px 17px;font-size:13px;letter-spacing:.12em}} .phone{{position:relative;width:420px;height:838px;
      padding:17px;border-radius:53px;background:#090a09;box-shadow:0 48px 110px #0008,0 0 0 1px #ffffff30;justify-self:end}}
      .phone:before{{content:'';position:absolute;z-index:3;top:25px;left:50%;transform:translateX(-50%);width:116px;height:28px;
      border-radius:999px;background:#090a09}} iframe{{width:386px;height:804px;border:0;border-radius:38px;background:{config['bg']}}}
    </style></head><body><div class="copy"><small>RESPONSIVO · 390 PX</small><h1>{config['mobile_title']}</h1>
    <p>O mesmo ritmo visual, com navegação, conteúdo e ações reorganizados para o toque.</p><span class="tag">DESKTOP → MOBILE</span></div>
    <div class="phone"><iframe id="device" src="{site_url}"></iframe></div></body></html>"""


def record_mobile(rec: Recorder, context: BrowserContext, config: dict[str, object],
                  site_url: str) -> None:
    stage = context.new_page()
    stage.set_viewport_size({"width": W, "height": H})
    stage.set_content(mobile_stage_html(config, site_url), wait_until="domcontentloaded")
    device = stage.locator("#device")
    device.wait_for(timeout=30_000)
    limit = time.perf_counter() + 60
    mobile: Frame | None = None
    while time.perf_counter() < limit:
        handle = device.element_handle()
        mobile = handle.content_frame() if handle else None
        if mobile:
            break
        time.sleep(.1)
    if not mobile:
        raise RuntimeError("A versão mobile não carregou dentro da moldura.")
    mobile.locator(".menu-btn").wait_for(timeout=60_000)
    rec.realtime(stage, 1.0)
    mobile.locator(".menu-btn").click()
    rec.realtime(stage, 1.0)
    mobile.locator(".menu-btn").click()
    total = float(mobile.evaluate("document.documentElement.scrollHeight - innerHeight"))
    rec.scroll(mobile, stage, 0, min(total * .42, 2600), 2.5)
    rec.realtime(stage, .8)
    stage.close()


def record_chat(rec: Recorder, page: Page, frame: Frame, question: str) -> bool:
    page.locator("#ai-btn").click()
    rec.realtime(page, .8)
    field = frame.locator("textarea, [contenteditable=true]").first
    field.wait_for(timeout=60_000)
    before = frame.locator('[data-testid="stChatMessage"]').count()
    type_message(rec, page, frame, question)
    rec.realtime(page, .35)
    field.press("Enter")
    marker = len(rec.frames)
    answered = wait_for_answer(rec, page, frame, before)
    rec.compress_since(marker)
    rec.realtime(page, 3.0)
    return answered


def encode(rec: Recorder, output: pathlib.Path) -> None:
    manifest = rec.write_manifest()
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", manifest.name,
        "-fps_mode", "cfr", "-r", str(FPS), "-c:v", "libx264", "-preset", "slow",
        "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output),
    ], cwd=rec.directory, check=True)


def record_one(browser: Browser, key: str, config: dict[str, object]) -> dict[str, object]:
    site_url = f"{BASE}/{config['slug']}/"
    context = browser.new_context(viewport={"width": W, "height": H},
                                  reduced_motion="no-preference")
    with tempfile.TemporaryDirectory(prefix=f"video-{key}-") as temp:
        rec = Recorder(pathlib.Path(temp))
        page = context.new_page()
        page.goto(site_url, wait_until="networkidle", timeout=120_000)
        install_cursor(page, f"#{config['color']}")
        chat_url = (
            f"{CHAT_APP}?agente={config['agent']}&embed=true&cor={config['color']}"
        )
        chat_frame = prepare_chat(page, chat_url)
        SEQUENCES[key](rec, page)
        record_mobile(rec, context, config, site_url)
        answered = record_chat(rec, page, chat_frame, str(config["question"]))
        encode(rec, pathlib.Path(config["output"]))
        duration = round(sum(value for _, value in rec.frames), 2)
        result = {
            "site": key,
            "frames": len(rec.frames),
            "duration": duration,
            "chat_answered": answered,
            "output": str(config["output"]),
        }
    context.close()
    return result


def check_server() -> None:
    try:
        with urllib.request.urlopen(f"{BASE}/otica-vizzio-fashion/", timeout=8) as response:
            if response.status != 200:
                raise RuntimeError(f"HTTP {response.status}")
    except Exception as exc:
        raise SystemExit(
            "Servidor local indisponível. Rode: python -m http.server 8602 --bind 127.0.0.1"
        ) from exc


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=SITES, help="Grava somente um site.")
    args = parser.parse_args()
    check_server()
    selected = [args.only] if args.only else list(SITES)
    results = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for key in selected:
            print(f"[gravando] {key}", file=sys.stderr, flush=True)
            result = record_one(browser, key, SITES[key])
            results.append(result)
            print(json.dumps(result, ensure_ascii=False), flush=True)
        browser.close()
    print(json.dumps({"videos": results}, ensure_ascii=False))


if __name__ == "__main__":
    main()
