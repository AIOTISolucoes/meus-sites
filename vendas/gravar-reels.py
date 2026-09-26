"""Grava versões verticais (Reels/Stories) dos sites: 1080x1920, 30 fps.

Diferente de gravar-videos-prospectos.py (1440x900, tempo real), aqui o
relógio da página é controlado: a cada quadro o tempo avança exatamente 1/30 s
para JavaScript (GSAP, Three.js, timers) e para animações CSS. Assim o vídeo sai
liso mesmo que cada captura em alta resolução demore mais que 33 ms.

Pré-requisitos (iguais aos do outro roteiro):
    python -m http.server 8602 --bind 127.0.0.1           # raiz do repositório
    streamlit run app.py --server.port 8512                # agentes (chave Groq)

Uso:
    python vendas/gravar-reels.py --only d20
    python vendas/gravar-reels.py                          # todos
Saída: vendas/reels/reels-<slug>.mp4
"""

from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
import time

from playwright.sync_api import Frame, Page, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:8602/portifolio-site"
CHAT_APP = "http://127.0.0.1:8512/"
VW, VH, DPR = 360, 640, 3          # 360x640 CSS px x3 = 1080x1920
FPS = 30
STEP_MS = 1000 / FPS
OUT_DIR = ROOT / "vendas" / "reels"
SCROLL_SPEED = 0.9               # alturas de tela por segundo, no máximo (média)

# Avança animações CSS/Web Animations junto com o relógio falso.
CSS_STEP = """ms => {
  for (const a of document.getAnimations()) {
    if (!a.__rec) { a.__rec = true; a.pause(); }
    const t = typeof a.currentTime === 'number' ? a.currentTime : 0;
    a.currentTime = t + ms;
  }
}"""

TAP_RING = """color => {
  if (document.querySelector('#__tap')) return;
  const r = document.createElement('div');
  r.id = '__tap';
  r.style.cssText = 'position:fixed;left:-99px;top:-99px;width:54px;height:54px;margin:-27px 0 0 -27px;' +
    'border-radius:50%;border:3px solid ' + color + ';background:rgba(255,255,255,.28);' +
    'z-index:2147483647;pointer-events:none;opacity:0;transform:scale(.4)';
  document.body.append(r);
  window.__tap = (x, y) => { r.style.left = x + 'px'; r.style.top = y + 'px'; r.__t = 0; r.style.opacity = '1'; };
  window.__tapStep = ms => {
    if (r.style.opacity === '0') return;
    r.__t = (r.__t || 0) + ms;
    const p = Math.min(1, r.__t / 420);
    r.style.transform = 'scale(' + (0.4 + p * 0.8) + ')';
    r.style.opacity = String(1 - p);
  };
}"""


RECORDING_INIT = """
(() => {
  const css = document.createElement('style');
  css.textContent = 'html, body { scroll-behavior: auto !important; }';
  (document.head || document.documentElement).append(css);
  const nativeScrollTo = window.scrollTo.bind(window);
  const smooth = y => {
    const s = window.scrollY, d = y - s, t0 = performance.now(), dur = 650;
    const step = now => {
      const p = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      nativeScrollTo(0, s + d * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  window.scrollTo = function (a, b) {
    if (a && typeof a === 'object') {
      const y = a.top ?? window.scrollY;
      return a.behavior === 'smooth' ? smooth(y) : nativeScrollTo(0, y);
    }
    return nativeScrollTo(a, b);
  };
  Element.prototype.scrollIntoView = function (o) {
    const r = this.getBoundingClientRect();
    const block = (o && o.block) || 'start';
    let y = window.scrollY + r.top;
    if (block === 'center') y -= (innerHeight - r.height) / 2;
    else if (block === 'end') y -= innerHeight - r.height;
    return (o && o.behavior === 'smooth') ? smooth(y) : nativeScrollTo(0, y);
  };
})();
"""


def freeze_clock(context_or_page) -> None:
    """Instala o relógio falso e o PAUSA: só anda quando chamamos run_for."""
    import datetime
    t0 = datetime.datetime(2026, 9, 26, 12, 0, 0)
    context_or_page.clock.install(time=t0)
    context_or_page.clock.pause_at(t0 + datetime.timedelta(seconds=1))


