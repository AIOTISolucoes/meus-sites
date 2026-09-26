"""Seleciona, redimensiona e trata a cor das imagens do M.Lar Lago para o Reels.

Uso: python preparar-imagens.py <pasta do Drive baixada>

A pasta de origem é a do Drive da imobiliária (subpastas "02. Imagens",
"03. Plantas", "04. Book" e "05. Fotos Apto Decorado"). As imagens tratadas
vão para img/. O tratamento é leve e igual para todas: nível de luminância,
equilíbrio sutil entre renders e fotos e nitidez de saída. Nada é
acrescentado ou removido das imagens.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "img"

# nome de saída: (subpasta, arquivo, tipo). "render" = perspectiva ilustrada; "foto" = decorado.
SELECAO = {
    "fachada": ("02. Imagens", "FACHADA JPEG.jpg", "render"),
    "portaria": ("02. Imagens", "GUARITA JPEG.jpg", "render"),
    "piscina": ("02. Imagens", "PISCINA 01 JPEG.jpg", "render"),
    "piscina-deck": ("02. Imagens", "PISCINA 02 JPEG.jpg", "render"),
    "deck": ("02. Imagens", "DECK JPEG.jpg", "render"),
    "academia": ("02. Imagens", "ACADEMIA 02 JPEG.jpg", "render"),
    "gourmet": ("02. Imagens", "GOURMET JEPG.jpg", "render"),
    "festas": ("02. Imagens", "SALÃO DE FESTAS 02 JPEG.jpg", "render"),
    "brinquedoteca": ("02. Imagens", "BRINQUEDOTECA JPEG.jpg", "render"),
    "playground": ("02. Imagens", "PLAYGROUND JPEG.jpg", "render"),
    "campo": ("02. Imagens", "QUADRA.jpg", "render"),
    "piquenique": ("02. Imagens", "PIQUENIQUE JPEG.jpg", "render"),
    "lounge": ("02. Imagens", "ESTAR EXTERNO JPEG.jpg", "render"),
    "minimarket": ("02. Imagens", "MINI MARKET.jpg", "render"),
    "sala-vertical": ("05. Fotos Apto Decorado", "leosoares-25.jpg", "foto"),
    "sala": ("05. Fotos Apto Decorado", "leosoares-32.jpg", "foto"),
    "cozinha": ("05. Fotos Apto Decorado", "leosoares-35.jpg", "foto"),
    "varanda": ("05. Fotos Apto Decorado", "leosoares-27.jpg", "foto"),
    "suite": ("05. Fotos Apto Decorado", "leosoares-5.jpg", "foto"),
    "closet": ("05. Fotos Apto Decorado", "leosoares-9.jpg", "foto"),
    "quarto-kids": ("05. Fotos Apto Decorado", "leosoares-18.jpg", "foto"),
    "quarto": ("05. Fotos Apto Decorado", "leosoares-13.jpg", "foto"),
    "planta-c": ("03. Plantas", "Tipo C 66,93m².jpg", "planta"),
}

# Lado menor de saída: sobra suficiente para os movimentos de câmera em 1080x1920.
MENOR_LADO = {"render": 2200, "foto": 2200, "planta": 2000}


def luminancia_niveis(arr, lo_pct=0.25, hi_pct=99.6):
    """Estica só a luminância (preserva o balanço de cor de cada imagem)."""
    lum = arr @ np.array([0.2126, 0.7152, 0.0722])
    lo, hi = np.percentile(lum, [lo_pct, hi_pct])
    ganho = 250.0 / max(hi - lo, 1)
    return np.clip((arr - lo) * ganho, 0, 255)


def tratar(im, tipo):
    arr = np.asarray(im.convert("RGB"), dtype=np.float32)
    if tipo == "planta":
        return Image.fromarray(arr.astype(np.uint8))
    arr = luminancia_niveis(arr)
    if tipo == "foto":
        # O decorado foi fotografado mais neutro/frio que os renders; aproxima com calor sutil.
        arr = arr * np.array([1.025, 1.0, 0.965])
    else:
        # Renders vêm muito saturados; segura um pouco para casar com as fotos.
        lum = (arr @ np.array([0.2126, 0.7152, 0.0722]))[..., None]
        arr = lum + (arr - lum) * 0.92
    # Curva suave em S para dar corpo sem estourar.
    x = np.clip(arr / 255.0, 0, 1)
    x = x + 0.22 * x * (1 - x) * (2 * x - 1)
    return Image.fromarray(np.clip(x * 255, 0, 255).astype(np.uint8))


def redimensionar(im, menor):
    w, h = im.size
    s = menor / min(w, h)
    if abs(s - 1) < 0.01:
        return im
    im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    if s > 1:  # render ampliado: devolve um pouco do microcontraste
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=2))
    return im


def logo(origem):
    """Recorta o logo branco da capa do book e tira o fundo verde."""
    import pymupdf

    pdf = next((origem / "04. Book").glob("*.pdf"))
    pix = pymupdf.open(pdf)[0].get_pixmap(dpi=600, clip=pymupdf.Rect(270, 240, 550, 350))
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    arr = np.asarray(im, dtype=np.float32)
    lum = arr @ np.array([0.2126, 0.7152, 0.0722])
    alpha = np.clip((lum - 120) / (230 - 120), 0, 1)
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    out = Image.fromarray(rgba)
    out = out.crop(out.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox())
    out.save(OUT / "logo-mlar-lago.png", optimize=True)
    print("logo", out.size)


def main():
    origem = Path(sys.argv[1])
    OUT.mkdir(exist_ok=True)
    for nome, (pasta, arquivo, tipo) in SELECAO.items():
        im = Image.open(origem / pasta / arquivo)
        im = redimensionar(tratar(im, tipo), MENOR_LADO[tipo])
        im.save(OUT / f"{nome}.jpg", quality=92, subsampling=0, optimize=True)
        print(nome, im.size)
    logo(origem)


if __name__ == "__main__":
    main()
