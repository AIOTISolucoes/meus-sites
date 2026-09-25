"""Visual smoke test for the three September 2026 prospect demos.

Run while the repository root is served locally, for example:
    python -m http.server 8602
    python tests/test_three_local_sites.py
"""

from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = "http://127.0.0.1:8602/portifolio-site"
SITES = {
    "vizzio": "otica-vizzio-fashion",
    "morada": "restaurante-morada-nova",
    "louro": "louro-caipira",
}
EVIDENCE = Path(__file__).resolve().parents[1] / "evidencias" / "sites-setembro-2026"


def assert_layout(page, width: int) -> None:
    dimensions = page.evaluate(
        """() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
            h1: document.querySelector('h1')?.getBoundingClientRect().toJSON()
        })"""
    )
    assert dimensions["scroll"] <= dimensions["client"] + 2, dimensions
    assert dimensions["h1"] and dimensions["h1"]["width"] > 100, dimensions
    assert dimensions["h1"]["x"] < width, dimensions


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
                page.wait_for_timeout(700)
                assert_layout(page, 390)
                assert page.locator(".scroll-orbit").count() == 1
                assert page.locator(".text-roll .roll-char").count() > 3
                page.locator(".menu-btn").click()
                assert page.locator("#menu").evaluate("el => el.classList.contains('open')")

                if key == "vizzio":
                    page.locator('[data-face="round"]').click()
                    page.locator('[data-vibe="marcante"]').click()
                    assert "Escolha duas" not in page.locator("#finder-result").inner_text()
                elif key == "morada":
                    page.locator('[data-add="Cozido de boi"]').click()
                    total = page.locator("#order-total").inner_text().replace("\xa0", " ")
                    assert total == "R$ 16,99", repr(total)
                    assert not page.locator("#send-order").evaluate("el => el.classList.contains('disabled')")
                else:
                    page.locator('.select-dish[data-dish="Ostras"]').click()
                    assert "Ostras" in page.locator("#interest").inner_text()
                    page.locator("#reserve-with-ai").click()
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
            page.goto(f"{ROOT}/{slug}/", wait_until="networkidle")
            page.wait_for_timeout(900)
            assert_layout(page, 1440)
            page.screenshot(path=EVIDENCE / f"{key}-desktop.png", full_page=False)
            if key == "vizzio":
                media = page.locator("[data-magnify]").first
                media.scroll_into_view_if_needed()
                media.hover()
                page.wait_for_timeout(450)
                assert media.evaluate("el => el.classList.contains('is-magnifying')")
                page.screenshot(path=EVIDENCE / "vizzio-magnifier.png", full_page=False)
            elif key == "morada":
                repeat = page.locator("[data-repeat-image]")
                repeat.scroll_into_view_if_needed()
                repeat.hover()
                page.wait_for_timeout(900)
                page.screenshot(path=EVIDENCE / "morada-repeat.png", full_page=False)
            else:
                deck = page.locator(".deck")
                deck.scroll_into_view_if_needed()
                deck.hover(position={"x": 400, "y": 240})
                page.wait_for_timeout(650)
                assert deck.evaluate("el => el.classList.contains('is-tilting')")
                page.screenshot(path=EVIDENCE / "louro-deck-premium.png", full_page=False)
            assert not errors, f"{key}/desktop: {errors}"
            page.close()
        context.close()
        browser.close()


if __name__ == "__main__":
    run()
    print("3 sites: desktop, mobile and reduced-motion checks passed")