class Reel:
    def __init__(self, page: Page, folder: pathlib.Path) -> None:
        self.page = page
        self.folder = folder
        self.frames: list[tuple[str, float]] = []

    # ---- relógio e captura -------------------------------------------------
    def tick(self, n: int = 1, capture: bool = True) -> None:
        for _ in range(n):
            self.page.clock.run_for(round(STEP_MS))
            for frame in self.page.frames:
                if frame == self.page.main_frame:
                    try:
                        frame.evaluate(CSS_STEP, STEP_MS)
                        frame.evaluate("ms => window.__tapStep && window.__tapStep(ms)", STEP_MS)
                    except Exception:
                        pass
            if capture:
                self.shot(1 / FPS)

    def shot(self, duration: float) -> None:
        name = f"f{len(self.frames):05d}.jpg"
        self.page.screenshot(path=str(self.folder / name), type="jpeg", quality=93)
        self.frames.append((name, duration))

    def hold(self, seconds: float) -> None:
        self.tick(max(1, round(seconds * FPS)))

    # ---- ações ---------------------------------------------------------------
    def y_of(self, selector: str) -> float:
        return float(self.page.eval_on_selector(selector, "el => el.getBoundingClientRect().top + scrollY"))

    def scroll_to(self, target: float, seconds: float) -> None:
        start = float(self.page.evaluate("scrollY"))
        # Limite de velocidade: rolagem rápida demais a 30 fps parece tremida.
        seconds = max(seconds, abs(target - start) / (VH * SCROLL_SPEED))
        count = max(1, round(seconds * FPS))
        for i in range(count):
            t = (i + 1) / count
            e = t * t * (3 - 2 * t)
            self.page.evaluate("y => window.scrollTo({top: y, behavior: 'instant'})", start + (target - start) * e)
            self.tick()

    def scroll_el(self, selector: str, offset: float, seconds: float) -> None:
        self.scroll_to(self.y_of(selector) + offset, seconds)

    def tap(self, selector: str, pause: float = .6) -> None:
        loc = self.page.locator(selector).first
        box = loc.bounding_box()
        if not box or box["y"] < 60 or box["y"] + box["height"] > VH - 20:
            self.scroll_to(self.y_of(selector) - VH * .35, .5)
            box = loc.bounding_box()
        x = box["x"] + box["width"] / 2
        y = box["y"] + min(box["height"] / 2, (VH - box["y"]) / 2)
        self.page.evaluate("([x,y]) => window.__tap(x,y)", [x, y])
        self.page.mouse.click(x, y)             # sem o salto de rolagem do loc.click()
        self.hold(pause)

    def hscroll(self, selector: str, distance: float, seconds: float) -> None:
        count = max(1, round(seconds * FPS))
        # Sem scroll-snap durante a gravação: com ele cada quadro pula um card inteiro.
        start = float(self.page.eval_on_selector(selector, """el => {
            el.style.scrollSnapType = 'none'; el.style.scrollBehavior = 'auto';
            return el.scrollLeft; }"""))
        for i in range(count):
            t = (i + 1) / count
            e = t * t * (3 - 2 * t)
            self.page.eval_on_selector(selector, "(el, x) => { el.scrollLeft = x; }", start + distance * e)
            self.tick()

    def type_text(self, selector: str, text: str, frame: Frame | None = None) -> None:
        target = (frame or self.page).locator(selector).first
        target.click()
        for ch in text:
            target.type(ch, delay=0)
            self.tick(2)

    def drag_x(self, selector: str, dx_list: list[float], y_ratio: float, seconds_each: float) -> None:
        box = self.page.locator(selector).bounding_box()
        x = box["x"] + box["width"] / 2
        y = VH * y_ratio
        self.page.evaluate("([x,y]) => window.__tap(x,y)", [x, y])
        self.page.mouse.move(x, y)
        self.page.mouse.down()
        for dx in dx_list:
            x0 = x
            count = max(1, round(seconds_each * FPS))
            for i in range(count):
                t = (i + 1) / count
                x = x0 + dx * t * t * (3 - 2 * t)
                self.page.mouse.move(x, y)
                self.tick()
        self.page.mouse.up()

    # ---- chat real -------------------------------------------------------------
    def chat(self, question: str) -> bool:
        page = self.page
        page.locator("#ai-btn").click()
        self.hold(.6)
        frame = None
        limit = time.perf_counter() + 90
        while time.perf_counter() < limit and frame is None:
            handle = page.locator("#ai-box iframe").element_handle()
            frame = handle.content_frame() if handle else None
            self.page.clock.run_for(100)
            time.sleep(.1)
        field = frame.locator("textarea, [contenteditable=true]").first
        # Enquanto o app carrega, o relógio corre em tempo real e sem gravar.
        while time.perf_counter() < limit:
            try:
                if field.is_visible():
                    break
            except Exception:
                pass
            self.page.clock.run_for(150)
            time.sleep(.15)
        self.hold(.5)
        before = frame.locator('[data-testid="stChatMessage"]').count()
        field.click()
        for ch in question:
            field.type(ch, delay=0)
            self.tick(1)
        self.hold(.3)
        field.press("Enter")
        # Espera real pela resposta, gravando poucos quadros (o trecho fica curto).
        answered = False
        stable = 0
        wait_start = len(self.frames)
        deadline = time.perf_counter() + 90
        while time.perf_counter() < deadline:
            self.page.clock.run_for(250)
            time.sleep(.25)
            self.tick(1)
            try:
                state = frame.evaluate("""() => ({
                    count: document.querySelectorAll('[data-testid="stChatMessage"]').length,
                    thinking: document.body.innerText.includes('Pensando')
                })""")
            except Exception:
                continue
            if state["count"] >= before + 2 and not state["thinking"]:
                stable += 1
                if stable >= 3:
                    answered = True
                    break
            else:
                stable = 0
        waited = self.frames[wait_start:]
        if len(waited) > 45:                      # no máximo 1,5 s de "Pensando…"
            keep = waited[:: max(1, len(waited) // 45)][:45]
            self.frames[wait_start:] = keep
        # Rola a conversa (suave, quadro a quadro) até a resposta ficar no topo.
        self.hold(.3)
        try:
            frame.evaluate("""() => {
                const msgs = [...document.querySelectorAll('[data-testid="stChatMessage"]')];
                const last = msgs[msgs.length - 1];
                let box = last.parentElement;
                while (box && !(box.scrollHeight > box.clientHeight + 4 &&
                       /(auto|scroll)/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
                box = box || document.scrollingElement;
                box.style.scrollBehavior = 'auto';
                const top = box === document.scrollingElement ? 0 : box.getBoundingClientRect().top;
                const prev = msgs[msgs.length - 2];
                const anchor = prev || last;
                window.__chatScroll = { box, start: box.scrollTop,
                  end: box.scrollTop + anchor.getBoundingClientRect().top - top - 8 };
            }""")
            steps = round(.9 * FPS)
            for i in range(steps):
                t = (i + 1) / steps
                e = 1 - (1 - t) ** 3
                frame.evaluate("e => { const s = window.__chatScroll; s.box.scrollTop = s.start + (s.end - s.start) * e; }", e)
                self.tick()
        except Exception as exc:
            print(f"[reels] rolagem do chat falhou: {exc}", file=sys.stderr)
        self.hold(4.0)
        return answered

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
            "-vf", "scale=1080:1920:flags=lanczos,scale=in_range=full:out_range=tv,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-level", "4.2",
            "-pix_fmt", "yuv420p", "-color_range", "tv", "-movflags", "+faststart", str(output),
        ], cwd=self.folder, check=True)


