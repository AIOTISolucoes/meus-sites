# -*- coding: utf-8 -*-
"""Corta em 3:4 e uniformiza as fotos do feed da Gentleman.

As fotos vêm de posts e de frames de reel, com temperaturas diferentes.
O filtro é QUENTE de propósito: a identidade do salão é a parede de tijolo, e
lavar a cor dela tiraria o que o site tem de mais reconhecível.
"""
from PIL import Image, ImageEnhance, ImageFilter
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SAIDA = r"C:\Users\Iagho\OneDrive\projeto\portifolio-site\gentleman\assets"
os.makedirs(SAIDA, exist_ok=True)

LARG, ALT = 780, 1040          # 3:4

# (arquivo, nome final, giro, foco horizontal 0..1, foco vertical 0..1, pré-corte)
# O pré-corte serve pra jogar fora tarja e rótulo do post ANTES de enquadrar.
FOTOS = [
    # só o painel "DEPOIS" do antes/depois — o rótulo do post fica de fora
    ("p01", "alinhamento",       0,   0.50, 0.50, (325, 95, 640, 515)),
    ("p03", "platinado-touca",   0,   0.50, 0.42, None),
    ("p04", "infantil-sorriso",  0,   0.56, 0.46, None),
    ("p05", "cachos-degrade",    0,   0.50, 0.42, None),
    ("p06", "platinado-lateral", 0,   0.52, 0.42, None),
    ("p07", "barba-navalha",    90,   0.45, 0.50, None),   # reel gravado deitado
    ("p08", "fachada",           0,   0.50, 0.05, None),   # o letreiro fica no topo
    ("p09", "infantil-espelho",  0,   0.46, 0.42, None),
    ("p12", "pai-e-filho",       0,   0.50, 0.46, None),
]


def cortar(im, fx, fy):
    """Corta o maior retângulo 3:4 possível, centrado no ponto de interesse."""
    l, a = im.size
    if l / a > LARG / ALT:                 # larga demais: corta dos lados
        nova_l = int(a * LARG / ALT)
        x = int((l - nova_l) * fx)
        x = max(0, min(x, l - nova_l))
        im = im.crop((x, 0, x + nova_l, a))
    else:                                  # alta demais: corta em cima/embaixo
        nova_a = int(l * ALT / LARG)
        y = int((a - nova_a) * fy)
        y = max(0, min(y, a - nova_a))
        im = im.crop((0, y, l, y + nova_a))
    return im.resize((LARG, ALT), Image.LANCZOS)


def esquentar(im, forca=0.055):
    """Puxa o vermelho e segura o azul — o mesmo desvio pra todas as fotos."""
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * (1 + forca))))
    b = b.point(lambda v: int(v * (1 - forca * 0.85)))
    return Image.merge("RGB", (r, g, b))


for arq, nome, giro, fx, fy, pre in FOTOS:
    im = Image.open(os.path.join(BASE, "orig", arq + ".jpg")).convert("RGB")
    if giro:
        im = im.rotate(giro, expand=True)
    if pre:
        im = im.crop(pre)
    im = cortar(im, fx, fy)
    im = ImageEnhance.Color(im).enhance(0.86)      # tira o excesso de saturação do reel
    im = ImageEnhance.Contrast(im).enhance(1.10)
    im = esquentar(im)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.5, percent=55, threshold=3))
    destino = os.path.join(SAIDA, nome + ".jpg")
    im.save(destino, quality=86, optimize=True, progressive=True)
    print(f"{nome:20} {os.path.getsize(destino)//1024:>4} kB")
