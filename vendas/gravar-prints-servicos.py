"""Gera os prints do carrossel da pagina de servicos (servicos/).

Serve portifolio-site/ num http local e fotografa o hero de cada site depois
que a intro termina.

O print e CORTADO ABAIXO DA BARRA DE TOPO de proposito: e ali que fica a logo
do cliente, e a maioria deles ainda nao foi abordada. Nenhum nome de cliente
aparece na pagina de servicos -- so o ramo.

Antes de acrescentar um site na lista, ABRIR O JPG E OLHAR. Ja foram
descartados:
  - colmeia-encantada  -> mostra o @ do cliente num botao do hero
  - reservaiguatemi    -> marca na foto, e e franquia
  - srbessa            -> ainda e o _modelo, com os [[placeholders]] na tela

Uso:  python vendas/gravar-prints-servicos.py
"""
import functools
import http.server
import socketserver
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SITES = RAIZ / "portifolio-site"
SAIDA = RAIZ / "servicos" / "assets" / "exemplos"
PORTA = 8711

# pasta do site -> nome do arquivo. A ordem de exibicao quem manda e o
# array EXEMPLOS do servicos/js/dados.js, nao esta lista.
ALVOS = [
    ("gentleman",        "estilo-01"),
    ("northbarber",      "estilo-02"),
    ("spacobeauty",      "estilo-03"),
    ("fisioclin",        "estilo-04"),
    ("jkpapelaria",      "estilo-05"),
    ("claudia",          "estilo-06"),
    ("butterflydreams",  "estilo-07"),
    ("estudioeconceito", "estilo-08"),
    ("felix",            "estilo-09"),
]


def servir():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler,
                                directory=str(SITES))
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", PORTA), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    srv = servir()
    with sync_playwright() as p:
        nav = p.chromium.launch()
        # reduced_motion: este PC reporta "reduce" e as intros nao rodam
        ctx = nav.new_context(viewport={"width": 1440, "height": 900},
                              device_scale_factor=2,
                              reduced_motion="no-preference")
        page = ctx.new_page()
        for pasta, nome in ALVOS:
            page.goto(f"http://127.0.0.1:{PORTA}/{pasta}/", wait_until="load")
            page.wait_for_timeout(6000)          # deixa a intro terminar
            altura_nav = page.evaluate("""() => {
                const e = document.querySelector('header, .nav, nav');
                return e ? Math.round(e.getBoundingClientRect().height) : 0;
            }""")
            bruto = SAIDA / f"{nome}.png"
            page.screenshot(path=str(bruto))
            img = Image.open(bruto).convert("RGB")
            corte = min(altura_nav, 140) * 2     # device_scale_factor = 2
            img = img.crop((0, corte, img.width, img.height))
            img = img.resize((1280, round(1280 * img.height / img.width)),
                             Image.LANCZOS)
            img.save(SAIDA / f"{nome}.jpg", quality=86, optimize=True)
            bruto.unlink()
            print(f"ok {nome}  <- {pasta}")
        ctx.close()
        nav.close()
    srv.shutdown()


if __name__ == "__main__":
    main()
