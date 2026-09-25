"""Video do CEREBRO (vault do Obsidian) pro Reels, em 9:16.

Irmao dos gravar-video-*.py, mas em vez de dirigir um site, dirige o proprio
Obsidian por CDP. Serve de B-roll pro video em que ele apresenta o cerebro.

Antes de rodar, subir o Obsidian com a porta de debug aberta:
  & "$env:LOCALAPPDATA\\Programs\\Obsidian\\Obsidian.exe" --remote-debugging-port=9222 "obsidian://open?vault=cerebro"

Coreografia:
  1. abre fechado num no e AFASTA revelando os 69 nos    <- o momento do video
  2. deriva lenta enquanto a fisica assenta
  3. passa o ponteiro em 3 hubs: as conexoes de cada um acendem
  4. clica num no e a nota abre, provando que tem conteudo de verdade

⚠️ A janela e posta em 900x1600, MAIOR que o monitor (1280x720). Funciona
porque o CDP captura a superficie de renderizacao, nao o que cabe na tela.

⚠️ O screenshot do Playwright NAO desenha o ponteiro do mouse. Sem o cursor
sintetico injetado, o video mostra o grafo reagindo sozinho e parece bug.
Mesma licao do vendas/gravar-video-interativo.py.
"""
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

SAIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "frames-cerebro")
CDP = "http://127.0.0.1:9222"
L, A = 900, 1600          # 9:16 nativo de Reels
FPS = 25

SAIDA.mkdir(parents=True, exist_ok=True)
for velho in SAIDA.glob("f*.jpg"):
    velho.unlink()

frames = []
_n = [0]

# ---------------------------------------------------------------- cursor falso
CURSOR = """
(() => {
  if (document.getElementById('__cur')) return;
  const d = document.createElement('div');
  d.id = '__cur';
  d.innerHTML = `<svg width="26" height="34" viewBox="0 0 26 34">
    <path d="M2 2 L2 25 L8.5 19.5 L12.5 29 L16.5 27 L12.5 18 L21 17.5 Z"
          fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`;
  Object.assign(d.style, {position:'fixed', left:'-100px', top:'-100px',
    zIndex:'99999', pointerEvents:'none',
    filter:'drop-shadow(0 2px 5px rgba(0,0,0,.65))'});
  document.body.appendChild(d);
  const anel = document.createElement('div');
  anel.id = '__anel';
  Object.assign(anel.style, {position:'fixed', width:'34px', height:'34px',
    border:'2.5px solid #7c5cff', borderRadius:'50%', zIndex:'99998',
    pointerEvents:'none', opacity:'0', transform:'translate(-50%,-50%) scale(.4)',
    transition:'opacity .18s, transform .18s'});
  document.body.appendChild(anel);
  window.__cur = (x, y) => {
    d.style.left = (x - 2) + 'px'; d.style.top = (y - 2) + 'px';
    anel.style.left = x + 'px';    anel.style.top = y + 'px';
  };
  window.__clique = () => {
    anel.style.opacity = '1'; anel.style.transform = 'translate(-50%,-50%) scale(1.15)';
    setTimeout(() => { anel.style.opacity = '0';
      anel.style.transform = 'translate(-50%,-50%) scale(.4)'; }, 260);
  };
})()
"""


def quadro(pag, dur=1 / FPS):
    """Captura um frame e anota quanto ele dura no video final."""
    _n[0] += 1
    nome = f"f{_n[0]:05d}.jpg"
    pag.screenshot(path=str(SAIDA / nome), type="jpeg", quality=88)
    frames.append((nome, dur))


def tempo_real(pag, segundos):
    """Deixa o relogio da pagina correr, capturando na cadencia do FPS."""
    fim = time.time() + segundos
    while time.time() < fim:
        quadro(pag)


def suave(t):
    """easeInOutCubic: parte devagar, acelera, freia. Movimento de camera."""
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def geometria(pag):
    """Caixa que envolve todos os nos + retangulo do canvas na tela."""
    return pag.evaluate("""() => {
        const l = window.app.workspace.getLeavesOfType('graph')[0];
        const r = l.view.renderer;
        const c = l.view.containerEl.querySelector('canvas');
        const cx_ = c.getBoundingClientRect();
        let x0=1e9, y0=1e9, x1=-1e9, y1=-1e9;
        for (const n of r.nodes) {
            if (n.x<x0) x0=n.x; if (n.x>x1) x1=n.x;
            if (n.y<y0) y0=n.y; if (n.y>y1) y1=n.y;
        }
        return {bbox:[x0,y0,x1,y1], canvas:[cx_.left, cx_.top, c.clientWidth, c.clientHeight],
                nos: r.nodes.length};
    }""")


