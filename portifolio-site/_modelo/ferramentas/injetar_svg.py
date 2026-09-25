# -*- coding: utf-8 -*-
"""Cola o brasão e o monograma DENTRO do index.html.

Por que inline e não <img src="brasao.svg">: a intro anima os grupos separados
(o script "Gentleman" se desenhando), e isso exige o SVG no mesmo documento.
Por que não buscar com fetch(): o cliente pode abrir o index.html com dois
cliques, em file://, onde fetch é barrado por CORS — o site abriria sem logo.

Roda uma vez só. Depois disso o index.html é editável à mão normalmente; se
precisar regerar, os marcadores voltam junto (o script os repõe).
"""
import re, os

PASTA = r"C:\Users\Iagho\OneDrive\projeto\portifolio-site\gentleman"
HTML = os.path.join(PASTA, "index.html")


def corpo(arquivo):
    """Tira o invólucro <svg> e devolve só os paths de dentro, indentados."""
    s = open(os.path.join(PASTA, "assets", arquivo), encoding="utf-8").read()
    dentro = re.search(r"<svg[^>]*>(.*)</svg>", s, re.S).group(1)
    linhas = [l.strip() for l in dentro.strip().splitlines() if l.strip()]
    return "\n".join("      " + l for l in linhas)


html = open(HTML, encoding="utf-8").read()
for marcador, arquivo in (("BRASAO", "brasao.svg"), ("MONOGRAMA", "monograma.svg")):
    # aceita tanto o marcador virgem quanto um bloco já injetado antes
    alvo = re.compile(
        rf"(\n\s*)<!--{marcador}-->.*?(?=\n\s*</svg>)", re.S)
    if not alvo.search(html):
        raise SystemExit(f"marcador {marcador} não encontrado — o index.html mudou de forma?")
    html = alvo.sub(lambda m: f"{m.group(1)}<!--{marcador}-->\n" + corpo(arquivo), html, count=1)

open(HTML, "w", encoding="utf-8").write(html)
print("index.html:", os.path.getsize(HTML) // 1024, "kB")
