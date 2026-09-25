"""Renderiza video demo de site de cliente frame a frame, MOSTRANDO INTERACAO.

Pra outro cliente: trocar URL, CHAT, MSG1/MSG2 e a coreografia dentro do bloco
`with sync_playwright()`. O irmao mais simples deste arquivo (so scroll, sem
cursor nem clique) e o vendas/gravar-video.py, do Estudio E Conceito.

Grava contra servidores LOCAIS: copiar a pasta do site pro scratchpad, trocar o
data-url do widget por localhost:8512 e subir `python -m http.server 8600` +
`python -m streamlit run app.py --server.port 8512`. Assim nao depende do deploy
nem sofre com o app da nuvem dormindo.

Escrito originalmente pro site da Claudia Andrade (51,7s), a partir do
vendas/gravar-video.py (Estudio E Conceito), com uma diferenca
grande: aqui o video mostra INTERACAO, nao so scroll. Entao entram tres coisas
novas:

  1. Um cursor sintetico desenhado na propria pagina. O screenshot do Playwright
     NAO desenha o ponteiro do mouse, entao sem isso o video mostraria paineis
     mudando sozinhos e a onda afundando por magia.
  2. Fases de ponteiro: o mouse real se move (pra valer o hover e a fisica da
     onda) e o cursor falso acompanha, quadro a quadro.
  3. Fases de tempo real no meio do percurso (respiracao, leitura dos paineis),
     nao so no comeco e no fim.

Ordem: intro -> onda do hero -> servicos -> mapa do corpo (3 cliques) ->
galeria -> respiracao -> chat.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames")
URL = "http://localhost:8600/"
CHAT = "http://localhost:8512/?agente=claudia_massoterapia&embed=true&cor=1f4e96"
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
W, H = 1440, 900
FPS = 25
TETO_ESPERA = 3.0

MSG1 = "Oi! Minha lombar ta doendo faz uns dias"
MSG2 = "Ventosa. Pode ser sabado de tarde?"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]

# O cursor falso: uma seta branca com contorno escuro (le em fundo claro e
# escuro) e um anel que pulsa no clique.
CURSOR = """
() => {
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:26px;height:26px;pointer-events:none;will-change:transform';
  c.innerHTML =
    '<svg viewBox="0 0 24 24" width="26" height="26">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(9,24,48,.75)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-9px;top:-9px;width:44px;height:44px;border-radius:50%;' +
    'border:2px solid rgba(255,255,255,.9);opacity:0;transform:scale(.3)"></i>';
  document.body.appendChild(c);
  const anel = c.querySelector('i');
  window.__cur = (x, y) => { c.style.left = x + 'px'; c.style.top = y + 'px'; };
  window.__pulso = () => {
    anel.style.transition = 'none';
    anel.style.opacity = '.95';
    anel.style.transform = 'scale(.3)';
    requestAnimationFrame(() => {
      anel.style.transition = 'transform .45s ease-out, opacity .45s ease-out';
      anel.style.opacity = '0';
      anel.style.transform = 'scale(1)';
    });
  };
}
"""


def salvar(page, dur):
    _n[0] += 1
    p = SAIDA / f"f{_n[0]:05d}.jpg"
    page.screenshot(path=str(p), type="jpeg", quality=88)
    frames.append((p.name, dur))


def tempo_real(page, segundos, alvo_fps=12):
    """Captura o mais rapido possivel por N segundos, medindo a duracao real de
    cada frame para o video sair na velocidade certa."""
    fim = time.perf_counter() + segundos
    ant = time.perf_counter()
    while time.perf_counter() < fim:
        salvar(page, 0)
        agora = time.perf_counter()
        frames[-1] = (frames[-1][0], agora - ant)
        ant = agora
        folga = (1.0 / alvo_fps) - (time.perf_counter() - agora)
        if folga > 0:
            time.sleep(folga)


def rolar(page, de, ate, segundos):
    """Scroll deterministico: eu defino o scrollY de cada frame, com aceleracao
    e freada nas pontas (linear puro parece esteira de aeroporto)."""
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        suave = t * t * (3 - 2 * t)
        page.evaluate("y => window.scrollTo(0, y)", de + (ate - de) * suave)
        salvar(page, 1.0 / FPS)
    return ate


_pos = [W / 2, H / 2]


def mover(page, x, y):
    page.mouse.move(x, y)
    page.evaluate("([x, y]) => window.__cur(x, y)", [x, y])
    _pos[0], _pos[1] = x, y


def mover_ate(page, x, y, segundos, curva=0.0):
    """Leva o ponteiro ate um ponto ao longo de N segundos. `curva` empurra o
    caminho pro lado: mao humana nao anda em linha reta."""
    x0, y0 = _pos
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        desvio = curva * (4 * t * (1 - t))   # maximo no meio do trajeto
        mover(page, x0 + (x - x0) * s, y0 + (y - y0) * s + desvio)
        salvar(page, 1.0 / FPS)


def clicar(page, x, y, ler):
    page.evaluate("() => window.__pulso()")
    page.mouse.click(x, y)
    tempo_real(page, ler)


def centro_de(page, seletor):
    return page.evaluate(
        """s => { const r = document.querySelector(s).getBoundingClientRect();
                  return [r.left + r.width / 2, r.top + r.height / 2]; }""", seletor)


def ate_responder(page, quadro, n_antes, limite=40):
    """Espera a IA por CONDICAO, nao por tempo fixo. O Streamlit pinta as duas
    bolhas ANTES de o spinner subir, entao checar so 'sem Pensando' logo apos o
    Enter da falso positivo e o video corta na hora errada."""
    fim = time.perf_counter() + limite
    ant = time.perf_counter()
    viu_spinner = False
    pronto = False
    while time.perf_counter() < fim and not pronto:
        salvar(page, 0)
        agora = time.perf_counter()
        frames[-1] = (frames[-1][0], agora - ant)
        ant = agora
        try:
            est = quadro.evaluate("""() => ({
                n: document.querySelectorAll('[data-testid="stChatMessage"]').length,
                pensando: document.body.innerText.includes('Pensando')
            })""")
            if est["pensando"]:
                viu_spinner = True
            elif viu_spinner and est["n"] >= n_antes + 2:
                pronto = True
        except Exception:
            pass
        time.sleep(0.10)
    return pronto


def comprimir_espera(inicio, teto):
    """Tirar screenshot a 10fps rouba a CPU que o Streamlit usa pra responder e
    o 'Pensando...' estica alem do normal. A latencia real, medida sem captura,
    e ~3s. So este trecho volta pro tempo real do produto."""
    espera = sum(d for _, d in frames[inicio:])
    if espera > teto:
        fator = teto / espera
        for i in range(inicio, len(frames)):
            frames[i] = (frames[i][0], frames[i][1] * fator)
    print(f"espera: {espera:.1f}s capturados -> {min(espera, teto):.1f}s no video",
          file=sys.stderr)


def digitar(page, quadro_loc, texto, por_char=0.045):
    campo = quadro_loc.locator("textarea, [contenteditable=true]").first
    campo.click()
    for ch in texto:
        campo.type(ch, delay=0)
        salvar(page, por_char)
    return campo


with sync_playwright() as pw:
    nav = pw.chromium.launch(executable_path=CHROME)

    # Aquece o agente: a 1a chamada do modelo leva dezenas de segundos (conexao
    # fria) contra ~3s nas seguintes, e travaria o video no "Pensando...".
    aq = nav.new_page(viewport={"width": 500, "height": 800})
    aq.goto(CHAT)
    campo_aq = aq.locator("textarea, [contenteditable=true]").first
    campo_aq.click()
    campo_aq.type("Oi, tudo bem?")
    campo_aq.press("Enter")
    try:
        aq.wait_for_function(
            """() => document.querySelectorAll('[data-testid="stChatMessage"]').length >= 2
                    && !document.body.innerText.includes('Pensando')""",
            timeout=120000)
    except Exception:
        print("AVISO: aquecimento nao confirmou resposta", file=sys.stderr)
    aq.close()

    # reduced_motion explicito: o Windows deste PC reporta "reduce", e o video
    # de venda tem que mostrar o site como o cliente dele vai ver.
    ctx = nav.new_context(viewport={"width": W, "height": H},
                          reduced_motion="no-preference")
    pag = ctx.new_page()
    pag.goto(URL)
    pag.evaluate(CURSOR)

    # --- 1. intro: a logo se desenhando (tempo real)
    tempo_real(pag, 3.4)

    # --- 2. hero: o ponteiro afunda as ondas
    # entra pela direita e cruza o hero em arco, passando por baixo do titulo,
    # que e onde a covinha fica mais visivel contra as linhas
    mover(pag, W - 60, 300)
    tempo_real(pag, 0.5)
    mover_ate(pag, 980, 430, 1.1, curva=-40)
    mover_ate(pag, 690, 560, 1.2, curva=55)
    mover_ate(pag, 430, 380, 1.2, curva=-45)
    tempo_real(pag, 0.6)

    # posicoes medidas na hora: o pin da galeria muda tudo que vem depois dela
    ys = pag.evaluate("""() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
        return {servicos: y('#servicos'), mapa: y('#onde-doi'), sessao: y('#sessao'),
                galeria: y('#galeria'), respire: y('#respire'), contato: y('#contato'),
                total: document.body.scrollHeight};
    }""")

    # --- 3. servicos: os 4 icones se desenhando
    pos = rolar(pag, 0, ys["servicos"] + 240, 2.6)
    tempo_real(pag, 1.0)

    # --- 4. mapa do corpo: a secao-assinatura
    pos = rolar(pag, pos, ys["mapa"] + 30, 1.8)
    tempo_real(pag, 0.8)

    for zona, ler in (("ombros", 2.4), ("costas", 2.6), ("pernas", 2.3)):
        x, y = centro_de(pag, f'[data-zona="{zona}"]')
        mover_ate(pag, x, y, 0.55, curva=-30)
        clicar(pag, x, y, ler)

    # --- 5. galeria horizontal (o scroll vertical empurra o trilho pro lado)
    pos = rolar(pag, pos, ys["galeria"] + 60, 1.2)
    pos = rolar(pag, pos, ys["respire"] - H * 0.35, 3.6)

    # --- 6. respire: o circulo guiando a respiracao
    # a secao so comeca o ciclo quando entra na tela (IntersectionObserver),
    # entao parar aqui pega a respiracao do inicio
    pos = rolar(pag, pos, ys["respire"] - 30, 1.0)
    tempo_real(pag, 6.6)

    # --- 7. contato + chat
    # o iframe do Streamlit leva ~2,5s pra montar: clicar ANTES do fim do scroll
    # faz a caixinha carregar enquanto a pagina termina de rolar, que e o que
    # acontece de verdade quando alguem clica e continua olhando o site
    n_antes_scroll = len(frames)
    alvo_fim = min(ys["contato"] + 120, ys["total"] - H)
    n = max(1, int(2.2 * FPS))
    abre_em = n - 40
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        pag.evaluate("y => window.scrollTo(0, y)", pos + (alvo_fim - pos) * s)
        if i == abre_em:
            bx, by = centro_de(pag, "#sb-chat-btn")
            mover(pag, bx, by)
            pag.evaluate("() => window.__pulso()")
            pag.click("#sb-chat-btn")
        salvar(pag, 1.0 / FPS)

    quadro_loc = pag.frame_locator("#sb-chat-box iframe")
    while not any("8512" in f.url for f in pag.frames):
        tempo_real(pag, 0.3)
    quadro = next(f for f in pag.frames if "8512" in f.url)
    quadro_loc.locator("textarea, [contenteditable=true]").first.wait_for(timeout=60000)

    campo = digitar(pag, quadro_loc, MSG1)
    tempo_real(pag, 0.5)
    n_ant = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_ant):
        print("AVISO: 1a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    tempo_real(pag, 1.8)

    campo = digitar(pag, quadro_loc, MSG2, por_char=0.05)
    tempo_real(pag, 0.4)
    n_ant = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_ant):
        print("AVISO: 2a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    tempo_real(pag, 3.0)

    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames), "dur_total": round(sum(d for _, d in frames), 2)}))