def camera(pag, escala, cx, cy):
    """Poe a camera: escala + centro do mundo. pan = onde a origem cai na tela.

    ⚠️ Tem que setar targetScale JUNTO com setScale. O renderer do Obsidian
    interpola a escala rumo ao targetScale a cada frame, entao mexer so no
    setScale faz a camera escorregar de volta sozinha entre um frame e outro
    -- e o ponteiro passa a errar o no, porque a posicao foi calculada com a
    escala antiga.
    """
    pag.evaluate("""([e, cx, cy]) => {
        const l = window.app.workspace.getLeavesOfType('graph')[0];
        const r = l.view.renderer;
        const c = l.view.containerEl.querySelector('canvas');
        r.targetScale = e;
        r.setScale(e);
        r.setPan(c.clientWidth / 2 - cx * e, c.clientHeight / 2 - cy * e);
        r.changed();
    }""", [escala, cx, cy])


def pos_no(pag, nome):
    """Onde o no de nome X esta na TELA agora (coordenada de viewport)."""
    return pag.evaluate("""(nome) => {
        const l = window.app.workspace.getLeavesOfType('graph')[0];
        const r = l.view.renderer;
        const c = l.view.containerEl.querySelector('canvas');
        const cx_ = c.getBoundingClientRect();
        const n = r.nodes.find(n => n.id === nome + '.md' || n.id === nome);
        if (!n) return null;
        return {x: cx_.left + n.x * r.scale + r.panX,
                y: cx_.top  + n.y * r.scale + r.panY,
                mundo: [n.x, n.y]};
    }""", nome)


def mover_ate(pag, x, y, passos=16, dur=None):
    """Leva o ponteiro ate (x,y) com curva. Mao humana nao anda reto."""
    atual = pag.evaluate("() => window.__pos || [450, 800]")
    x0, y0 = atual
    # ponto de controle deslocado: da a barriga da curva
    mx, my = (x0 + x) / 2 + (y - y0) * 0.16, (y0 + y) / 2 - (x - x0) * 0.16
    for i in range(1, passos + 1):
        t = suave(i / passos)
        u = 1 - t
        px = u * u * x0 + 2 * u * t * mx + t * t * x
        py = u * u * y0 + 2 * u * t * my + t * t * y
        pag.mouse.move(px, py)
        pag.evaluate("([x,y]) => { window.__cur(x,y); window.__pos=[x,y]; }", [px, py])
        quadro(pag, dur or 1 / FPS)


def revelar(pag, geo, seg=4.0):
    """Bloco 1: abre fechado no meio e AFASTA ate caber o cerebro inteiro."""
    x0, y0, x1, y1 = geo["bbox"]
    _, _, cw, ch = geo["canvas"]
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    # 0.96: a nuvem de nos e quase quadrada e o quadro e 9:16, entao quem
    # limita e a largura. Margem apertada pra nao sobrar tarja preta nos lados.
    e_fim = min(cw / (x1 - x0), ch / (y1 - y0)) * 0.96
    e_ini = e_fim * 7.0          # comeca bem fechado
    n = int(seg * FPS)
    for i in range(n + 1):
        t = suave(i / n)
        # interpolar em log deixa o zoom com velocidade constante ao olho
        e = e_ini * pow(e_fim / e_ini, t)
        camera(pag, e, cx, cy)
        quadro(pag)
    return cx, cy, e_fim


def deriva(pag, cx, cy, esc, seg=2.2):
    """Bloco 2: respiro. A fisica continua mexendo, a camera anda de leve."""
    n = int(seg * FPS)
    for i in range(n):
        t = i / n
        camera(pag, esc * (1 + 0.05 * t), cx + 26 * t, cy - 14 * t)
        quadro(pag)