# ---------- roteiros por site (celular) ------------------------------------------

def d20(r: Reel) -> None:
    r.hold(2.2)
    r.scroll_el(".roll-table", -40, 1.4)
    r.page.evaluate("window.D20.nextRoll = 12")   # Alquimista: lanche com foto oficial
    r.tap("[data-roll]", 1.7)                      # o dado gira inteiro (1,4 s) na tela
    r.scroll_el(".roll-result", -60, 1.0)
    r.hold(2.0)
    r.scroll_el("#panel-burgers", -140, 1.2)
    r.hscroll("#panel-burgers", 900, 2.4)
    r.scroll_el(".forge", 0, .8)
    r.scroll_el(".forge", 520, 2.0)


def provisao(r: Reel) -> None:
    r.hold(2.2)
    r.scroll_el(".cabinet", -90, 1.4)
    r.tap('.drawer[data-need="Pele e proteção solar"]', 1.0)
    r.type_text("#receipt-item", "protetor solar")
    r.hold(1.0)
    r.scroll_el("#como-funciona", 200, 2.2)


def speculari(r: Reel) -> None:
    r.hold(3.0)
    r.scroll_el("#detalhe", 0, 1.2)
    r.scroll_el("#detalhe", 420, 1.6)
    r.scroll_el(".studio", -70, 1.2)
    r.tap('label:has(input[name="shape"][value="cat"])', .7)
    r.tap('label:has(input[name="material"][value="metal dourado fino"])', 1.0)


def nobre(r: Reel) -> None:
    r.hold(1.2)
    r.drag_x(".dn-handle", [110, -220], .42, .9)
    r.hold(.4)
    r.scroll_el("#almoco", -20, 1.5)
    r.scroll_el(".dusk", 0, 1.6)
    r.scroll_el("#pizza", 200, 1.8)
    r.scroll_el(".wedges", -120, 1.4)
    r.scroll_el("#unidades", -40, 1.2)
    r.tap('[data-unit="maranguape"]', .9)


def originalfarma(r: Reel) -> None:
    r.hold(2.2)
    r.scroll_el(".tags", -160, 1.3)
    r.tap('.tag[data-need="um remédio de uso contínuo"]', .9)
    r.scroll_el(".calendar", -40, 1.3)
    r.tap(".day >> nth=11", .9)
    r.scroll_el("#folhinha", 60, 1.8)


