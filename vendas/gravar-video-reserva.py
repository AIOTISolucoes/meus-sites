"""Video demo da loja Reserva Iguatemi Bosque, frame a frame, MOSTRANDO INTERACAO.

Irmao do vendas/gravar-video-jk.py. A coreografia muda porque a
secao-assinatura e outra: aqui o momento e a ARARA — as fichas dos consultores
se abrindo na passagem do ponteiro, como cabide que a gente afasta na loja.

Antes de rodar, subir os tres servidores:
  python -m streamlit run app.py --server.port 8512 --server.headless true
  cd <copia do site com o APP do chat.js trocado por localhost:8512>
  python -m http.server 8601

CUIDADO: as fichas sao links pro wa.me. O ponteiro PASSA por cima delas (e isso
que abre a arara), mas nunca clica — clicar sairia do site no meio do video. Os
unicos cliques da secao sao no filtro e no botao de sorteio.

Ordem: intro do cabide -> hero com a foto da loja -> categorias -> a arara
(varredura + filtro + sorteio) -> como funciona -> onde fica -> chat com a IA.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-rv")
URL = "http://localhost:8601/"
CHAT = "http://localhost:8512/?agente=reserva_iguatemi&embed=true&cor=9f092c"
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
W, H = 1440, 900
FPS = 25
TETO_ESPERA = 3.0

MSG1 = "Oi! Procuro uma jaqueta pra dar de presente"
MSG2 = "Ele usa M. Voces enviam pra Sobral?"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]

# O cursor falso: o screenshot do Playwright NAO desenha o ponteiro do mouse,
# entao sem isto o video mostraria o varal balancando sozinho.
CURSOR = """
() => {
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:26px;height:26px;pointer-events:none;will-change:transform';
  c.innerHTML =
    '<svg viewBox="0 0 24 24" width="26" height="26">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(36,29,25,.8)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
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


def caixa_de(page, seletor):
    return page.evaluate(
        """s => { const r = document.querySelector(s).getBoundingClientRect();
                  return [r.left, r.top, r.width, r.height]; }""", seletor)


def digitar_na_pagina(page, seletor, texto, por_char=0.055):
    """Digita num campo da PAGINA (o campo do chat mora num iframe e usa o outro
    helper). Limpa antes: o campo ja vem com um nome de exemplo."""
    campo = page.locator(seletor)
    campo.press("Control+a")
    campo.press("Backspace")
    salvar(page, 0.12)
    for ch in texto:
        campo.type(ch, delay=0)
        salvar(page, por_char)


def arrastar(page, x0, y0, x1, y1, segundos):
    """Arrasta de um ponto a outro segurando o botao. Usado na barra de dobra:
    e o gesto que o video precisa mostrar, nao um `input.value = x`."""
    mover(page, x0, y0)
    page.mouse.down()
    page.evaluate("() => window.__pulso()")
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        mover(page, x0 + (x1 - x0) * s, y0 + (y1 - y0) * s)
        salvar(page, 1.0 / FPS)
    page.mouse.up()


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
    o 'Pensando...' estica alem do normal. So este trecho volta pro tempo real
    do produto."""
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

    # --- 1. intro: o cabide se desenhando
    tempo_real(pag, 3.3)

    # --- 2. hero: a foto real da loja ao lado do titulo
    mover(pag, W - 120, 260)
    mover_ate(pag, 1050, 480, 1.0, curva=-30)
    tempo_real(pag, 1.1)

    ys = pag.evaluate("""() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
        return {loja: y('#loja'), consultores: y('#consultores'), arara: y('#rv-arara'),
                como: y('#como'), fotos: y('#fotos'), contato: y('#contato'),
                total: document.body.scrollHeight};
    }""")

    # --- 3. categorias: os icones se desenhando
    pos = rolar(pag, 0, ys["loja"] + 320, 2.3)
    tempo_real(pag, 1.0)

    # --- 4. A ARARA — a secao-assinatura
    pos = rolar(pag, pos, ys["arara"] - H * 0.32, 1.8)
    tempo_real(pag, 0.7)

    # a mao entra pela direita e atravessa as cinco fichas devagar: e a
    # varredura que abre a arara. NUNCA clicar numa ficha aqui — sao links pro
    # WhatsApp e o video sairia do site.
    _, yf = centro_de(pag, ".ficha")
    mover(pag, W - 90, yf - 40)
    tempo_real(pag, 0.3)
    mover_ate(pag, 1090, yf, 0.9, curva=-22)
    mover_ate(pag, 800, yf + 14, 1.3, curva=26)
    mover_ate(pag, 520, yf - 10, 1.3, curva=-24)
    mover_ate(pag, 330, yf + 8, 0.8, curva=18)
    tempo_real(pag, 0.5)
    mover_ate(pag, 900, yf, 1.4, curva=-30)   # volta abrindo do outro lado
    tempo_real(pag, 0.6)

    # 4a. o filtro entra na mensagem que vai pro consultor
    x, y = centro_de(pag, '.op[data-valor="quero um presente"]')
    mover_ate(pag, x, y, 0.8, curva=-30)
    clicar(pag, x, y, 0.9)

    # 4b. "tanto faz": sorteia e destaca a ficha escolhida
    x, y = centro_de(pag, "#rv-tanto-faz")
    mover_ate(pag, x, y, 0.8, curva=25)
    clicar(pag, x, y, 2.2)

    # --- 5. como funciona
    pos = rolar(pag, pos, ys["como"] + 260, 1.5)
    tempo_real(pag, 1.0)

    # --- 6. onde fica: a foto da vitrine + o piso
    pos = rolar(pag, pos, ys["fotos"] + 120, 1.5)
    tempo_real(pag, 1.4)

    # --- 7. contato + chat
    # o iframe do Streamlit leva ~2,5s pra montar: clicar ANTES do fim do scroll
    # faz a caixinha carregar enquanto a pagina termina de rolar
    alvo_fim = min(ys["contato"] + 120, ys["total"] - H)
    n = max(1, int(2.2 * FPS))
    abre_em = max(0, n - 40)
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
    tempo_real(pag, 0.4)
    n_ant = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_ant):
        print("AVISO: 1a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    tempo_real(pag, 1.6)

    campo = digitar(pag, quadro_loc, MSG2, por_char=0.045)
    tempo_real(pag, 0.4)
    n_ant = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_ant):
        print("AVISO: 2a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    tempo_real(pag, 3.2)

    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames), "dur_total": round(sum(d for _, d in frames), 2)}))
