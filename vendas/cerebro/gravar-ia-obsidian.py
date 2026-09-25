"""B-roll de "como colocar IA no Obsidian", em 9:16. Terceiro da serie do Reels.

Irmaos: vendas/cerebro/gravar-cerebro.py (o cerebro pronto) e
vendas/cerebro/gravar-tutorial-obsidian.py (onde baixa o Obsidian).

Mostra o caminho inteiro do plugin Smart Connections: Procurar -> buscar ->
Instalar -> Ativar -> e o painel achando notas parecidas no cofre de verdade.

⚠️ Escolhi o Smart Connections e nao o Copilot de proposito: ele roda um modelo
local, nao pede chave de API nenhuma. O Copilot ia obrigar a mostrar uma chave
paga na tela.

⚠️ ESTE SCRIPT DESINSTALA o Smart Connections antes de gravar (pela API do
proprio Obsidian, `uninstallPlugin`) e o reinstala na frente da camera. E o
unico jeito de a tela mostrar o botao "Instalar", que e o que o espectador vai
ver. No fim da gravacao o plugin fica instalado E ativo. O indice de embeddings
mora em `<cofre>/.smart-env/` e NAO e apagado -- por isso o painel do final volta
a ter conteudo rapido.

⚠️ No Obsidian 1.13 a gravacao envolve TRES janelas, cada uma um alvo CDP:
  1. a principal        (app://obsidian.md/index.html) -- a nota e o painel
  2. as Configuracoes   (about:blank, modal .mod-settings)
  3. a LOJA de plugins  (about:blank, modal .mod-community-plugin)
O botao "Procurar" nao abre um modal dentro das Configuracoes: ele abre a
janela 3. Foi isso que quebrou a primeira versao deste script, que procurava a
loja dentro da janela 2 e esperava 90s por um `.community-item` que nunca ia
nascer ali.

⚠️ As janelas 2 e 3 sao as duas `about:blank`, entao NAO da pra distinguir uma
da outra pela URL. Pelo titulo tambem e arriscado (o titulo da janela 2 vira o
nome da aba ativa). O que separa de verdade e o DOM: quem tem `.mod-settings` e
Configuracoes, quem tem `.mod-community-plugin` e a loja.

⚠️ `window.app` so existe na janela principal. As outras duas tem o DOM, mas nao
a API -- por isso o script manda comando pela 1 e clica nas 2 e 3.

Antes de rodar, subir o Obsidian com a porta de debug aberta:
  & "$env:LOCALAPPDATA\\Programs\\Obsidian\\Obsidian.exe" --remote-debugging-port=9222 "obsidian://open?vault=cerebro"

    python vendas/cerebro/gravar-ia-obsidian.py frames-ia
    ffmpeg -y -f concat -safe 0 -i frames-ia/lista.txt -fps_mode cfr -r 25 \
      -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-ia-obsidian.mp4
"""
import json
import pathlib
import sys
import time

from PIL import Image
from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-ia")
CDP = "http://127.0.0.1:9222"
L, A = 900, 1600          # 9:16 nativo de Reels, igual aos outros dois videos
FPS = 25

# ⚠️ As janelas de Configuracoes e da loja sao capturadas MENORES (700x1244, o
# mesmo 9:16) e reescaladas pra 900x1600 na hora de salvar. Motivo: o que manda
# no tamanho aparente da interface e o viewport em CSS px -- com 900 de largura,
# a tela de configuracoes fica com letra miuda e sobra fundo preto. Com 700, a
# mesma tela ocupa 1,29x mais quadro. Zoom do Electron (webFrame.setZoomFactor)
# NAO resolve isso: ele mexe junto na janela e no viewport, e o layout final sai
# identico -- foi testado.
LS, AS = 700, 1244
BUSCA = "smart connections"

# ⚠️ Nota do beat final. NAO trocar por "Ah Imobiliária" nem "Maxwell Gomes":
# as duas tem telefone real na tela. Ver o roteiro-reels-cerebro.md.
NOTA = "As 7 barbearias"

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]
_pos = [L / 2, A * 0.55]

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

