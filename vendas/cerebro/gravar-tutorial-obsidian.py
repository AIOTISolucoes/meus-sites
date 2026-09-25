"""B-roll do "onde baixa": o site do Obsidian, em 9:16, pro mesmo Reels do cerebro.

Companheiro do vendas/cerebro/gravar-cerebro.py. Aquele mostra o cerebro pronto; este
mostra o caminho pra ter um: obsidian.md -> botao de baixar -> a lista de
plataformas (PC, Mac, Linux, celular).

Coreografia (~13s, pra caber nos 10-15s finais de um Reels de 40s):
  1. abre obsidian.md e respira no hero
  2. ponteiro ate "Get Obsidian for Windows" e clica
  3. cai no /download com o botao gigante -> clica (o download e CANCELADO)
  4. desce ate a lista de plataformas: Windows, Mac, Linux, iOS, Android
  5. BEAT OPCIONAL: o repositorio no GitHub de onde o instalador vem de verdade

⚠️ O beat 5 e o ultimo do video justamente pra voce poder cortar fora na edicao
se achar que confunde quem nunca ouviu falar de GitHub. Grava com --github
(padrao) ou sem, com --sem-github.

⚠️ O screenshot do Playwright NAO desenha o ponteiro do mouse nem a barra de
download do Chrome. O cursor aqui e sintetico, injetado na pagina; e o download
em si nao aparece na tela -- quem conta que baixou e a sua narracao.

⚠️ Viewport de 900px de largura joga o site no layout de celular. Isso e
proposital: fonte grande le bem no Reels.

    python vendas/cerebro/gravar-tutorial-obsidian.py frames-tutorial
    ffmpeg -y -f concat -safe 0 -i frames-tutorial/lista.txt -fps_mode cfr -r 25 \
      -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-tutorial-obsidian.mp4
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith("--")]
SAIDA = pathlib.Path(args[0] if args else "frames-tutorial")
GITHUB = "--sem-github" not in sys.argv

URL = "https://obsidian.md/"
REPO = "https://github.com/obsidianmd/obsidian-releases/releases/latest"
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
L, A = 900, 1600          # 9:16 nativo de Reels, igual ao video do cerebro
FPS = 25

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]
_pos = [L / 2, A * 0.62]

CURSOR = """
() => {
  if (document.getElementById('__cur')) return;
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:34px;height:34px;pointer-events:none;will-change:transform';
  c.innerHTML =
    '<svg viewBox="0 0 24 24" width="34" height="34">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(9,9,20,.8)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-13px;top:-13px;width:60px;height:60px;border-radius:50%;' +
    'border:3px solid rgba(124,92,255,.95);opacity:0;transform:scale(.3)"></i>';
  document.body.appendChild(c);
  const anel = c.querySelector('i');
  window.__cur = (x, y) => { c.style.left = x + 'px'; c.style.top = y + 'px'; };
  window.__pulso = () => {
    anel.style.transition = 'none';
    anel.style.opacity = '.95';
    anel.style.transform = 'scale(.3)';
    requestAnimationFrame(() => {
      anel.style.transition = 'transform .5s ease-out, opacity .5s ease-out';
      anel.style.opacity = '0';
      anel.style.transform = 'scale(1)';
    });
  };
}
"""


def salvar(pag, dur):
    _n[0] += 1
    p = SAIDA / f"f{_n[0]:05d}.jpg"
    pag.screenshot(path=str(p), type="jpeg", quality=88)
    frames.append((p.name, dur))


def tempo_real(pag, segundos, alvo_fps=14):
    """Captura o mais rapido possivel por N segundos, medindo a duracao real de
    cada frame pro video sair na velocidade certa."""
    fim = time.perf_counter() + segundos
    ant = time.perf_counter()
    while time.perf_counter() < fim:
        salvar(pag, 0)
        agora = time.perf_counter()
        frames[-1] = (frames[-1][0], agora - ant)
        ant = agora
        folga = (1.0 / alvo_fps) - (time.perf_counter() - agora)
        if folga > 0:
            time.sleep(folga)


def rolar(pag, de, ate, segundos):
    """Scroll deterministico, com aceleracao e freada nas pontas."""
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        pag.evaluate("y => window.scrollTo(0, y)", de + (ate - de) * s)
        salvar(pag, 1.0 / FPS)
    return ate


def preparar(pag):
    """Injeta o cursor e o poe onde ele estava. Roda de novo a cada navegacao:
    a pagina nova nasce sem o cursor, e sem isto o ponteiro some no corte."""
    pag.evaluate(CURSOR)
    pag.evaluate("([x, y]) => window.__cur(x, y)", _pos)


def mover(pag, x, y):
    pag.mouse.move(x, y)
    pag.evaluate("([x, y]) => window.__cur(x, y)", [x, y])
    _pos[0], _pos[1] = x, y


def mover_ate(pag, x, y, segundos, curva=0.0):
    """Leva o ponteiro ate um ponto. `curva` empurra o caminho pro lado: mao
    humana nao anda em linha reta."""
    x0, y0 = _pos
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        desvio = curva * (4 * t * (1 - t))   # maximo no meio do trajeto
        mover(pag, x0 + (x - x0) * s, y0 + (y - y0) * s + desvio)
        salvar(pag, 1.0 / FPS)


def caixa(loc, frac_x=0.5):
    """Ponto de mira dentro do elemento. Erra de proposito se ele nao existir:
    melhor quebrar a gravacao do que gerar um video clicando no vazio.

    ⚠️ `frac_x` existe por causa dos links em lista do /download: a caixa deles
    tem a largura da coluna inteira (316px) e o texto mora so na esquerda, entao
    mirar no centro larga o ponteiro no vazio, ao lado do rotulo.
    """
    b = loc.first.bounding_box()
    if not b:
        raise RuntimeError("elemento fora da tela na hora de mirar o ponteiro")
    return b["x"] + b["width"] * frac_x, b["y"] + b["height"] / 2


def ir_ate(pag, loc, segundos=1.1, curva=0.0, frac_x=0.5):
    x, y = caixa(loc, frac_x)
    mover_ate(pag, x, y, segundos, curva=curva)
    return x, y


def piscar(pag, seg=0.4):
    """Dispara o anel do clique e SEGURA a captura enquanto ele abre.

    ⚠️ O anel leva ~0.5s pra expandir. Pulsar e navegar em seguida deixa o
    efeito em um unico frame, e o video parece que pulou de pagina sozinho.
    """
    pag.evaluate("() => window.__pulso()")
    tempo_real(pag, seg)


with sync_playwright() as pw:
    nav = pw.chromium.launch(executable_path=CHROME)
    ctx = nav.new_context(viewport={"width": L, "height": A},
                          accept_downloads=False,
                          reduced_motion="no-preference")
    pag = ctx.new_page()
    # o instalador tem ~100MB e nao aparece na captura de qualquer jeito:
    # deixa o clique acontecer de verdade, mas joga o arquivo fora.
    pag.on("download", lambda d: d.cancel())

    # --- 1. o hero: "e um site normal, obsidian.md"
    pag.goto(URL, wait_until="load")
    pag.wait_for_timeout(1200)
    preparar(pag)
    tempo_real(pag, 1.2)

    # --- 2. o botao de baixar do hero
    botao_hero = pag.locator('a:has-text("Get Obsidian for")').first
    botao_hero.scroll_into_view_if_needed()
    ir_ate(pag, botao_hero, 1.0, curva=-60)
    tempo_real(pag, 0.35)
    piscar(pag)
    with pag.expect_navigation(wait_until="load"):
        botao_hero.click()
    pag.wait_for_timeout(900)
    preparar(pag)
    tempo_real(pag, 1.1)

    # --- 3. o botao gigante do /download
    # ⚠️ "Download Obsidian" e o rotulo do layout de desktop. Em 900px de
    # largura o site cai no layout de celular e o botao vira "Download for
    # Windows" -- por isso o seletor mira o prefixo, que serve pros dois.
    botao = pag.locator('a:has-text("Download for")').first
    botao.wait_for(timeout=15000)
    ir_ate(pag, botao, 1.0, curva=40)
    tempo_real(pag, 0.3)
    piscar(pag)
    botao.click()
    tempo_real(pag, 0.9)

    # --- 4. a lista de plataformas: de graca em tudo quanto e aparelho
    y_app = pag.evaluate("""() => {
        const h = [...document.querySelectorAll('h2')]
            .find(e => e.textContent.trim().toLowerCase() === 'app');
        return h ? h.getBoundingClientRect().top + window.scrollY : 900;
    }""")
    rolar(pag, 0, max(0, y_app - 120), 1.5)
    tempo_real(pag, 0.9)
    # ⚠️ A tabela inteira (iOS, Android, Windows, Mac, Linux) cabe numa tela so.
    # Rolar de novo aqui nao mostra plataforma nenhuma a mais, so entrega o
    # rodape. Entao o movimento vem do ponteiro, descendo ate o .exe do Windows
    # -- que e o arquivo que o espectador vai baixar.
    # DOM: o 1o "Universal" e o .exe (Windows); o 2o e o .dmg (Mac).
    ir_ate(pag, pag.locator('a:has-text("Universal")').first, 1.2, curva=35,
           frac_x=0.13)
    tempo_real(pag, 1.2)

    # --- 5. de onde o arquivo vem de verdade (corte opcional na edicao)
    if GITHUB:
        pag.goto(REPO, wait_until="domcontentloaded")
        pag.wait_for_timeout(2800)
        # o GitHub em 900px ainda desenha o layout de desktop: sem zoom, o nome
        # dos arquivos fica ilegivel num celular.
        pag.evaluate("() => { document.body.style.zoom = '1.5'; }")
        pag.wait_for_timeout(500)
        y_ass = pag.evaluate("""() => {
            const e = [...document.querySelectorAll('summary, h2, h3')]
                .find(e => e.textContent.trim().startsWith('Assets'));
            return e ? e.getBoundingClientRect().top + window.scrollY : 0;
        }""")
        pag.evaluate("y => window.scrollTo(0, y)", max(0, y_ass - 220))
        # sem cursor aqui de proposito: com zoom no body, o ponteiro fixo sai
        # do lugar. E cena nova, nao tem ponteiro pra acompanhar.
        tempo_real(pag, 2.4)

    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames),
                  "dur_total": round(sum(d for _, d in frames), 2),
                  "github": GITHUB}))
