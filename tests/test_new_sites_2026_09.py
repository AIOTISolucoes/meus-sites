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


def speculari_signature(page: Page) -> None:
    cta = page.locator("#studio-cta")
    page.locator('label:has(input[name="shape"][value="cat"])').click()
    page.locator('label:has(input[name="material"][value="metal dourado fino"])').click()
    page.locator("#presence").fill("5")
    page.locator("#presence").dispatch_event("input")
    art = page.locator("[data-frame]")
    assert art.get_attribute("data-shape") == "cat"
    assert art.get_attribute("data-tone") == "gold"
    assert page.locator(".frame .lens").first.get_attribute("href") == "#lens-cat"
    assert "bem marcante" in page.locator("#presence-out").inner_text()
    href = unquote(cta.get_attribute("href"))
    assert href.startswith("https://wa.me/5585981082522?text="), href
    assert "gatinho" in href and "metal dourado" in href and "bem marcante" in href, href


def d20_signature(page: Page) -> None:
    page.wait_for_function("() => !window.D20Die || window.D20Die.ready", timeout=8000)
    button = page.locator("[data-roll]")
    button.click()
    page.wait_for_function("() => document.querySelector('[data-result-number]').textContent.trim() !== '—'", timeout=8000)
    page.wait_for_function("() => !document.querySelector('[data-roll]').disabled", timeout=8000)
    number = int(page.locator("[data-result-number]").inner_text())
    assert 1 <= number <= 20, number
    actions = page.locator("[data-result-actions]")
    if number == 1:
        assert actions.is_hidden()
    else:
        href = unquote(page.locator("[data-result-whatsapp]").get_attribute("href"))
        assert href.startswith("https://wa.me/5585989379116?text="), href
        assert f"Rolei {number}" in href, href
    # Resultado determinístico pela API usada pelo dado.
    page.evaluate("window.D20.showResult(4)")
    assert page.locator("[data-result-class]").inner_text() == "Bárbaro"
    photo = page.locator("[data-result-photo] img")
    assert photo.is_visible() and photo.get_attribute("src").endswith("cardapio/barbaro.webp")
    page.evaluate("window.D20.showResult(18)")
    assert photo.is_hidden()
    assert "foto no pedido oficial" in page.locator("[data-result-photo]").get_attribute("data-note")
    assert page.locator(".card-photo").count() == 7
    page.evaluate("window.D20.showResult(20)")
    assert "crítico" in page.locator("[data-result-class]").inner_text()
    tab = page.locator("#tab-entradas")
    tab.click()
    assert page.locator("#panel-entradas").is_visible() and page.locator("#panel-burgers").is_hidden()
    tab.press("ArrowRight")
    assert page.locator("#tab-combos").get_attribute("aria-selected") == "true"
    page.locator("#tab-combos").press("Home")
    assert page.locator("#panel-burgers").is_visible()
    assert page.locator(".forge .slice").count() == 7


def nobre_signature(page: Page) -> None:
    handle = page.locator(".dn-handle")
    handle.focus()
    handle.press("End")
    assert handle.get_attribute("aria-valuenow") == "96"
    handle.press("Home")
    assert handle.get_attribute("aria-valuetext") == "Noite"
    page.fill('#booking input[name="nome"]', "Ana")
    page.fill('#booking input[name="pessoas"]', "6")
    page.fill('#booking input[name="dia"]', "2026-10-03")
    page.select_option('#booking select[name="unidade"]', "Maranguape")
    href = unquote(page.locator("#booking-send").get_attribute("href"))
    assert href.startswith("https://wa.me/5585981774418?text="), href
    assert "Sou Ana" in href and "6 pessoas" in href and "Maranguape" in href and "03/10" in href, href
    page.locator('[data-unit="maranguape"]').click()
    assert page.locator('[data-unit="maranguape"]').get_attribute("aria-checked") == "true"
    assert page.locator("[data-unit-order]").get_attribute("href") == "https://nobremaranguape.menudino.com/"
    assert page.locator("[data-unit-whatsapp]").get_attribute("href") == "https://wa.me/558533412675"
    page.locator('[data-unit="maranguape"]').press("ArrowRight")
    assert page.locator("[data-unit-order]").get_attribute("href") == "https://maracanaunobre.menudino.com/"


def originalfarma_signature(page: Page) -> None:
    send = page.locator("#ticket-send")
    assert send.get_attribute("aria-disabled") == "true"
    page.locator('.tag[data-need="itens para bebê"]').click()
    href = unquote(send.get_attribute("href"))
    assert href.startswith("https://wa.me/5585985101245?text=") and "itens para bebê" in href, href
    assert page.locator('.tag[data-need="itens para bebê"]').get_attribute("aria-pressed") == "true"
    ics = page.locator("[data-ics]")
    assert ics.is_disabled()
    page.fill('#calendar input[name="label"]', "remédio da pressão")
    page.locator(".day").nth(11).click()
    assert page.locator(".day").nth(11).get_attribute("aria-checked") == "true"
    assert page.locator(".day.alert").inner_text() == "10"
    page.locator(".day").nth(11).press("ArrowRight")
    assert page.locator(".day").nth(12).get_attribute("aria-checked") == "true"
    whats = unquote(page.locator("[data-cal-whatsapp]").get_attribute("href"))
    assert "remédio da pressão" in whats and "dia 13" in whats, whats
    with page.expect_download() as info:
        ics.click()
    path = info.value.path()
    body = open(path, encoding="utf-8").read()
    assert "BEGIN:VCALENDAR" in body and "RRULE:FREQ=MONTHLY;BYMONTHDAY=11" in body, body
    assert "SUMMARY:Repor remédio da pressão" in body, body
    page.locator(".day").nth(0).click()
    assert "penúltimo dia do mês anterior" in page.locator("[data-cal-summary]").inner_text()


SITES = {
    "provisao": {
        "slug": "farmacia-provisao",
        "title": "Farmácia Provisão",
        "cta": 'a.btn-coral[href="#gaveteiro"]',
        "links": ["tel:+5585981833811", "https://www.instagram.com/farmaciasprovisao/"],
        "signature": provisao_signature,
    },
    "speculari": {
        "slug": "speculari-otica",
        "title": "Speculari Ótica",
        "cta": 'a.btn-ivory[href="#formatos"]',
        "links": ["https://www.instagram.com/speculariotica/"],
        "signature": speculari_signature,
    },
    "d20": {
        "slug": "d20-hamburgueria",
        "title": "D20 Hamburgueria",
        "cta": 'a.btn-ochre[href="https://d20hamburgueria.saipos.com/home"]',
        "links": ["https://d20hamburgueria.saipos.com/home", "https://api.whatsapp.com/send?phone=5585989379116",
                  "https://instagram.com/d20burger"],
        "signature": d20_signature,
    },
    "nobre": {
        "slug": "nobre-restaurante-pizzaria",
        "title": "Nobre Restaurante e Pizzaria",
        "cta": 'a.btn-wine[href="#unidades"]',
        "links": ["https://maracanaunobre.menudino.com/", "https://nobremaranguape.menudino.com/"],
        "signature": nobre_signature,
    },
    "originalfarma": {
        "slug": "originalfarma",
        "title": "Originalfarma",
        "cta": 'a.btn-butter[href="#atalhos"]',
        "links": ["https://www.instagram.com/originalfarma01/", "tel:192"],
        "signature": originalfarma_signature,
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
                    ctx = browser.new_context(viewport={"width": width, "height": height}, reduced_motion=reduced, accept_downloads=True)
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
            ctx = browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
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