JANELA = """([L, A]) => {
    const e = window.require('electron');
    const w = (e.remote && e.remote.getCurrentWindow && e.remote.getCurrentWindow())
           || window.require('@electron/remote').getCurrentWindow();
    w.unmaximize(); w.setResizable(true); w.setMinimumSize(200, 200);
    w.setBounds({x: 0, y: 0, width: L, height: A});
}"""


def salvar(pag, dur):
    """Um frame. Quadro de janela satelite sobe pra 900x1600 pra todo o video
    ter o mesmo tamanho -- o concat do ffmpeg exige frames uniformes."""
    _n[0] += 1
    p = SAIDA / f"f{_n[0]:05d}.jpg"
    pag.screenshot(path=str(p), type="jpeg", quality=88)
    with Image.open(p) as im:
        se_precisa = im.size != (L, A)
        if se_precisa:
            im.resize((L, A), Image.LANCZOS).save(p, quality=88)
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


def esperar_ate(pag, js, limite=90, alvo_fps=12):
    """Filma enquanto espera uma CONDICAO (nao um tempo fixo). Devolve o indice
    do primeiro frame da espera, pra poder comprimir depois.

    ⚠️ Baixar `alvo_fps` nas esperas longas nao e so economia de disco: cada
    screenshot rouba CPU de quem esta trabalhando do outro lado (a indexacao do
    plugin), entao filmar rapido demais faz a propria espera durar mais.
    """
    marca = len(frames)
    fim = time.perf_counter() + limite
    ant = time.perf_counter()
    ok = False
    while time.perf_counter() < fim and not ok:
        salvar(pag, 0)
        agora = time.perf_counter()
        frames[-1] = (frames[-1][0], agora - ant)
        ant = agora
        try:
            ok = bool(pag.evaluate(js))
        except Exception:
            pass
        folga = (1.0 / alvo_fps) - (time.perf_counter() - agora)
        if folga > 0:
            time.sleep(folga)
    if not ok:
        print(f"AVISO: condicao nao bateu em {limite}s: {js[:60]}", file=sys.stderr)
    return marca


def comprimir(marca, teto):
    """A loja de plugins baixa uma lista de ~6700 itens e o Windows Defender
    cheira o .js recem-instalado: as duas esperas variam de segundos a dezenas
    de segundos e nao podem ditar o ritmo do video. Filma tudo e acelera pro
    teto -- o espectador ve o mesmo caminho, so que sem o tempo morto.
    """
    gasto = sum(d for _, d in frames[marca:])
    if gasto > teto and gasto > 0:
        fator = teto / gasto
        for i in range(marca, len(frames)):
            frames[i] = (frames[i][0], frames[i][1] * fator)
    print(f"espera: {gasto:.1f}s -> {min(gasto, teto):.1f}s no video", file=sys.stderr)


def mover(pag, x, y):
    pag.mouse.move(x, y)
    pag.evaluate("([x, y]) => window.__cur && window.__cur(x, y)", [x, y])
    _pos[0], _pos[1] = x, y


def mover_ate(pag, x, y, segundos, curva=0.0):
    x0, y0 = _pos
    n = max(1, int(segundos * FPS))
    for i in range(n):
        t = (i + 1) / n
        s = t * t * (3 - 2 * t)
        desvio = curva * (4 * t * (1 - t))
        mover(pag, x0 + (x - x0) * s, y0 + (y - y0) * s + desvio)
        salvar(pag, 1.0 / FPS)


def ir_ate(pag, loc, segundos=1.0, curva=0.0, frac_x=0.5):
    b = loc.first.bounding_box()
    if not b:
        raise RuntimeError("elemento fora da tela na hora de mirar o ponteiro")
    x, y = b["x"] + b["width"] * frac_x, b["y"] + b["height"] / 2
    mover_ate(pag, x, y, segundos, curva=curva)
    return x, y


def piscar(pag, seg=0.35):
    pag.evaluate("() => window.__pulso && window.__pulso()")
    tempo_real(pag, seg)


def digitar(pag, texto, por_char=0.055):
    for ch in texto:
        pag.keyboard.type(ch)
        salvar(pag, por_char)


