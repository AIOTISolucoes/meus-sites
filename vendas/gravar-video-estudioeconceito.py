"""Video demo do Estudio E Conceito, frame a frame, MOSTRANDO INTERACAO.

Irmao dos outros gravar-video. Particularidades deste site:
  1. o hero tem uma malha de FIOS em canvas que se afasta do ponteiro.
  2. #transformacoes e um trilho HORIZONTAL pinado no scroll: rolar devagar
     por ele faz as fotos deslizarem pro lado.
  3. #provador (NOVO) e um provador de cor: clico em alguns tons e a mecha de
     fios em canvas se recolore num degrade raiz->ponta.

Subir antes:
  python -m streamlit run app.py --server.port 8512 --server.headless true
  python -m http.server 8603   (numa copia com o data-url do chat -> localhost:8512)

Ordem: intro -> hero (fios seguem o ponteiro) -> servicos -> transformacoes
(trilho horizontal) -> provador de cor (troca de tons) -> tratamento -> a casa
-> contato + chat.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-ec")
URL = "http://localhost:8603/"
CHAT = "http://localhost:8512/?agente=estudio_conceito&embed=true&cor=c0954a"
CHROME = str(sorted(pathlib.Path.home().glob(
    ".agent-browser/browsers/chrome-*/chrome.exe"))[-1])
W, H = 1440, 900
FPS = 25
TETO_ESPERA = 3.0

MSG1 = "Oi! Queria mudar a cor do cabelo mas tenho medo de nao ficar bem em mim. Como funciona?"
MSG2 = "Adorei! Da pra marcar essa semana pra avaliar meu cabelo?"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]

CURSOR = """
() => {
  const c = document.createElement('div');
  c.id = '__cur';
  c.style.cssText = 'position:fixed;left:-99px;top:-99px;z-index:2147483647;' +
    'width:26px;height:26px;pointer-events:none;will-change:transform';
  c.innerHTML =
    '<svg viewBox="0 0 24 24" width="26" height="26">' +
    '<path d="M5 2 L5 20 L10 15.4 L13 22 L16.4 20.4 L13.4 14 L20 14 Z" ' +
    'fill="#fff" stroke="rgba(28,16,8,.85)" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    '<i style="position:absolute;left:-9px;top:-9px;width:44px;height:44px;border-radius:50%;' +
    'border:2px solid rgba(216,201,180,.95);opacity:0;transform:scale(.3)"></i>';
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
    x0, y0 = _pos
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        desvio = curva * (4 * t * (1 - t))
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


def clicar_tom(page, nome, ler=1.6):
    """move ate o tom da paleta e clica; a mecha se recolore."""
    sel = f'.tom[data-nome="{nome}"]'
    x, y = centro_de(page, sel)
    mover_ate(page, x, y, 0.7, curva=18)
    clicar(page, x, y, ler)


def ate_responder(page, quadro, n_antes, limite=40):
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

    # aquece o agente (primeira resposta e sempre mais lenta)
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

    ctx = nav.new_context(viewport={"width": W, "height": H},
                          reduced_motion="no-preference")
    pag = ctx.new_page()
    pag.goto(URL)
    pag.evaluate(CURSOR)
    pag.evaluate("() => window.ScrollTrigger && window.ScrollTrigger.refresh()")

    # --- 1. intro: a marca se desenhando
    tempo_real(pag, 3.3)

    # --- 2. hero: os fios se afastando na passagem do ponteiro
    mover(pag, W - 120, 240)
    mover_ate(pag, 360, 520, 1.3, curva=44)
    mover_ate(pag, 1000, 340, 1.3, curva=-48)
    mover_ate(pag, 640, 600, 1.2, curva=36)
    tempo_real(pag, 0.6)

    ys = pag.evaluate("""() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
        return {servicos: y('#servicos'), transformacoes: y('#transformacoes'),
                provador: y('#provador'), tratamento: y('#tratamento'),
                casa: y('#casa'), contato: y('#contato'),
                total: document.body.scrollHeight};
    }""")

    # --- 3. servicos
    pos = rolar(pag, 0, ys["servicos"] + 260, 2.3)
    tempo_real(pag, 1.1)

    # --- 4. transformacoes: trilho horizontal pinado
    pos = rolar(pag, pos, ys["transformacoes"], 1.6)
    tempo_real(pag, 0.5)
    pos = rolar(pag, pos, ys["provador"] - H * 0.12, 5.6)   # cobre o pin inteiro
    tempo_real(pag, 0.5)

    # --- 5. PROVADOR DE COR — assinatura nova. Troco alguns tons.
    pos = rolar(pag, pos, ys["provador"] - H * 0.06, 1.2)
    tempo_real(pag, 0.8)
    clicar_tom(pag, "Ruivo acaju", 1.7)
    clicar_tom(pag, "Platinado", 1.7)
    clicar_tom(pag, "Acobreado", 1.7)
    clicar_tom(pag, "Loiro champagne", 1.9)

    # --- 6. tratamento
    pos = rolar(pag, pos, ys["tratamento"] - H * 0.08, 1.6)
    tempo_real(pag, 1.3)

    # --- 7. a casa
    pos = rolar(pag, pos, ys["casa"] + 120, 1.6)
    tempo_real(pag, 1.3)

    # --- 8. contato + chat
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
    tempo_real(pag, 1.8)

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
