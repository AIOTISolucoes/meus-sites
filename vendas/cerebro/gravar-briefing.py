"""B-roll curto (~5s): o Claude Code lendo o cofre e cuspindo o briefing inteiro.

Quarto da serie do Reels, junto com gravar-cerebro.py, gravar-tutorial-obsidian.py
e gravar-ia-obsidian.py. Mesmo 9:16 de 900x1600.

⚠️ A cena e uma RECRIACAO do terminal (vendas/cerebro/briefing-terminal.html), nao uma
captura de tela do CLI rodando. O TEXTO do briefing e real -- sai das notas
`O gargalo`, `As 7 barbearias`, `Melhor horário pra abordar`,
`Mensagem de abordagem` e `Preço` do cofre `cerebro`. O que e desenhado e a
moldura. Motivo de nao gravar o terminal de verdade: o monitor deste PC e
1280x720, uma janela vertical de 900x1600 nao cabe nele, e captura de janela
(ffmpeg gdigrab) so pega o que esta visivel na tela.

Coreografia (~5s):
  1. o comando sendo digitado
  2. as leituras do cofre aparecendo
  3. rolagem continua ate o fim do briefing
  4. um respiro na ultima linha ("a primeira acao, agora")

    python vendas/cerebro/gravar-briefing.py frames-briefing
    ffmpeg -y -f concat -safe 0 -i frames-briefing/lista.txt -fps_mode cfr -r 25 \
      -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-briefing.mp4
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-briefing")
CENA = (pathlib.Path(__file__).parent / "briefing-terminal.html").resolve()
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
L, A = 900, 1600
FPS = 25
COMANDO = "monta o briefing pra eu abordar as barbearias"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]


def salvar(pag, dur):
    _n[0] += 1
    p = SAIDA / f"f{_n[0]:05d}.jpg"
    pag.screenshot(path=str(p), type="jpeg", quality=90)
    frames.append((p.name, dur))


def suave(t):
    """easeInOutCubic. Rolagem linear parece esteira; esta parte e freia."""
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def segurar(pag, segundos):
    for _ in range(max(1, int(segundos * FPS))):
        salvar(pag, 1.0 / FPS)


def digitar(pag, texto, segundos):
    """Escreve o comando letra a letra dentro do proprio <span>."""
    n = len(texto)
    por_letra = segundos / n
    for i in range(1, n + 1):
        pag.evaluate("t => document.getElementById('digitado').textContent = t",
                     texto[:i])
        salvar(pag, por_letra)


def rolar(pag, de, ate, segundos):
    n = max(1, int(segundos * FPS))
    for i in range(n):
        pag.evaluate("y => window.scrollTo(0, y)", de + (ate - de) * suave((i + 1) / n))
        salvar(pag, 1.0 / FPS)
    return ate


with sync_playwright() as pw:
    nav = pw.chromium.launch(executable_path=CHROME)
    ctx = nav.new_context(viewport={"width": L, "height": A},
                          reduced_motion="no-preference")
    pag = ctx.new_page()
    pag.goto(CENA.as_uri())
    pag.wait_for_timeout(700)

    # 1. o comando
    segurar(pag, 0.25)
    digitar(pag, COMANDO, 0.85)
    segurar(pag, 0.2)

    # 2. Enter: some o cursor, aparece a resposta
    pag.evaluate("""() => {
        document.getElementById('cursor').style.display = 'none';
        document.getElementById('saida').style.visibility = 'visible';
    }""")
    segurar(pag, 0.55)

    # 3. a rolagem ate o fim
    fim = pag.evaluate("() => document.body.scrollHeight - window.innerHeight")
    print("altura rolavel:", fim, file=sys.stderr)
    rolar(pag, 0, fim, 3.0)

    # 4. respiro na ultima linha
    segurar(pag, 0.65)
    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames),
                  "dur_total": round(sum(d for _, d in frames), 2)}))