def janela_com(b, seletor, limite=30):
    """Acha a janela satelite (about:blank) cujo DOM tem `seletor`.

    Identificar pelo DOM e nao pelo titulo e o que impede confundir a janela de
    Configuracoes com a da loja de plugins.
    """
    fim = time.perf_counter() + limite
    while time.perf_counter() < fim:
        for p in list(b.contexts[0].pages):
            try:
                if p.url == "about:blank" and p.evaluate(
                        "s => !!document.querySelector(s)", seletor):
                    return p
            except Exception:
                pass          # janela fechando no meio da varredura
        time.sleep(0.4)
    return None


def recarregar(main, limite=60):
    """Reinicia a janela principal do Obsidian e espera o workspace subir.

    ⚠️ Isto NAO e frescura: desinstalar um plugin que ja esta carregado e
    instala-lo de novo na mesma sessao deixa ele zumbi -- aparece em
    `app.plugins.plugins`, mas o tipo de view some do registro e o painel abre
    com "O plugin que criou este painel nao existe mais". Recarregar depois de
    desinstalar apaga esse rastro, e ai a instalacao filmada acontece numa
    sessao limpa, igualzinha a de quem esta instalando pela primeira vez.
    """
    main.evaluate("() => window.app.commands.executeCommandById('app:reload')")
    time.sleep(5)
    fim = time.perf_counter() + limite
    while time.perf_counter() < fim:
        try:
            if main.evaluate("() => !!(window.app && window.app.workspace"
                             " && window.app.workspace.layoutReady)"):
                return True
        except Exception:
            pass              # contexto JS trocando durante o reload
        time.sleep(1.0)
    return False


def preparar_janela(pag, larg=LS, alt=AS):
    """Poe a janela em 9:16, injeta o cursor falso e o centraliza."""
    pag.evaluate(JANELA, [larg, alt])
    pag.wait_for_timeout(700)
    pag.evaluate(CURSOR)
    mover(pag, larg / 2, alt * 0.55)


