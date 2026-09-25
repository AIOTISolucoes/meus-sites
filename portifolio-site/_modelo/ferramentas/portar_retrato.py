# -*- coding: utf-8 -*-
"""Leva o retrato da bancada (retrato.html) pro index.html do site.

A bancada existe pra iterar o desenho sozinho, sem recarregar a página
inteira. Este script é o que garante que os dois não divirjam: o index.html
recebe exatamente os paths que foram aprovados na bancada.
"""
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))
HTML = r"C:\Users\Iagho\OneDrive\projeto\portifolio-site\gentleman\index.html"

bancada = open(os.path.join(BASE, "retrato.html"), encoding="utf-8").read()
miolo = re.search(r'const SVG = `\s*<svg viewBox="0 0 300 360">(.*?)</svg>`;',
                  bancada, re.S).group(1)

# o <defs> e o <title> do site são próprios (id do gradiente, acessibilidade)
miolo = re.sub(r"<defs>.*?</defs>", "", miolo, flags=re.S).strip()
miolo = "\n".join("        " + l.strip() for l in miolo.splitlines() if l.strip())

html = open(HTML, encoding="utf-8").read()
novo = (
    '        <!-- Este retrato NÃO é o brasão vetorizado: naquele, barba e\n'
    '             cabelo são a mesma mancha branca e não dá pra separar. Este foi\n'
    '             desenhado por partes, no mesmo espírito, pra que cabelo, barba e\n'
    '             sobrancelha possam ser trocados. Iterado em scratchpad/retrato.html. -->\n'
    + miolo
)
alvo = re.compile(r"(</defs>\n)(.*?)(\n      </svg>)", re.S)
if not alvo.search(html):
    raise SystemExit("não achei o bloco do retrato no index.html")
html = alvo.sub(lambda m: m.group(1) + "\n" + novo + m.group(3), html, count=1)
open(HTML, "w", encoding="utf-8").write(html)
print("retrato portado ·", os.path.getsize(HTML) // 1024, "kB")
