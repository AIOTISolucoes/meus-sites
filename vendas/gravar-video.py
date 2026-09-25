"""Renderiza o video demo do Estudio E Conceito frame a frame.

Mesma tecnica usada no video da Felix. A gravacao nativa do Chrome nao serve:
o screencast so emite frame quando a tela muda e nao sustenta o fps sob carga,
entao o video sai acelerado e irregular. Aqui cada frame e capturado sob controle:

  fase 1 (intro)  -> tempo real, com timestamp medido por frame
  fase 2 (scroll) -> deterministico: eu defino o scrollY de cada frame, 25fps exatos
  fase 3 (chat)   -> tempo real, com timestamp medido por frame

Depois o ffmpeg monta usando a duracao real de cada frame (concat demuxer),
o que mantem a velocidade natural nas fases em tempo real.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames")
URL = "http://localhost:8600/"
CHAT = "http://localhost:8512/?agente=estudio_conceito&embed=true&cor=c0954a"
CHROME = str(pathlib.Path.home() / ".agent-browser/browsers/chrome-150.0.7871.24/chrome.exe")
W, H = 1440, 900
FPS_SCROLL = 25
DUR_SCROLL = 22.0  # segundos de video da fase de scroll
TETO_ESPERA = 3.0  # teto do trecho "Pensando...", ver comentario na fase 3
# O iframe do Streamlit leva ~2,5s pra montar a sessao. Se o clique acontecesse
# so no fim do scroll, o video ficaria parado num retangulo branco. Entao clico
# ainda durante o ultimo trecho do scroll: a caixinha carrega enquanto a pagina
# termina de rolar — que e o que acontece de verdade quando alguem clica e
# continua olhando o site — e a conversa comeca sem tempo morto.
FRAMES_ANTES_DO_FIM = 70

MSG1 = "Oi! Queria fazer o cabelo pra um casamento"
MSG2 = "Penteado. Pode ser sabado de manha?"

# [alvo em px, peso] — peso maior = trecho mais lento (secao que merece atencao)
PASSOS = [
    (620, 1.0),    # sai do hero
    (1000, 1.1),   # titulo "Quatro especialidades" + os 4 cards
    (1150, 0.9),   # cards inteiros na tela
    (1723, 0.6),   # atravessa rapido o vao ate "Transformacoes"
    (2100, 1.0),   # titulo transformacoes, primeiros trabalhos entrando
    (2700, 1.4),   # galeria horizontal deslizando (momento-assinatura do site)
    (3300, 1.3),   # galeria continua
    (3850, 0.8),   # sai da galeria
    (4150, 1.2),   # CPR Senscience inteiro (secao-chave de servico)
    (4500, 0.7),   # transicao
    (4900, 1.0),   # "A casa"
    (5500, 1.1),   # fotos do estudio + card de funcionamento
    (6032, 1.0),   # CTA final + rodape
]

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []  # (nome do arquivo, duracao em segundos)
_n = [0]


def salvar(page, dur):
    _n[0] += 1
    p = SAIDA / f"f{_n[0]:05d}.jpg"
    page.screenshot(path=str(p), type="jpeg", quality=88)
    frames.append((p.name, dur))


def tempo_real(page, segundos, alvo_fps=12):
    """Captura o mais rapido possivel por N segundos, medindo a duracao real
    de cada frame para o video sair na velocidade certa."""
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


def ate_responder(page, quadro, n_antes, limite=40):
    """Captura em tempo real ate a IA terminar de responder. Tempo fixo nao serve:
    a resposta varia e o video nao pode cortar no meio do 'Pensando...'.

    O Streamlit pinta as duas bolhas antes de o spinner subir, entao so checar
    'sem Pensando' da falso negativo logo apos o Enter — por isso espero o
    spinner aparecer primeiro."""
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
        # fps baixo de proposito: durante o "Pensando..." a tela quase nao muda,
        # e capturar menos alivia a CPU que o Streamlit precisa pra responder
        time.sleep(0.10)
    return pronto


def comprimir_espera(inicio, teto):
    """Tirar centenas de screenshots por minuto rouba a CPU que o Streamlit usa
    pra responder, e o 'Pensando...' estica muito alem do normal. A latencia real
    do agente, medida sem captura, e ~3s. Entao esse trecho — e so ele — volta pro
    tempo real do produto, senao o video mostraria um problema que nao existe."""
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

    # Aquece o agente antes de gravar: a 1a chamada do modelo leva dezenas de
    # segundos (conexao fria) contra ~3s nas seguintes, e travaria o video inteiro
    # no "Pensando...". Em uso real quem conversa pega o app ja quente.
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

    pag = nav.new_page(viewport={"width": W, "height": H})
    pag.goto(URL)

    # --- fase 1: intro (a logo se desenhando), em tempo real
    tempo_real(pag, 3.6)

    # --- fase 2: scroll deterministico
    total_peso = sum(p for _, p in PASSOS)
    n_frames = int(DUR_SCROLL * FPS_SCROLL)
    plano = []
    origem = 0.0
    for alvo, peso in PASSOS:
        qtd = max(1, round(n_frames * peso / total_peso))
        for i in range(qtd):
            t = (i + 1) / qtd
            plano.append(origem + (alvo - origem) * t)
        origem = float(alvo)

    abre_em = len(plano) - FRAMES_ANTES_DO_FIM
    for i, y in enumerate(plano):
        if i == abre_em:
            pag.click("#sb-chat-btn")
        pag.evaluate("y => window.scrollTo(0, y)", y)
        salvar(pag, 1.0 / FPS_SCROLL)

    # --- fase 3: a conversa, em tempo real
    quadro_loc = pag.frame_locator("#sb-chat-box iframe")
    # Rede de seguranca: se por algum motivo o iframe ainda nao montou, espero
    # gravando (em vez de estourar) — melhor um segundo a mais que um erro.
    while not any("8512" in f.url for f in pag.frames):
        tempo_real(pag, 0.3)
    quadro = next(f for f in pag.frames if "8512" in f.url)
    quadro_loc.locator("textarea, [contenteditable=true]").first.wait_for(timeout=60000)

    # --- 1a pergunta
    campo = digitar(pag, quadro_loc, MSG1)
    tempo_real(pag, 0.5)
    n_antes = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_antes):
        print("AVISO: 1a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    tempo_real(pag, 1.6)  # tempo de ler a resposta

    # --- 2a pergunta: mostra que e conversa, nao resposta automatica unica
    campo = digitar(pag, quadro_loc, MSG2, por_char=0.05)
    tempo_real(pag, 0.4)
    n_antes = quadro.evaluate(
        "() => document.querySelectorAll('[data-testid=\"stChatMessage\"]').length")
    campo.press("Enter")
    marca = len(frames)
    if not ate_responder(pag, quadro, n_antes):
        print("AVISO: 2a resposta nao apareceu no tempo limite", file=sys.stderr)
    comprimir_espera(marca, TETO_ESPERA)
    tempo_real(pag, 3.0)  # deixa a resposta na tela pra dar tempo de ler

    nav.close()

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames), "dur_total": round(sum(d for _, d in frames), 2)}))
