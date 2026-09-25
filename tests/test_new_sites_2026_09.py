"""Testes dos sites de prospecção criados em 25/09/2026.

Uso (raiz do repositório servida na porta 8765):
    python -m http.server 8765 --bind 127.0.0.1
    python tests/test_new_sites_2026_09.py              # todos
    python tests/test_new_sites_2026_09.py provisao     # só um

Cada site declara: título, CTA principal, destinos externos esperados e uma
função que exercita a interação-assinatura. O chat é testado até abrir o
iframe do agente; a resposta real do agente é validada no roteiro de vídeo,
porque depende do app Streamlit e da chave do modelo.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import unquote

from playwright.sync_api import Page, sync_playwright

ROOT = os.environ.get("NEW_SITES_ROOT", "http://127.0.0.1:8765/portifolio-site").rstrip("/")
EVIDENCE = Path(__file__).resolve().parents[1] / "evidencias" / "sites-7-11-setembro-2026"
VIEWPORTS = [
    (320, 568), (375, 667), (390, 844), (393, 852), (430, 932),
    (768, 1024), (1024, 768), (1366, 768), (1440, 900), (1920, 1080),
]


def provisao_signature(page: Page) -> None:
    whatsapp = page.locator("#receipt-whatsapp")
    assert whatsapp.get_attribute("aria-disabled") == "true"
    page.locator('.drawer[data-need="Pele e proteção solar"]').click()
    assert page.locator('.drawer[data-need="Pele e proteção solar"]').get_attribute("aria-pressed") == "true"
    assert "Pele e proteção solar" in page.locator("#receipt-need").inner_text()
    page.fill("#receipt-item", "protetor solar FPS 50")
    href = unquote(whatsapp.get_attribute("href"))
    assert href.startswith("https://wa.me/5585981833811?text="), href
    assert "protetor solar FPS 50" in href and "retirar na loja" in href, href
    assert whatsapp.get_attribute("aria-disabled") == "false"
    page.locator('.drawer[data-need="Falar com o farmacêutico"]').click()
    assert "farmacêutico" in unquote(whatsapp.get_attribute("href"))


SITES = {
    "provisao": {
        "slug": "farmacia-provisao",
        "title": "Farmácia Provisão",
        "cta": 'a.btn-coral[href="#gaveteiro"]',
        "links": ["tel:+5585981833811", "https://www.instagram.com/farmaciasprovisao/"],
        "signature": provisao_signature,
    },
}


def collect_errors(page: Page) -> list[str]:
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))
    page.on("console", lambda msg: errors.append(msg.text)
            if msg.type == "error" and "favicon" not in msg.text else None)
    page.on("requestfailed", lambda req: errors.append(f"requestfailed: {req.url}")
            if "streamlit" not in req.url and "8512" not in req.url else None)
    return errors


def check_layout(page: Page, width: int) -> None:
    dims = page.evaluate("""() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        h1: document.querySelector('h1').getBoundingClientRect().toJSON(),
        broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src)
    })""")
    assert dims["scroll"] <= dims["client"] + 1, f"overflow horizontal em {width}px: {dims}"
    assert dims["h1"]["width"] > 100 and dims["h1"]["right"] <= width + 1, dims
    assert not dims["broken"], dims["broken"]


def check_menu(page: Page) -> None:
    button = page.locator(".menu-btn")
    if not button.is_visible():
        return
    button.click()
    assert button.get_attribute("aria-expanded") == "true"
    assert page.locator("#menu").evaluate("el => el.classList.contains('open')")
    page.keyboard.press("Escape")
    assert button.get_attribute("aria-expanded") == "false"


def check_chat(page: Page) -> None:
    page.locator("#ai-btn").click()
    assert page.locator("#ai-box").is_visible()
    assert page.locator("#ai-btn").get_attribute("aria-expanded") == "true"
    src = page.locator("#ai-box iframe").get_attribute("src")
    assert "agente=" in src and "embed=true" in src, src
    page.keyboard.press("Escape")
    assert not page.locator("#ai-box").is_visible()
    assert page.evaluate("document.activeElement.id") == "ai-btn"


def check_keyboard(page: Page) -> None:
    page.keyboard.press("Tab")
    first = page.evaluate("document.activeElement.className + ' ' + document.activeElement.textContent")
    assert "skip" in first, first
    outline = page.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    assert outline != "none", outline


def run(selected: list[str]) -> None:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for key in selected:
            site = SITES[key]
            url = f"{ROOT}/{site['slug']}/"
            for reduced in ("no-preference", "reduce"):
                for width, height in VIEWPORTS:
                    ctx = browser.new_context(viewport={"width": width, "height": height}, reduced_motion=reduced)
                    page = ctx.new_page()
                    errors = collect_errors(page)
                    page.goto(url, wait_until="networkidle")
                    page.wait_for_timeout(500)
                    assert site["title"] in page.title(), page.title()
                    check_layout(page, width)
                    assert page.locator(site["cta"]).first.is_visible()
                    if width in (320, 390, 1440):
                        check_keyboard(page)
                        check_menu(page)
                        site["signature"](page)
                        check_chat(page)
                        # Rola até o fim: nada pode sumir nem estourar.
                        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        page.wait_for_timeout(700)
                        check_layout(page, width)
                        page.screenshot(path=str(EVIDENCE / f"{key}-{width}-{reduced}.png"))
                    hrefs = page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))")
                    for expected in site["links"]:
                        assert expected in hrefs, f"link ausente: {expected}"
                    assert not errors, f"{key} {width} {reduced}: {errors}"
                    ctx.close()
            # Sem GSAP/CDN: conteúdo continua visível e a interação funciona.
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            ctx.route("**/cdn.jsdelivr.net/npm/gsap*/**", lambda route: route.abort())
            page = ctx.new_page()
            page.goto(url, wait_until="load")
            page.wait_for_timeout(600)
            assert page.locator("h1").is_visible()
            opacity = page.eval_on_selector("h1", "el => getComputedStyle(el).opacity")
            assert opacity == "1", opacity
            site["signature"](page)
            ctx.close()
            print(f"{key}: {len(VIEWPORTS)} viewports x 2 modos de movimento, interação, menu, chat e fallback sem GSAP OK")
        browser.close()


if __name__ == "__main__":
    run(sys.argv[1:] or list(SITES))
