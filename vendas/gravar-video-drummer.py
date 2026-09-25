"""Video demo da Drummer Barbearia, frame a frame, MOSTRANDO INTERACAO.

Irmao do vendas/gravar-video-lsbarbearia.py. A coreografia muda porque a
secao-assinatura e outra: aqui o momento e o MONTADOR DE COMBO, em que a
pessoa bate nos pratos e o preco real da tabela deles aparece na hora.

Antes de rodar, subir os dois servidores:
  python -m streamlit run app.py --server.port 8512 --server.headless true
  cd <copia do site com o APP do chat.js trocado por localhost:8512>
  python -m http.server 8600

Ordem: intro da moldura -> batida no prato do hero -> servicos -> monta o
combo (e mostra o caso HONESTO do Kids, que nao tem combo na tabela) ->
galeria -> chat com a IA.

O trecho do Kids e de proposito: e o que prova que o site nao inventa
desconto. Vale mais que qualquer animacao.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-drummer")
URL = "http://localhost:8600/"
CHAT = "http://localhost:8512/?agente=drummer_barbearia&embed=true&cor=a97b2e"
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
W, H = 1440, 900
FPS = 25
TETO_ESPERA = 3.0

MSG1 = "Oi! Quanto fica corte degrade com barba?"
MSG2 = "E se for o kids com barba? tem vaga sabado de manha?"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]

# O cursor falso: o screenshot do Playwright NAO desenha o ponteiro do mouse,
# entao sem isto o video mostraria o prato vibrando e os pratos do combo
# acendendo sozinhos.
CURSOR = """
() => {
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:26px;height:26px;pointer-events:none;will-change:transform';
  c.innerHTML =
    '<svg viewBox="0 0 24 24" width="26" height="26">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(18,16,10,.85)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-9px;top:-9px;width:44px;height:44px;border-radius:50%;' +
    'border:2px solid rgba(217,164,78,.95);opacity:0;transform:scale(.3)"></i>';
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


def rolar_chat(quadro):
    """Desce a conversa ate o fim DENTRO do iframe.

    ⚠️ Sem isto o video mostra a conversa pela metade: o Streamlit re-renderiza
    a pagina inteira a cada mensagem e o scroll do iframe volta pro TOPO, entao
    as bolhas novas nascem abaixo da dobra e a caixinha parece que nao
    respondeu. Custou uma gravacao inteira pra descobrir.
    """
    try:
        quadro.evaluate("""() => {
            const alvo = document.scrollingElement || document.body;
            alvo.scrollTop = alvo.scrollHeight;
            const cx = [...document.querySelectorAll('*')]
                .filter(e => e.scrollHeight > e.clientHeight + 40);
            cx.forEach(e => { e.scrollTop = e.scrollHeight; });
        }""")
    except Exception:
        pass


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

    # --- 1. intro: a moldura se desenhando e o DRUMMER subindo de dentro dela
    tempo_real(pag, 3.7)

    # --- 2. hero: o prato de bateria. Batidas na metade DIREITA, que e onde
    # ele mora; a esquerda tem o veu de leitura por cima do texto.
    mover(pag, W - 60, 260)
    tempo_real(pag, 0.35)
    mover_ate(pag, 1120, 340, 0.75, curva=-28)
    clicar(pag, 1120, 340, 1.1)          # batida cheia: a onda atravessa os sulcos
    mover_ate(pag, 900, 560, 0.8, curva=34)
    clicar(pag, 900, 560, 1.2)
    mover_ate(pag, 1290, 620, 0.7, curva=-26)
    tempo_real(pag, 1.0)

    # medido na hora: o pin da galeria empurra tudo que vem depois dela
    ys = pag.evaluate("""() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
        return {servicos: y('#servicos'), assinatura: y('#assinatura'),
                galeria: y('#galeria'), contato: y('#contato'),
                total: document.body.scrollHeight};
    }""")

    # --- 3. servicos: os icones se desenhando
    pos = rolar(pag, 0, ys["servicos"] + 320, 2.3)
    tempo_real(pag, 1.3)

    # --- 4. A SECAO-ASSINATURA: montar o combo
    pos = rolar(pag, pos, ys["assinatura"] + 210, 1.6)
    tempo_real(pag, 1.0)

    # 4a. bate no prato da barba: o total pula pro combo de R$ 60
    bx, by = centro_de(pag, '.prato[data-svc-id="barba"]')
    mover_ate(pag, bx, by, 0.75, curva=-26)
    clicar(pag, bx, by, 1.5)

    # 4b. e na sobrancelha: R$ 70 com o selo "economiza R$ 5"
    bx, by = centro_de(pag, '.prato[data-svc-id="sobrancelha"]')
    mover_ate(pag, bx, by, 0.65, curva=22)
    clicar(pag, bx, by, 1.8)

    # 4c. O MOMENTO QUE VALE O VIDEO: troca pra Kids e o site AVISA que esse
    # corte nao entra em combo, mostrando R$ 75 em vez de R$ 70. E a prova de
    # que a tabela e a deles e nao tem desconto inventado.
    bx, by = centro_de(pag, '.corte-op[data-corte="Kids"]')
    mover_ate(pag, bx, by, 0.7, curva=-18)
    clicar(pag, bx, by, 2.6)

    # 4d. volta pro degrade, que e o carro-chefe
    bx, by = centro_de(pag, '.corte-op[data-corte="Degradê"]')
    mover_ate(pag, bx, by, 0.55, curva=14)
    clicar(pag, bx, by, 1.5)

    # --- 5. galeria horizontal (o scroll vertical empurra o trilho pro lado)
    pos = rolar(pag, pos, ys["galeria"] + 60, 1.2)
    pos = rolar(pag, pos, ys["galeria"] + 2500, 3.4)

    # --- 6. contato + chat
    # o iframe do Streamlit leva ~2,5s pra montar: clicar ANTES do fim do scroll
    # faz a caixinha carregar enquanto a pagina termina de rolar, que e o que
    # acontece de verdade quando alguem clica e continua olhando o site
    alvo_fim = min(ys["contato"] + 140, ys["total"] - H)
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
    rolar_chat(quadro)
    tempo_real(pag, 1.7)

    # a 2a mensagem e proposital: pergunta DIA e PRECO na mesma frase. Mostra o
    # agente respondendo as duas sem confirmar agenda nem inventar valor.
    campo = digitar(pag, quadro_loc, MSG2, por_char=0.045)
    tempo_real(pag, 0.4)
    n_ant = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_ant):
        print("AVISO: 2a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    rolar_chat(quadro)
    tempo_real(pag, 3.4)

    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames), "dur_total": round(sum(d for _, d in frames), 2)}))
