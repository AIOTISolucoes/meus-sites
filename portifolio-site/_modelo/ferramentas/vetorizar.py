# -*- coding: utf-8 -*-
"""Vetoriza o brasão da Gentleman a partir da foto de perfil (150x150).

O Instagram só entrega a logo em 150x150 (as URLs de resolução maior voltam
403), então não dá pra "baixar o vetor": ele é reconstruído aqui.

Receita: amplia com LANCZOS -> borra de leve -> limiariza -> marching squares
(skimage) -> Douglas-Peucker -> Catmull-Rom virando cúbicas. O borrão antes do
limiar é o que tira a escadinha do pixel; sem ele o contorno sai serrilhado e
a logo parece recortada com tesoura sem fio.

Saída: assets/brasao.svg, com os contornos separados em 3 grupos (cabeça /
script "Gentleman" / faixa+navalha) pra intro poder animar um de cada vez.
"""
import numpy as np
from PIL import Image, ImageFilter
from skimage import measure
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SAIDA = r"C:\Users\Iagho\OneDrive\projeto\portifolio-site\gentleman\assets"

ESCALA = 8            # 150 -> 1200
LIMIAR = 0.42         # a logo é branca sobre preto
BORRAO = 2.4          # em pixels da imagem ampliada
TOLERANCIA = 1.15     # Douglas-Peucker, em pixels ampliados
AREA_MINIMA = 90      # descarta cisco de compressão jpeg

VIEW = 200.0          # o SVG final vive num viewBox 0 0 200 200


def carregar():
    im = Image.open(os.path.join(BASE, "orig", "p00.jpg")).convert("L")
    n = im.size[0] * ESCALA
    im = im.resize((n, n), Image.LANCZOS).filter(ImageFilter.GaussianBlur(BORRAO))
    return np.asarray(im, dtype=float) / 255.0


def catmull_para_bezier(pts, fechado=True):
    """Passa uma curva suave pelos pontos. Catmull-Rom -> cúbicas de Bézier.

    Sem isto o path vira uma sequência de retas: em letra cursiva a diferença
    é gritante, o 'G' fica com cara de polígono.
    """
    n = len(pts)
    d = [f"M {pts[0][0]:.2f} {pts[0][1]:.2f}"]
    for i in range(n if fechado else n - 1):
        p0 = pts[(i - 1) % n]
        p1 = pts[i % n]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d.append(f"C {c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}")
    if fechado:
        d.append("Z")
    return " ".join(d)


def area(pts):
    x = pts[:, 0]
    y = pts[:, 1]
    return abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1))) / 2.0


img = carregar()
lado = img.shape[0]
contornos = measure.find_contours(img, LIMIAR)

grupos = {"cabeca": [], "script": [], "faixa": []}
for c in contornos:
    c = measure.approximate_polygon(c, tolerance=TOLERANCIA)
    if len(c) < 4:
        continue
    # find_contours devolve (linha, coluna) = (y, x)
    pts = np.column_stack([c[:, 1], c[:, 0]]) * (VIEW / lado)
    if area(pts) < AREA_MINIMA * (VIEW / lado) ** 2:
        continue
    ymin, ymax = pts[:, 1].min(), pts[:, 1].max()
    centro = (ymin + ymax) / 2 / VIEW
    if centro < 0.455:
        alvo = "cabeca"
    elif ymin / VIEW < 0.70:
        alvo = "script"
    else:
        alvo = "faixa"
    grupos[alvo].append((area(pts), catmull_para_bezier(pts)))

partes = []
for nome in ("cabeca", "script", "faixa"):
    itens = sorted(grupos[nome], key=lambda t: -t[0])
    print(f"{nome:8} {len(itens):>2} contornos  maior={itens[0][0]:.0f}" if itens else f"{nome}: vazio")
    d = " ".join(p for _, p in itens)
    partes.append(f'  <path class="{nome}" fill-rule="evenodd" d="{d}"/>')

svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor">\n'
    "  <!-- Brasão da Gentleman Barbearia, vetorizado da foto de perfil (o IG só\n"
    "       entrega 150x150). Gerado por scratchpad/vetorizar.py. -->\n"
    + "\n".join(partes)
    + "\n</svg>\n"
)
os.makedirs(SAIDA, exist_ok=True)
caminho = os.path.join(SAIDA, "brasao.svg")
open(caminho, "w", encoding="utf-8").write(svg)
print("->", caminho, os.path.getsize(caminho) // 1024, "kB")

# ---------------------------------------------------------------- MONOGRAMA
# O brasão inteiro vira borrão abaixo de ~90px (lição paga no LS), então a nav
# leva só a cabeça.
#
# ⚠️ Não dá pra separar a cabeça escolhendo contornos: no desenho a barba
# encosta na gravata, que encosta nas lapelas — tudo isso é UMA região branca
# conectada, um contorno só. A separação tem que ser feita no BITMAP, antes de
# traçar. A caixa abaixo está em coordenadas da imagem original de 150x150.
CAIXA_CABECA = (54, 17, 95, 56)     # esquerda, topo, direita, base

x0c, y0c, x1c, y1c = [v * ESCALA for v in CAIXA_CABECA]
recorte = img[y0c:y1c, x0c:x1c]
altura_rec, largura_rec = recorte.shape

cabecas = []
for c in measure.find_contours(recorte, LIMIAR):
    c = measure.approximate_polygon(c, tolerance=2.2)
    if len(c) < 4:
        continue
    pts = np.column_stack([c[:, 1], c[:, 0]])
    if area(pts) < 260:            # cisco de jpeg na borda do recorte
        continue
    cabecas.append(pts)

todos = np.vstack(cabecas)
x0, y0 = todos[:, 0].min(), todos[:, 1].min()
esc = 100.0 / max(todos[:, 0].max() - x0, todos[:, 1].max() - y0)
dx = (100 - (todos[:, 0].max() - x0) * esc) / 2
dy = (100 - (todos[:, 1].max() - y0) * esc) / 2

d = " ".join(
    catmull_para_bezier([((p[0] - x0) * esc + dx, (p[1] - y0) * esc + dy) for p in pts])
    for pts in sorted(cabecas, key=lambda p: -area(p))
)
mono = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">\n'
    "  <!-- Monograma da Gentleman: só a cabeça do brasão, simplificada pra\n"
    "       aguentar 34px na nav. Gerado por scratchpad/vetorizar.py. -->\n"
    f'  <path fill-rule="evenodd" d="{d}"/>\n</svg>\n'
)
caminho = os.path.join(SAIDA, "monograma.svg")
open(caminho, "w", encoding="utf-8").write(mono)
print("->", caminho, os.path.getsize(caminho) // 1024, "kB")