with sync_playwright() as pw:
    b = pw.chromium.connect_over_cdp(CDP)
    paginas = b.contexts[0].pages
    main = next((p for p in paginas if "obsidian.md" in p.url), None)
    if main is None:
        sys.exit("Obsidian nao esta com --remote-debugging-port=9222")

    # ---------------------------------------------------- preparo (fora da camera)
    # 0. fecha janela de loja/configuracoes que tenha sobrado de uma tomada
    # anterior: se a loja ja estiver aberta com a busca feita, a tomada nova
    # comeca no meio do caminho e ainda mostra o DOM velho (com "Desinstalar"
    # no lugar de "Instalar").
    for velha in list(b.contexts[0].pages):
        try:
            if velha.url == "about:blank":
                velha.close()
        except Exception:
            pass
    main.wait_for_timeout(800)

    # 1. volta o cofre pro estado de quem nunca instalou o plugin, e recarrega
    # pra sessao esquecer que o plugin ja existiu (ver recarregar())
    main.evaluate("""async () => {
        const p = window.app.plugins;
        if (p.manifests['smart-connections']) {
            await p.uninstallPlugin('smart-connections');
        }
        if (window.app.setting && window.app.setting.close) window.app.setting.close();
    }""")
    main.wait_for_timeout(1200)
    if not recarregar(main):
        sys.exit("o Obsidian nao voltou depois do reload")

    # 2. a nota que vai estar aberta atras do painel no beat final
    main.evaluate("""async (nome) => {
        const f = window.app.vault.getMarkdownFiles().find(f => f.basename === nome);
        if (f) await window.app.workspace.getLeaf(false).openFile(f);
        window.app.workspace.leftSplit.collapse();
    }""", NOTA)
    main.evaluate(JANELA, [L, A])
    main.wait_for_timeout(600)

    # 3. abre as Configuracoes na aba certa -- isso cria a segunda janela
    main.evaluate("""() => {
        window.app.setting.open();
        window.app.setting.openTabById('community-plugins');
    }""")
    main.wait_for_timeout(1500)

    cfg = janela_com(b, ".mod-settings", limite=15)
    if cfg is None:
        sys.exit("janela de Configuracoes nao apareceu como alvo CDP")
    preparar_janela(cfg)

    # ------------------------------------------- 1. Configuracoes: achar o botao
    tempo_real(cfg, 0.8)
    ir_ate(cfg, cfg.locator('button:has-text("Procurar")'), 0.8, curva=-40)
    piscar(cfg, 0.3)
    cfg.locator('button:has-text("Procurar")').first.click()

    # a loja nasce como OUTRA janela: segura mais um instante nas Configuracoes
    # (o corte seco fica pro momento em que a loja ja existe) e vai busca-la.
    tempo_real(cfg, 0.5)
    loja = janela_com(b, ".mod-community-plugin", limite=40)
    if loja is None:
        sys.exit("a janela da loja de plugins nao abriu")
    preparar_janela(loja)

    # ------------------------------------------------------- 2. loja: a lista
    marca = esperar_ate(loja, "() => document.querySelectorAll('.community-item').length > 0")
    comprimir(marca, 0.7)
    tempo_real(loja, 0.4)

    # ------------------------------------------------------------------ 3. buscar
    campo = loja.locator(".mod-community-plugin input").first
    ir_ate(loja, campo, 0.6, curva=30, frac_x=0.25)
    piscar(loja, 0.25)
    campo.click()
    digitar(loja, BUSCA, por_char=0.04)
    marca = esperar_ate(
        loja, "() => document.querySelectorAll('.community-item').length <= 6", limite=15)
    comprimir(marca, 0.4)
    tempo_real(loja, 0.5)

    # -------------------------------------------------------------- 4. abrir card
    card = loja.locator(".mod-community-plugin .community-item").first
    ir_ate(loja, card, 0.7, curva=-25, frac_x=0.3)
    piscar(loja, 0.25)
    card.click()
    tempo_real(loja, 1.3)         # a descricao: "No API key. Zero setup."

    # ----------------------------------------------------------------- 5. instalar
    bt_inst = loja.locator('.mod-community-modal button:has-text("Instalar")').first
    ir_ate(loja, bt_inst, 0.6, curva=25)
    piscar(loja, 0.25)
    bt_inst.click()
    marca = esperar_ate(loja, """() => [...document.querySelectorAll(
        '.mod-community-modal button')].some(b => b.textContent.trim() === 'Ativar')""")
    comprimir(marca, 0.9)

    # ------------------------------------------------------------------- 6. ativar
    bt_ativ = loja.locator('.mod-community-modal button:has-text("Ativar")').first
    ir_ate(loja, bt_ativ, 0.5, curva=-20)
    piscar(loja, 0.25)
    bt_ativ.click()
    tempo_real(loja, 0.6)

    # ------------------------------------- 7. corte pra janela principal: a prova
    for satelite in (loja, cfg):
        try:
            satelite.close()
        except Exception:
            pass
    main.evaluate("() => window.app.setting.close && window.app.setting.close()")
    main.wait_for_timeout(900)
    # ⚠️ Abrir a view pela API e nao pelo comando: o comando as vezes nao pega
    # no instante seguinte ao "Ativar" (o plugin ainda esta registrando) e
    # falha calado, deixando o video sem o beat final.
    main.evaluate("""async () => {
        const l = window.app.workspace.getRightLeaf(false);
        await l.setViewState({type: 'smart-connections-view', active: true});
        window.app.workspace.revealLeaf(l);
    }""")
    marca = esperar_ate(main, """() => {
        const l = window.app.workspace.getLeavesOfType('smart-connections-view')[0];
        if (!l) return false;
        const t = l.view.containerEl.innerText || '';
        // 'desativado' = o painel de plugin zumbi; nao pode contar como pronto
        return t.length > 40 && t.indexOf('Loading') === -1
               && t.indexOf('desativado') === -1;
    }""", limite=240, alvo_fps=2.5)
    comprimir(marca, 0.8)
    tempo_real(main, 2.8)

(SAIDA / "lista.txt").write_text(
    "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
    + f"file '{frames[-1][0]}'\n",
    encoding="utf-8",
)
print(json.dumps({"frames": len(frames),
                  "dur_total": round(sum(d for _, d in frames), 2)}))
