"""Video demo da Gentleman Barbearia, frame a frame, MOSTRANDO INTERACAO.

Irmao do vendas/gravar-video-lsbarbearia.py. A coreografia muda porque a
secao-assinatura e outra: aqui o momento e o MONTE O SEU GENTLEMAN, em que a
pessoa escolhe cabelo e barba e o brasao deles e redesenhado, com uma navalha
varrendo a troca e a conta se refazendo com a tabela real da porta.

Antes de rodar, subir os dois servidores:
  python -m streamlit run app.py --server.port 8512 --server.headless true
  cd <copia do site com o APP do chat.js trocado por localhost:8512>
  python -m http.server 8600

A copia e necessaria porque o js/chat.js do site aponta pro Streamlit Cloud, e
o agente gentleman_barbearia ainda nao foi pushado. Gravar contra o local
tambem evita o app da nuvem dormindo no meio da tomada.

Ordem: intro do brasao -> ponteiro no poste do hero -> servicos com preco ->
MONTA O GENTLEMAN (3 cabelos + sobrancelha) -> galeria -> onde fica -> chat.

⚠️ NAO clicar em #btn-montado: ele abre o WhatsApp numa aba nova e o video sai
do site. O botao aparece na tela, mas o ponteiro nao encosta nele.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-gentleman")
URL = "http://localhost:8600/"
CHAT = "http://localhost:8512/?agente=gentleman_barbearia&embed=true&cor=e2621c"
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
W, H = 1440, 900
FPS = 25
TETO_ESPERA = 3.0

MSG1 = "Oi! Queria fazer o combo de corte e barba"
MSG2 = "Quanto fica com o platinado junto? E da pra ir sabado de manha?"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]

# O cursor falso: o screenshot do Playwright NAO desenha o ponteiro do mouse,
# entao sem isto o video mostraria o brasao trocando de cabelo sozinho.
# O anel do clique sai no laranja do poste da fachada deles.
CURSOR = """
() => {
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:26px;height:26px;pointer-events:none;will-change:transform';
  c.innerHTML =
    '<svg viewBox="0 0 24 24" width="26" height="26">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(15,18,22,.9)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-9px;top:-9px;width:44px;height:44px;border-radius:50%;' +
    'border:2px solid rgba(226,98,28,.95);opacity:0;transform:scale(.3)"></i>';
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

    # --- 1. intro: a cabeca entra e o script "Gentleman" se escreve
    tempo_real(pag, 5.0)

    # --- 2. hero: o ponteiro passeia pelo poste de barbeiro e o halo o segue
    # so na metade DIREITA: a esquerda tem o veu de leitura por cima do texto
    mover(pag, W - 40, 240)
    tempo_real(pag, 0.35)
    mover_ate(pag, 1020, 300, 0.85, curva=-30)
    mover_ate(pag, 1330, 470, 0.85, curva=40)
    mover_ate(pag, 990, 640, 0.85, curva=-35)
    mover_ate(pag, 1340, 720, 0.8, curva=30)
    tempo_real(pag, 0.8)

    # medido na hora: o pin da galeria empurra tudo que vem depois dela
    ys = pag.evaluate("""() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
        return {servicos: y('#servicos'), assinatura: y('#assinatura'),
                galeria: y('#galeria'), onde: y('#onde'), contato: y('#contato'),
                total: document.body.scrollHeight};
    }""")

    # --- 3. servicos: os icones se desenhando e a tabela da porta
    pos = rolar(pag, 0, ys["servicos"] + 300, 2.4)
    tempo_real(pag, 1.6)

    # --- 4. A SECAO-ASSINATURA: monte o seu Gentleman
    # o palco fica na metade de baixo da secao, entao o alvo do scroll e o
    # proprio palco, nao o topo do titulo
    pos = rolar(pag, pos, ys["assinatura"] + 330, 1.8)
    tempo_real(pag, 1.0)

    # 4a. troca o cabelo tres vezes: a navalha varre e o brasao e redesenhado.
    # O platinado por ultimo de proposito: e o unico que muda a COR do fio e
    # acende a linha "a combinar" na conta.
    for seletor, ler in (('.opcao[data-valor="degrade"]', 1.5),
                         ('.opcao[data-valor="cachos"]', 1.5),
                         ('.opcao[data-valor="platinado"]', 2.0)):
        bx, by = centro_de(pag, seletor)
        mover_ate(pag, bx, by, 0.65, curva=16)
        clicar(pag, bx, by, ler)

    # 4b. a barba, pra mostrar que o desenho responde nas duas partes
    bx, by = centro_de(pag, '.opcao[data-valor="desenhada"]')
    mover_ate(pag, bx, by, 0.6, curva=-14)
    clicar(pag, bx, by, 1.6)

    # 4c. a sobrancelha: entra mais uma linha "a combinar" e o total vira "+"
    bx, by = centro_de(pag, '.opcao[data-grupo="sobrancelha"]')
    mover_ate(pag, bx, by, 0.6, curva=14)
    clicar(pag, bx, by, 2.2)

    # --- 5. galeria horizontal (o scroll vertical empurra o trilho pro lado)
    pos = rolar(pag, pos, ys["galeria"] + 60, 1.3)
    pos = rolar(pag, pos, ys["galeria"] + 2600, 3.6)

    # --- 6. onde fica: endereco, horario e a fachada com o poste
    pos = rolar(pag, pos, ys["onde"] + 120, 1.6)
    tempo_real(pag, 1.8)

    # --- 7. contato + chat
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
    tempo_real(pag, 1.9)

    # a 2a mensagem e proposital: pergunta PRECO NAO PUBLICADO e DIA na mesma
    # frase. Mostra o agente respondendo as duas, recusando o valor que nao
    # existe e nao confirmando agenda.
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
    tempo_real(pag, 3.6)

    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames), "dur_total": round(sum(d for _, d in frames), 2)}))