def bar(r: Reel) -> None:
    r.hold(2.2)
    r.scroll_el("#sabores", 60, 1.6)
    r.scroll_el("#pedido", 80, 1.8)
    r.tap('[data-dish="Peixe frito"]', 1.2)


def farmacia_central(r: Reel) -> None:
    r.hold(2.2)
    r.scroll_el("#cuidados", 80, 1.6)
    r.tap('[data-care="Proteção solar e pele"]', .9)
    r.scroll_el("#unidades", 60, 1.6)
    r.tap('[data-unit="Serrinha"] button', 1.2)


def pro_otica(r: Reel) -> None:
    r.hold(2.2)
    r.scroll_el("#colecao", 0, 1.4)
    r.scroll_el("#colecao", 700, 2.0)
    r.scroll_el("#estilo", 40, 1.4)
    r.tap('[data-vibe="criativa"]', .6)
    r.tap('[data-material="translucida"]', 1.0)


SITES = {
    "d20": ("d20-hamburgueria", "d20_hamburgueria", "e0a93b", d20,
            "Oi! Gosto de hambúrguer defumado e com bacon. Qual vocês indicam?"),
    "provisao": ("farmacia-provisao", "farmacia_provisao", "e8876a", provisao,
                 "Oi! Procuro protetor solar. Vocês conseguem ver se tem na loja antes de eu ir?"),
    "speculari": ("speculari-otica", "speculari_otica", "d9b877", speculari,
                  "Oi! Quero ajuda para escolher uma armação de grau. Posso provar alguns formatos na loja?"),
    "nobre": ("nobre-restaurante-pizzaria", "nobre_restaurante", "c9a45c", nobre,
              "Oi! Quero pedir uma pizza para quatro pessoas hoje à noite. Como faço?"),
    "originalfarma": ("originalfarma", "originalfarma", "f2d56b", originalfarma,
                      "Oi! Tomo remédio de pressão todo mês. Vocês conseguem ver se tem na unidade Residencial?"),
    "bar": ("bar-do-peixe", "bar_do_peixe", "ff7658", bar,
            "Oi! Quero pedir peixe frito para duas pessoas. Como funciona?"),
    "farmacia": ("farmacia-central", "farmacia_central", "ff7968", farmacia_central,
                 "Oi! Procuro protetor solar. Vocês conseguem verificar opções e estoque na unidade Serrinha?"),
    "pro_otica": ("pro-otica", "pro_otica", "78a8ff", pro_otica,
                  "Oi! Quero uma armação leve e translúcida. A equipe pode me ajudar a experimentar opções?"),
}


def record(browser, key: str) -> dict:
    slug, agent, color, script, question = SITES[key]
    context = browser.new_context(viewport={"width": VW, "height": VH}, device_scale_factor=DPR,
                                  is_mobile=True, has_touch=True, reduced_motion="no-preference",
                                  locale="pt-BR")
    context.add_init_script(RECORDING_INIT)
    page = context.new_page()
    freeze_clock(page)
    page.goto(f"{BASE}/{slug}/", wait_until="domcontentloaded", timeout=120_000)
    # Deixa scripts, fontes e imagens assentarem antes de gravar.
    for _ in range(40):
        page.clock.run_for(100)
        time.sleep(.05)
    page.wait_for_load_state("networkidle")
    for _ in range(20):
        page.clock.run_for(100)
    page.evaluate(TAP_RING, f"#{color}")
    # O iframe do agente aponta para o app local.
    page.evaluate("""url => {
        const btn = document.querySelector('#ai-btn'); btn.click();
        const f = document.querySelector('#ai-box iframe'); if (f) f.src = url;
        document.querySelector('#ai-close').click(); window.scrollTo(0, 0);
    }""", f"{CHAT_APP}?agente={agent}&embed=true&cor={color}")
    page.clock.run_for(500)
    with tempfile.TemporaryDirectory(prefix=f"reel-{key}-") as tmp:
        reel = Reel(page, pathlib.Path(tmp))
        script(reel)
        answered = reel.chat(question)
        if not answered:
            raise RuntimeError(f"{key}: o agente não respondeu; Reels não gravado.")
        out = OUT_DIR / f"reels-{slug}.mp4"
        reel.encode(out)
        result = {"site": key, "frames": len(reel.frames),
                  "duration": round(sum(d for _, d in reel.frames), 2), "output": str(out)}
    context.close()
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=SITES)
    args = parser.parse_args()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for key in ([args.only] if args.only else list(SITES)):
            print(f"[reels] {key}", file=sys.stderr, flush=True)
            print(json.dumps(record(browser, key), ensure_ascii=False), flush=True)
        browser.close()


if __name__ == "__main__":
    main()
