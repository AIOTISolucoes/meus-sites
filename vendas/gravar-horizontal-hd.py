"""Vídeo horizontal Full HD (1920x1080, 30 fps) para Reels/feeds horizontais.

Com --classic, grava 1440x900 (16:10) em vendas/video-<slug>.mp4.

Usa o mesmo método de gravar-reels.py: relógio da página controlado, um quadro
por vez, então as animações saem lisas. A página é renderizada em 1440x810 com
densidade 2 (2880x1620) e reduzida para 1920x1080, o que deixa texto e fotos
mais nítidos do que capturar direto em 1920.

Estrutura: desktop com cursor -> interação -> celular em mockup -> chat real.

Pré-requisitos: site em http://127.0.0.1:8602 e app de agentes em :8512.
Uso:
    python vendas/gravar-horizontal-hd.py --only d20
Saída: vendas/hd/hd-<slug>.mp4
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import pathlib
import subprocess
import sys
import tempfile
import time

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("reels", HERE / "gravar-reels.py")
reels = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reels)

VW, VH, DPR = 1440, 810, 2
OUT_W, OUT_H = 1920, 1080
OUT_NAME = "hd/hd-{slug}.mp4"
reels.VW, reels.VH = VW, VH
FPS = reels.FPS
OUT_DIR = HERE / "hd"
BASE, CHAT_APP = reels.BASE, reels.CHAT_APP

CURSOR = """color => {
  if (document.querySelector('#__cur')) return;
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;width:26px;height:26px;pointer-events:none';
  c.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" fill="#fff" stroke="rgba(12,16,14,.85)" stroke-width="1.3" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-12px;top:-12px;width:50px;height:50px;border-radius:50%;border:2.5px solid ' + color + ';opacity:0"></i>';
  document.body.append(c);
  const ring = c.querySelector('i');
  window.__cur = (x, y) => { c.style.left = x + 'px'; c.style.top = y + 'px'; };
  window.__pulse = () => { ring.__t = 0; ring.style.opacity = '1'; };
  window.__tapStep = ms => {
    if (ring.style.opacity === '0') return;
    ring.__t += ms; const p = Math.min(1, ring.__t / 450);
    ring.style.transform = 'scale(' + (0.3 + p * 0.8) + ')'; ring.style.opacity = String(1 - p);
  };
}"""


class HD(reels.Reel):
    cursor = [VW * .6, VH * .5]

    def tick(self, n: int = 1, capture: bool = True) -> None:
        for _ in range(n):
            self.page.clock.run_for(round(reels.STEP_MS))
            for frame in self.page.frames:
                if "8512" in frame.url:          # o app de agentes segue o próprio ritmo
                    continue
                try:
                    frame.evaluate(reels.CSS_STEP, reels.STEP_MS)
                    frame.evaluate("ms => window.__tapStep && window.__tapStep(ms)", reels.STEP_MS)
                except Exception:
                    pass
            if capture:
                self.shot(1 / FPS)

    def move_to(self, x: float, y: float, seconds: float, bend: float = 0) -> None:
        x0, y0 = self.cursor
        count = max(1, round(seconds * FPS))
        for i in range(count):
            t = (i + 1) / count
            e = t * t * (3 - 2 * t)
            cx, cy = x0 + (x - x0) * e, y0 + (y - y0) * e + bend * 4 * t * (1 - t)
            self.page.mouse.move(cx, cy)
            self.page.evaluate("([x,y]) => window.__cur && window.__cur(x,y)", [cx, cy])
            self.tick()
        self.cursor[:] = [x, y]

    def tap(self, selector: str, pause: float = .6) -> None:
        loc = self.page.locator(selector).first
        box = loc.bounding_box()
        # Garante o centro do alvo na tela com rolagem suave; o clique é do mouse
        # no ponto visível (loc.click() rolaria a página de uma vez, num salto).
        if not box or box["y"] + box["height"] / 2 < 90 or box["y"] + min(box["height"], VH * .5) > VH - 30:
            self.scroll_to(self.y_of(selector) - VH * .4, .6)
            box = loc.bounding_box()
        x = box["x"] + box["width"] / 2
        y = box["y"] + min(box["height"] / 2, (VH - box["y"]) / 2)
        self.move_to(x, y, .55, bend=-14)
        self.page.evaluate("() => window.__pulse && window.__pulse()")
        self.page.mouse.click(x, y)
        self.hold(pause)

    def encode(self, output: pathlib.Path) -> None:
        manifest = self.folder / "lista.txt"
        lines = []
        for name, duration in self.frames:
            lines += [f"file '{name}'\n", f"duration {duration:.5f}\n"]
        lines.append(f"file '{self.frames[-1][0]}'\n")
        manifest.write_text("".join(lines), encoding="utf-8")
        output.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", manifest.name,
            "-fps_mode", "cfr", "-r", str(FPS),
            "-vf", f"scale={OUT_W}:{OUT_H}:flags=lanczos,scale=in_range=full:out_range=tv,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-level", "4.2",
            "-pix_fmt", "yuv420p", "-color_range", "tv", "-movflags", "+faststart", str(output),
        ], cwd=self.folder, check=True)


def mobile_stage(r: HD, context, slug: str, title: str, color: str, bg: str, ink: str) -> None:
    """Celular em mockup, com a página real em 390x844 dentro de um iframe."""
    stage = context.new_page()
    stage.set_viewport_size({"width": VW, "height": VH})
    stage.set_content(f"""<!doctype html><html><head><meta charset="utf-8"><style>
      *{{box-sizing:border-box}} body{{margin:0;width:100vw;height:100vh;overflow:hidden;background:{bg};color:{ink};
      font-family:system-ui,sans-serif;display:grid;grid-template-columns:1fr 470px;align-items:center;padding:0 120px}}
      small{{color:#{color};font:800 13px/1 system-ui;letter-spacing:.28em}}
      h1{{font:800 64px/.95 system-ui;letter-spacing:-.04em;margin:22px 0 18px;max-width:640px}}
      p{{font-size:19px;line-height:1.55;max-width:500px;opacity:.75;margin:0}}
      .phone{{width:370px;height:760px;padding:14px;border-radius:50px;background:#0b0b0b;justify-self:end;
      box-shadow:0 40px 90px #0009,0 0 0 1px #ffffff2a;position:relative}}
      .phone:before{{content:'';position:absolute;z-index:3;top:22px;left:50%;transform:translateX(-50%);width:100px;height:26px;border-radius:999px;background:#0b0b0b}}
      .screen{{width:342px;height:732px;border-radius:38px;overflow:hidden;background:#000}}
      iframe{{width:390px;height:834px;border:0;transform:scale(.877);transform-origin:0 0}}
    </style></head><body><div><small>NO CELULAR · 390 PX</small><h1>{title}</h1>
    <p>Mesma identidade, com navegação, conteúdo e ações reorganizados para o toque.</p></div>
    <div class="phone"><div class="screen"><iframe id="device" src="{BASE}/{slug}/"></iframe></div></div></body></html>""")
    deadline = time.perf_counter() + 60
    mobile = None
    while time.perf_counter() < deadline and mobile is None:
        handle = stage.locator("#device").element_handle()
        mobile = handle.content_frame() if handle else None
        stage.clock.run_for(100)
        time.sleep(.1)
    for _ in range(40):
        stage.clock.run_for(100)
        time.sleep(.05)
    mobile.locator(".menu-btn").wait_for(timeout=60_000)
    s = HD(stage, r.folder)
    s.frames = r.frames
    s.hold(1.0)
    mobile.locator(".menu-btn").click()
    s.hold(1.0)
    mobile.locator(".menu-btn").click()
    s.hold(.4)
    total = float(mobile.evaluate("document.documentElement.scrollHeight - innerHeight"))
    distance = min(total * .42, 2600)
    count = round(max(2.6, distance / (834 * reels.SCROLL_SPEED)) * FPS)
    for i in range(count):
        t = (i + 1) / count
        mobile.evaluate("y => window.scrollTo({top: y, behavior: 'instant'})", distance * t * t * (3 - 2 * t))
        s.tick()
    s.hold(.6)
    stage.close()


# ---------- roteiros de desktop -------------------------------------------------

def d20(r: HD) -> None:
    r.hold(1.2)
    r.move_to(VW * .75, VH * .45, 1.0, 20)
    r.scroll_el(".roll-table", -90, 1.4)
    r.page.evaluate("window.D20.nextRoll = 12")
    r.tap("[data-roll]", 2.4)
    r.scroll_el("#cardapio", 0, 1.0)
    r.scroll_to(r.y_of("#cardapio") + VH * 1.1, 2.4)
    r.scroll_el(".forge", VH * .9, 2.2)


def provisao(r: HD) -> None:
    r.hold(1.2)
    r.move_to(VW * .7, VH * .35, .9, 18)
    r.move_to(VW * .62, VH * .7, .9, -14)
    r.scroll_el(".cabinet", -120, 1.6)
    r.tap('.drawer[data-need="Pele e proteção solar"]', .5)
    r.type_text("#receipt-item", "protetor solar")
    r.hold(.8)
    r.scroll_el("#como-funciona", 700, 2.4)


def speculari(r: HD) -> None:
    r.hold(.8)
    r.move_to(VW * .52, VH * .4, 1.0, 20)
    r.move_to(VW * .72, VH * .52, 1.2, -24)
    r.hold(.5)
    r.scroll_to(r.y_of("#detalhe") + VH * 1.3, 3.0)
    r.scroll_el(".studio", -100, 1.5)
    r.tap('label:has(input[name="shape"][value="cat"])', .5)
    r.tap('label:has(input[name="material"][value="metal dourado fino"])', 1.0)


def nobre(r: HD) -> None:
    r.hold(.8)
    box = r.page.locator(".dn-handle").bounding_box()
    x = box["x"] + box["width"] / 2
    r.move_to(x, VH * .42, .6, -10)
    r.page.mouse.down()
    for target in (x + 250, x - 360):
        r.move_to(target, VH * .42, .9)
    r.page.mouse.up()
    r.hold(.4)
    r.scroll_el("#almoco", 200, 2.0)
    r.scroll_to(r.y_of("#pizza") + VH * 1.2, 3.0)
    r.scroll_el("#unidades", -40, 1.6)
    r.tap('[data-unit="maranguape"]', .9)


def originalfarma(r: HD) -> None:
    r.hold(1.4)
    r.scroll_el(".tags", -220, 1.6)
    r.tap('.tag[data-need="um remédio de uso contínuo"]', .8)
    r.scroll_el(".calendar", -110, 1.4)
    r.tap(".day >> nth=11", .9)
    r.scroll_to(r.y_of("#folhinha") + VH * 1.4, 3.0)


def bar(r: HD) -> None:
    r.hold(1.2)
    r.move_to(VW * .72, VH * .36, .8, 20)
    r.move_to(VW * .42, VH * .58, .8, -18)
    r.scroll_el("#sabores", 260, 2.0)
    r.scroll_el(".flavours", 280, 1.7)
    r.tap(".food-panel >> nth=1", .8)
    r.scroll_el("#pedido", 260, 1.8)
    r.tap('[data-dish="Peixe frito"]', 1.2)


def farmacia_central(r: HD) -> None:
    r.hold(1.2)
    r.move_to(VW * .7, VH * .42, .8, -20)
    r.move_to(VW * .38, VH * .63, .7, 17)
    r.scroll_el("#cuidados", 430, 2.2)
    r.tap('[data-care="Proteção solar e pele"]', .9)
    r.scroll_el("#unidades", 300, 2.0)
    r.tap('[data-unit="Serrinha"] button', 1.3)


def pro_otica(r: HD) -> None:
    r.hold(1.2)
    r.move_to(VW * .76, VH * .35, .85, 18)
    r.move_to(VW * .46, VH * .55, .75, -15)
    r.scroll_to(r.y_of("#colecao") + 1250, 3.0)
    r.scroll_el("#estilo", 220, 2.0)
    r.tap('[data-vibe="criativa"]', .4)
    r.tap('[data-material="translucida"]', 1.3)


SITES = {
    "d20": (d20, "#16110d", "#f5efe1", "Role o dado de qualquer mesa."),
    "provisao": (provisao, "#0f3d47", "#f4f8f8", "O gaveteiro também cabe no bolso."),
    "speculari": (speculari, "#111113", "#f1ebdf", "Foco e ajuste, na palma da mão."),
    "nobre": (nobre, "#3b1517", "#f6efe3", "Do almoço à última fatia, no celular."),
    "originalfarma": (originalfarma, "#2f3f6b", "#f7f8fc", "Lembrete e atendimento no bolso."),
    "bar": (bar, "#0a2b24", "#f4eee2", "Da margem para a mesa, em qualquer tela."),
    "farmacia": (farmacia_central, "#173f35", "#f4f0e8", "Cuidado próximo, unidade por unidade."),
    "pro_otica": (pro_otica, "#101722", "#f4f7fb", "Seu próximo olhar também começa no toque."),
}


def record(browser, key: str) -> dict:
    slug, agent, color, _, question = reels.SITES[key]
    script, bg, ink, title = SITES[key]
    context = browser.new_context(viewport={"width": VW, "height": VH}, device_scale_factor=DPR,
                                  reduced_motion="no-preference", locale="pt-BR")
    context.add_init_script(reels.RECORDING_INIT)
    page = context.new_page()
    reels.freeze_clock(page)
    page.goto(f"{BASE}/{slug}/", wait_until="domcontentloaded", timeout=120_000)
    for _ in range(40):
        page.clock.run_for(100)
        time.sleep(.05)
    page.wait_for_load_state("networkidle")
    for _ in range(20):
        page.clock.run_for(100)
    page.evaluate(CURSOR, f"#{color}")
    page.evaluate("""url => {
        document.querySelector('#ai-btn').click();
        const f = document.querySelector('#ai-box iframe'); if (f) f.src = url;
        document.querySelector('#ai-close').click(); window.scrollTo(0, 0);
    }""", f"{CHAT_APP}?agente={agent}&embed=true&cor={color}")
    page.clock.run_for(500)
    with tempfile.TemporaryDirectory(prefix=f"hd-{key}-") as tmp:
        r = HD(page, pathlib.Path(tmp))
        r.cursor = [VW * .6, VH * .5]
        page.evaluate("([x,y]) => window.__cur(x,y)", r.cursor)
        script(r)
        mobile_stage(r, context, slug, title, color, bg, ink)
        page.bring_to_front()
        answered = r.chat(question)
        if not answered:
            raise RuntimeError(f"{key}: o agente não respondeu; vídeo não gravado.")
        name = {"nobre-restaurante-pizzaria": "nobre-restaurante"}.get(slug, slug) if OUT_W == 1440 else slug
        out = HERE / OUT_NAME.format(slug=name)
        r.encode(out)
        result = {"site": key, "frames": len(r.frames),
                  "duration": round(sum(d for _, d in r.frames), 2), "output": str(out)}
    context.close()
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=SITES)
    parser.add_argument("--classic", action="store_true",
                        help="1440x900 (16:10) em vendas/video-<slug>.mp4, mesmo método determinístico")
    args = parser.parse_args()
    if args.classic:
        global VH, OUT_W, OUT_H, OUT_NAME
        VH, OUT_W, OUT_H, OUT_NAME = 900, 1440, 900, "video-{slug}.mp4"
        reels.VH = VH
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for key in ([args.only] if args.only else list(SITES)):
            print(f"[hd] {key}", file=sys.stderr, flush=True)
            print(json.dumps(record(browser, key), ensure_ascii=False), flush=True)
        browser.close()


if __name__ == "__main__":
    main()
