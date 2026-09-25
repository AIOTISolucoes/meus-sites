"""Video demo do Spaço Beauty (Lash & Nail), frame a frame, MOSTRANDO INTERACAO.

Irmao dos outros gravar-video. Particularidades deste site:
  1. a secao-assinatura #olhar e um OLHO em SVG: a iris acompanha o ponteiro e,
     ao trocar de aba (.tecnica), os fios de cilio sao aplicados um a um. Clico
     duas tecnicas pra mostrar o desenho mudando.
  2. a #galeria e um trilho HORIZONTAL pinado no scroll (igual ao Butterfly):
     rolar devagar por ela faz as fotos deslizarem pro lado.

Subir antes:
  python -m streamlit run app.py --server.port 8512 --server.headless true
  python -m http.server 8603   (numa copia com o APP do chat.js -> localhost:8512)

Ordem: intro -> hero (fios seguem o ponteiro) -> servicos -> o olhar (Egipcio 5D
-> Volume Brasileiro, a iris acompanha) -> galeria horizontal -> quem faz ->
contato + chat.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-sp")
URL = "http://localhost:8603/"
CHAT = "http://localhost:8512/?agente=spaco_beauty&embed=true&cor=4a2a0c"
CHROME = str(sorted(pathlib.Path.home().glob(
    ".agent-browser/browsers/chrome-*/chrome.exe"))[-1])
W, H = 1440, 900
FPS = 25
TETO_ESPERA = 3.0

MSG1 = "Oi! Queria fazer extensao de cilios mas nunca fiz. Qual voces indicam?"
MSG2 = "Adorei! Da pra marcar pra essa semana?"

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

    # --- 1. intro: o monograma NK se desenhando
    tempo_real(pag, 3.3)

    # --- 2. hero: os fios de cilio se afastando na passagem do ponteiro
    mover(pag, W - 120, 240)
    mover_ate(pag, 360, 520, 1.3, curva=44)
    mover_ate(pag, 1000, 340, 1.3, curva=-48)
    mover_ate(pag, 640, 600, 1.2, curva=36)
    tempo_real(pag, 0.6)

    ys = pag.evaluate("""() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
        return {servicos: y('#servicos'), olhar: y('#olhar'), galeria: y('#galeria'),
                quem: y('#quem'), contato: y('#contato'),
                total: document.body.scrollHeight};
    }""")

    # --- 3. servicos
    pos = rolar(pag, 0, ys["servicos"] + 280, 2.3)
    tempo_real(pag, 1.1)

    # --- 4. O OLHAR — seçao-assinatura. A iris acompanha o ponteiro.
    pos = rolar(pag, pos, ys["olhar"] - H * 0.12, 1.9)
    tempo_real(pag, 0.7)

    # leva o ponteiro ate perto do olho: a iris segue, o desenho ganha vida
    ox, oy = centro_de(pag, "#olho")
    mover_ate(pag, ox - 120, oy - 30, 0.9, curva=-24)
    mover_ate(pag, ox + 130, oy + 20, 1.1, curva=26)
    tempo_real(pag, 0.4)

    # 4a. troca pra Egipcio 5D: os fios sao reaplicados um a um
    x, y = centro_de(pag, '.tecnica[data-tec="egipcio"]')
    mover_ate(pag, x, y, 0.8, curva=22)
    clicar(pag, x, y, 1.7)

    # 4b. Volume Brasileiro
    x, y = centro_de(pag, '.tecnica[data-tec="brasileiro"]')
    mover_ate(pag, x, y, 0.7, curva=-18)
    clicar(pag, x, y, 1.8)

    # olha o olho de novo pra fechar a demonstraçao
    mover_ate(pag, ox, oy, 0.9, curva=-24)
    tempo_real(pag, 1.4)

    # --- 5. galeria horizontal pinada
    pos = rolar(pag, pos, ys["galeria"], 1.4)
    tempo_real(pag, 0.5)
    pos = rolar(pag, pos, ys["quem"] - H * 0.1, 5.4)   # cobre o pin inteiro
    tempo_real(pag, 0.5)

    # --- 6. quem faz: as duas profissionais
    pos = rolar(pag, pos, ys["quem"] + 160, 1.4)
    tempo_real(pag, 1.4)

    # --- 7. contato + chat
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
    tempo_real(pag, 1.7)

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
