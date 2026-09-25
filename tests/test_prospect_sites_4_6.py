"""Smoke tests for prospect demos 4, 5 and 6.

Run with the repository root served on port 8765:
    python -m http.server 8765
    python tests/test_prospect_sites_4_6.py
"""

import os
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = os.environ.get(
    "PROSPECT_SITES_ROOT", "http://127.0.0.1:8765/portifolio-site"
).rstrip("/")
SITES = {
    "bar": "bar-do-peixe",
    "farmacia": "farmacia-central",
    "otica": "pro-otica",
}
EVIDENCE = Path(__file__).resolve().parents[1] / "evidencias" / "sites-4-6-setembro-2026"


def assert_layout(page, viewport_width: int) -> None:
    dimensions = page.evaluate(
        """() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
            h1: document.querySelector('h1')?.getBoundingClientRect().toJSON()
        })"""
    )
    assert dimensions["scroll"] <= dimensions["client"] + 2, dimensions
    assert dimensions["h1"] and dimensions["h1"]["width"] > 100, dimensions
    assert dimensions["h1"]["x"] < viewport_width, dimensions


def run() -> None:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for reduced in (False, True):
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                reduced_motion="reduce" if reduced else "no-preference",
            )
            for key, slug in SITES.items():
                page = context.new_page()
                errors: list[str] = []
                page.on("pageerror", lambda error, bag=errors: bag.append(str(error)))
                page.on(
                    "console",
                    lambda message, bag=errors: bag.append(message.text)
                    if message.type == "error" and "favicon" not in message.text
                    else None,
                )
                page.goto(f"{ROOT}/{slug}/", wait_until="domcontentloaded")
                page.wait_for_timeout(900)
                assert_layout(page, 390)
                assert page.locator(".scroll-orbit").count() == 1
                assert page.locator(".text-roll .roll-char").count() > 3
                assert page.locator(".living-cell").count() == 12
                animation_name = page.locator(".living-cell-media").first.evaluate(
                    "el => getComputedStyle(el).animationName"
                )
                assert animation_name == "none" if reduced else animation_name != "none"
                page.locator(".menu-btn").click()
                assert page.locator("#menu").evaluate("el => el.classList.contains('open')")
                page.locator(".menu-btn").click()

                if key == "bar":
                    page.locator('[data-dish="Peixe frito"]').click()
                    assert "Peixe frito" in page.locator("#order-choice").inner_text()
                    assert not page.locator("#order-send").evaluate("el => el.classList.contains('disabled')")
                elif key == "farmacia":
                    page.locator('[data-unit="Serrinha"] button').click()
                    assert "Serrinha" in page.locator("#selected-copy").inner_text()
                    assert "5585985004444" in page.locator("#store-contact").get_attribute("href")
                else:
                    page.locator('[data-vibe="criativa"]').click()
                    page.locator('[data-material="translucida"]').click()
                    assert "Escolha duas" not in page.locator("#style-result").inner_text()
                    assert not page.locator("#style-contact").evaluate("el => el.classList.contains('disabled')")

                page.locator("#ai-btn").click()
                assert page.locator("#ai-box").evaluate("el => el.classList.contains('open')")
                suffix = "reduced" if reduced else "motion"
                page.screenshot(path=EVIDENCE / f"{key}-mobile-{suffix}.png", full_page=False)
                assert not errors, f"{key}/{suffix}: {errors}"
                page.close()
            context.close()

        context = browser.new_context(viewport={"width": 1440, "height": 900})
        for key, slug in SITES.items():
            page = context.new_page()
            errors: list[str] = []
            page.on("pageerror", lambda error, bag=errors: bag.append(str(error)))
            page.goto(f"{ROOT}/{slug}/", wait_until="domcontentloaded")
            page.wait_for_timeout(1200)
            assert_layout(page, 1440)
            assert page.locator(".living-cell").count() == 12
            hero = page.locator(".hero-media" if key == "farmacia" else ".hero")
            bounds = hero.bounding_box()
            page.mouse.move(
                bounds["x"] + bounds["width"] * 0.72,
                bounds["y"] + bounds["height"] * 0.38,
            )
            page.wait_for_timeout(350)
            assert page.locator(".living-cell").nth(5).evaluate(
                "el => getComputedStyle(el).transform !== 'none'"
            )
            page.locator("main section").last.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            assert not errors, f"{key}/desktop: {errors}"
            page.close()
        context.close()
        browser.close()


if __name__ == "__main__":
    run()
    print("Prospect sites 4-6: desktop, mobile, interactions and reduced motion passed")