def acender(pag, nome, espera=1.1):
    """Bloco 3: ponteiro sobre um hub. O Obsidian acende as conexoes dele."""
    p = pos_no(pag, nome)
    if not p:
        print(f"AVISO: no '{nome}' nao encontrado", file=sys.stderr)
        return False
    mover_ate(pag, p["x"], p["y"])
    tempo_real(pag, espera)
    return True


with sync_playwright() as pw:
    b = pw.chromium.connect_over_cdp(CDP)
    pag = next((p for p in b.contexts[0].pages if "obsidian.md" in p.url), None)
    if pag is None:
        sys.exit("Obsidian nao esta com --remote-debugging-port=9222")

    # janela vertical + so o grafo na tela.
    # ⚠️ Nao dar por certo que o Obsidian abriu no grafo: se a tomada anterior
    # terminou com uma nota aberta, e a nota que volta. Fechar tudo e reabrir.
    pag.evaluate("""([L, A]) => {
        const e = window.require('electron');
        const w = (e.remote && e.remote.getCurrentWindow && e.remote.getCurrentWindow())
               || window.require('@electron/remote').getCurrentWindow();
        w.unmaximize(); w.setResizable(true); w.setMinimumSize(200, 200);
        w.setBounds({x: 0, y: 0, width: L, height: A});
        const ws = window.app.workspace;
        ws.iterateAllLeaves(l => {
            const t = l.view && l.view.getViewType && l.view.getViewType();
            if (t && t !== 'graph' && l.parent && l.parent.type === 'tabs') {
                try { l.detach(); } catch (err) {}
            }
        });
        ws.leftSplit.collapse(); ws.rightSplit.collapse();
    }""", [L, A])
    pag.wait_for_timeout(800)

    # abrir o grafo se nao houver nenhum, e esperar a fisica assentar
    if pag.evaluate("() => window.app.workspace.getLeavesOfType('graph').length") == 0:
        pag.evaluate("""() => window.app.workspace.getLeaf(true)
                            .setViewState({type: 'graph', active: true})""")
        pag.wait_for_timeout(3500)
    pag.wait_for_timeout(1800)

    pag.add_style_tag(content="""
        .graph-controls { display: none !important; }
        .titlebar-button-container, .workspace-ribbon { opacity: 0 !important; }
    """)
    pag.evaluate(CURSOR)
    pag.evaluate("() => { window.__pos = [450, 900]; window.__cur(450, 900); }")

    geo = geometria(pag)
    print("nos no grafo:", geo["nos"], "| canvas:", geo["canvas"][2:])

    tempo_real(pag, 0.5)
    cx, cy, esc = revelar(pag, geo, seg=4.0)     # 1. a revelacao
    tempo_real(pag, 1.2)

    # 2. o passeio pelos hubs. ⚠️ Este e o unico jeito de o NOME da nota
    # aparecer com o grafo inteiro na tela: o Obsidian so desenha rotulo
    # parado a partir de zoom ~5x (medido), mas no hover ele desenha sempre,
    # junto com as conexoes do no acendendo. Resolve rotulo e "interligado"
    # na mesma tomada.
    passeio = ["Carteira", "Técnico", "O gargalo",
               "As 7 barbearias", "Candidaturas", "Ah Imobiliária"]
    for hub in passeio:
        acender(pag, hub, espera=1.15)

    # 4. clicar e abrir a nota: prova que tem conteudo de verdade.
    # ⚠️ NAO abrir "Ah Imobiliária" nem "Maxwell Gomes" na camera: as duas tem
    # telefone real na tela. "As 7 barbearias" e uma tabela de clientes, sem
    # nenhum dado de contato.
    alvo = pos_no(pag, "As 7 barbearias")
    if alvo:
        mover_ate(pag, alvo["x"], alvo["y"])
        pag.evaluate("() => window.__clique()")
        quadro(pag, 0.12)
        pag.mouse.click(alvo["x"], alvo["y"])
        pag.wait_for_timeout(600)
        tempo_real(pag, 3.2)

    (SAIDA / "lista.txt").write_text(
        "".join(f"file '{n}'\nduration {d:.4f}\n" for n, d in frames)
        + f"file '{frames[-1][0]}'\n",
        encoding="utf-8",
    )
    print(json.dumps({"frames": len(frames),
                      "dur_total": round(sum(d for _, d in frames), 2)}))
