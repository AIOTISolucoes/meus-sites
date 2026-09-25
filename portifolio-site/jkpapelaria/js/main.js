/* =========================================================================
   JK Papelaria Personalizada — animações

   Do _modelo: intro, ícones, trilho, revelações, nav.
   Só deste cliente (no fim do arquivo): o varal de bandeirinhas com física de
   corda no hero e a caixinha que se dobra a partir da folha plana.
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   O PC do usuário reporta reduce, então é ESTE o caminho que ele vê. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});
// os balões nascem só com o contorno; o miolo entra depois que ele fecha
document.querySelectorAll('#logo-intro .balao').forEach(b => {
  gsap.set(b, { stroke: b.dataset.cor, fill: b.dataset.cor, fillOpacity: 0 });
});

gsap.timeline()
  .to('#logo-intro .tr', {
    strokeDashoffset: 0,
    duration: 1.1,
    ease: 'power2.inOut',
    stagger: .12,
  })
  .to('#logo-intro .balao', { fillOpacity: .9, duration: .5, stagger: .07 }, '-=.5')
  .from('#logo-intro .marca-jk', { scale: .5, transformOrigin: '154px 88px', duration: .55, ease: 'back.out(2)' }, '-=.3')
  .to('#logo-intro .marca-jk', { opacity: 1, duration: .4 }, '<')
  .to('#logo-intro .marca-nome', { opacity: 1, duration: .5 }, '-=.2')
  .to('#logo-intro .marca-sub', { opacity: 1, duration: .45 }, '-=.25')
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.35')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', {
    yPercent: 115,
    duration: 1,
    ease: 'power4.out',
    stagger: .1,
  }, '-=.45')
  .from('.etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', {
    opacity: 0, y: 22, duration: .7, stagger: .1,
  }, '-=.55')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

/* ------------------------------------------------------- ÍCONES (cards) */

document.querySelectorAll('[data-svc]').forEach((card, i) => {
  const tracos = card.querySelectorAll('.tr');
  tracos.forEach(p => {
    const tam = p.getTotalLength();
    gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
  });

  gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } })
    .from(card, { opacity: 0, y: 40, duration: .8, ease: 'power3.out', delay: i * .08 })
    .to(tracos, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .12 }, '-=.5');
});

/* --------------------------------------------------- TRILHO HORIZONTAL */

const trilho = document.querySelector('.trilho-interno');
if (trilho && window.innerWidth > 760) {
  const percurso = () => trilho.scrollWidth - window.innerWidth;

  gsap.to(trilho, {
    x: () => -percurso(),
    ease: 'none',
    scrollTrigger: {
      trigger: trilho.closest('section'),
      start: 'top top',
      end: () => '+=' + percurso(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray('.painel-foto').forEach(foto => {
    gsap.from(foto, {
      y: 60, opacity: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: {
        trigger: foto,
        // sem isto o ScrollTrigger mede a foto pela rolagem VERTICAL e ela
        // nunca "entra na tela" — o painel fica invisível pra sempre
        containerAnimation: gsap.getTweensOf(trilho)[0],
        start: 'left 92%',
      },
    });
  });
}

/* ------------------------------------------------- REVELAÇÕES DE SEÇÃO */

gsap.utils.toArray('.titulo-secao').forEach(tit => {
  gsap.from(tit, {
    opacity: 0, y: 46, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: tit, start: 'top 86%' },
  });
});

gsap.utils.toArray('[data-item]').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0, x: -26, duration: .8, ease: 'power3.out',
    delay: i * .12,
    scrollTrigger: { trigger: item, start: 'top 88%' },
  });
});

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

/* nav ganha sombra ao sair do topo */
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(90,6,58,.12)' : 'none',
      duration: .3,
    });
  },
});

window.addEventListener('load', () => ScrollTrigger.refresh());

/* =========================================================================
   1) VARAL DE BANDEIRINHAS (hero)

   Cordas com física de Verlet: cada varal é uma fileira de pontos ligados por
   distância fixa, com as pontas presas fora da tela. O ponteiro EMPURRA a
   corda e ela balança e assenta sozinha — não é uma animação em loop.

   Armadilhas já pagas em outros sites e respeitadas aqui: passo de tempo
   fixo com guarda Number.isFinite (senão a física nunca roda e a tela fica
   pintada porém congelada), strokes/fills agrupados por cor, pausa fora da
   tela e vigia de FPS.
   ========================================================================= */

(function varal() {
  const cv = document.getElementById('varal');
  if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: true });

  const CORES = ['#ff62b5', '#ffd166', '#6fe0bd', '#7ab8f5', '#c9a6f0'];
  const PASSO = 1 / 60;          // segundos por passo de física
  const GRAV = 0.34;             // px por passo²
  const ATRITO = 0.986;
  /* Poucas iterações = corda ELÁSTICA: a correção por quadro não vence a
     gravidade e o varal afunda muito além da folga pedida (com 4 iterações
     uma folga de 0,8% virava 220px de barriga e engolia o título). */
  const ITERACOES = 14;
  const RAIO_PONTEIRO = 120;

  let W = 0, H = 0, dpr = 1;
  let cordas = [];
  let modoLeve = false;          // ligado pelo vigia de FPS: menos varal
  let acumulado = 0, anterior = 0, tempo = 0;
  let rodando = false, visivel = true;
  const ponteiro = { x: -9999, y: -9999, ativo: false };

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function montarCordas() {
    const estreito = W < 760 || modoLeve;
    /* [x inicial, x final, y inicial, y final, folga] em fração da tela.
       Um varal atravessa o alto e os outros dois ficam só na metade DIREITA,
       que é onde o hero fica vazio: corda passando por cima do título matava
       a leitura. A folga é o que forma a barriga da corda — cuidado, ela
       cresce com o comprimento (12% num varal de 1440px afunda ~230px e
       come o título inteiro; num varal curto os mesmos 12% mal aparecem). */
    const trilhos = estreito
      ? [[-0.06, 1.06, 0.015, 0.085, 1.012]]
      /* O varal de cima atravessa a tela inteira, então vai quase esticado
         (0,6%): qualquer folga ali vira uma barriga enorme. Os dois da
         direita são curtos, então podem receber folga de verdade — e é
         justamente essa folga que deixa eles balançarem quando o ponteiro
         passa. Corda esticada não balança. */
      : [[-0.04, 1.04, -0.03, 0.035, 1.006],
         [0.42, 1.06, 0.34, 0.21, 1.06],
         [0.58, 1.06, 0.72, 0.56, 1.09]];

    cordas = trilhos.map(([ax, bx, a, b, folga], idx) => {
      const x0 = W * ax, x1 = W * bx;
      const y0 = H * a, y1 = H * b;
      const largura = W < 760 ? 34 : 60;   // px de corda por bandeirinha
      const n = Math.max(6, Math.round(Math.hypot(x1 - x0, y1 - y0) / largura)) + 1;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        pts.push({ x, y, px: x, py: y, fixo: i === 0 || i === n - 1 });
      }
      const comp = Math.hypot(x1 - x0, y1 - y0) / (n - 1) * folga;
      return { pts, comp, corBase: idx };
    });
  }

  function passo(dt) {
    const vento = suave ? 0 : Math.sin(tempo * 0.9) * 0.05 + Math.sin(tempo * 2.3) * 0.02;

    for (const c of cordas) {
      for (const p of c.pts) {
        if (p.fixo) continue;
        const vx = (p.x - p.px) * ATRITO;
        const vy = (p.y - p.py) * ATRITO;
        p.px = p.x; p.py = p.y;
        p.x += vx + vento;
        p.y += vy + GRAV;
      }

      // o ponteiro empurra a corda pra longe dele (só se ele estiver na tela)
      if (ponteiro.ativo && !suave) {
        for (const p of c.pts) {
          if (p.fixo) continue;
          const dx = p.x - ponteiro.x, dy = p.y - ponteiro.y;
          const d = Math.hypot(dx, dy);
          if (d < RAIO_PONTEIRO && d > 0.01) {
            const forca = (1 - d / RAIO_PONTEIRO) * 0.38;
            p.x += (dx / d) * RAIO_PONTEIRO * forca * 0.14;
            p.y += (dy / d) * RAIO_PONTEIRO * forca * 0.14;
          }
        }
      }

      for (let k = 0; k < ITERACOES; k++) {
        for (let i = 0; i < c.pts.length - 1; i++) {
          const a = c.pts[i], b = c.pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const ajuste = (d - c.comp) / d * 0.5;
          const ox = dx * ajuste, oy = dy * ajuste;
          if (!a.fixo) { a.x += ox; a.y += oy; }
          if (!b.fixo) { b.x -= ox; b.y -= oy; }
        }
      }
    }
  }

  function pintar() {
    ctx.clearRect(0, 0, W, H);
    const alturaBand = W < 760 ? 26 : 34;

    for (const c of cordas) {
      // 1) o cordão
      ctx.beginPath();
      ctx.moveTo(c.pts[0].x, c.pts[0].y);
      for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i].x, c.pts[i].y);
      ctx.strokeStyle = 'rgba(255, 214, 236, .32)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 2) as bandeirinhas, agrupadas por cor: 5 fills por corda em vez de um
      //    por bandeirinha (um fill por elemento é o que derruba o quadro)
      for (let ci = 0; ci < CORES.length; ci++) {
        ctx.beginPath();
        let usou = false;
        for (let i = 0; i < c.pts.length - 1; i++) {
          if ((i + c.corBase) % CORES.length !== ci) continue;
          const a = c.pts[i], b = c.pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          // normal apontando pra baixo: a bandeirinha pendura perpendicular
          let nx = dy / d, ny = -dx / d;
          if (ny < 0) { nx = -nx; ny = -ny; }
          const mx = (a.x + b.x) / 2 + nx * alturaBand;
          const my = (a.y + b.y) / 2 + ny * alturaBand;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(mx, my);
          ctx.closePath();
          usou = true;
        }
        if (usou) { ctx.fillStyle = CORES[ci]; ctx.globalAlpha = .82; ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
  }

  /* vigia de FPS: em aparelho fraco, menos bandeirinha e menos corda em vez
     de um site que engasga. Mede o tempo DENTRO do callback (medir fps em
     headless engana: ele rasteriza por software e exagera o custo). */
  let amostras = 0, somaMs = 0, jaCortou = false;

  function quadro(agora) {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    if (!visivel) { anterior = 0; return; }

    // sem esta guarda, `agora` vem undefined na 1ª chamada manual, `acumulado`
    // vira NaN e a física NUNCA roda — a tela fica pintada, porém congelada
    if (!Number.isFinite(agora)) return;
    if (!anterior) { anterior = agora; return; }

    const t0 = performance.now();
    let dt = (agora - anterior) / 1000;
    anterior = agora;
    if (dt > 0.25) dt = 0.25;
    acumulado += dt;
    tempo += dt;

    let voltas = 0;
    while (acumulado >= PASSO && voltas < 5) { passo(PASSO); acumulado -= PASSO; voltas++; }
    pintar();

    if (!jaCortou) {
      somaMs += performance.now() - t0;
      if (++amostras === 90) {
        if (somaMs / amostras > 6) {   // > 6ms por quadro só nisto é caro demais
          jaCortou = true;
          modoLeve = true;
          montarCordas();              // cai pro desenho de tela estreita
        }
        amostras = 0; somaMs = 0;
      }
    }
  }

  medir(); montarCordas();
  rodando = true;
  requestAnimationFrame(quadro);   // sempre pelo rAF: nunca chamar quadro() na mão

  window.addEventListener('resize', () => { medir(); montarCordas(); });

  const secao = document.getElementById('inicio');
  secao.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    ponteiro.x = e.clientX - r.left;
    ponteiro.y = e.clientY - r.top;
    ponteiro.ativo = true;
  });
  secao.addEventListener('pointerleave', () => { ponteiro.ativo = false; });

  // pausa o rAF quando o hero sai da tela ou a aba vai pro fundo
  new IntersectionObserver(es => {
    visivel = es[0].isIntersecting;
    if (visivel) anterior = 0;
  }, { threshold: 0 }).observe(secao);

  document.addEventListener('visibilitychange', () => {
    visivel = !document.hidden && visivel;
    anterior = 0;
  });
})();

/* =========================================================================
   2) A CAIXINHA QUE SE MONTA (seção-assinatura)

   O gesto central do trabalho dela é "recortar e montar": o mimo chega como
   folha plana impressa e vira caixinha na mão de quem comprou. A seção é
   exatamente isso — a mesma folha, com o nome que a pessoa digitou, dobrando
   até virar a caixa. É CSS 3D (transform-style: preserve-3d), não canvas:
   cada parede gira em torno da aresta que a prende à base.
   ========================================================================= */

(function montar() {
  const caixa = document.getElementById('jk-caixa');
  const palco = document.getElementById('jk-palco');
  const range = document.getElementById('jk-dobra');
  const campoNome = document.getElementById('jk-nome');
  const campoIdade = document.getElementById('jk-idade');
  const temas = document.getElementById('jk-temas');
  const pedir = document.getElementById('jk-pedir');
  if (!caixa || !range) return;

  let giroArrasto = 0;          // quanto a pessoa girou com o dedo/ponteiro
  const estado = { f: 0 };      // 0 = folha plana, 1 = caixinha fechada

  function aplicar() {
    const f = estado.f;

    caixa.style.setProperty('--d', f.toFixed(4));
    // a "câmera" acompanha: de quase frontal (folha) até 3/4 de cima (caixa)
    caixa.style.setProperty('--girox', (8 + f * 54).toFixed(2) + 'deg');
    caixa.style.setProperty('--giroz', (giroArrasto + f * -22).toFixed(2) + 'deg');
    // planificada a folha ocupa 3 arestas e montada pouco mais de 1,8: sem
    // crescer no caminho, a caixinha fica um cubinho perdido no meio do palco
    caixa.style.setProperty('--escala', (0.86 + f * 0.5).toFixed(3));
    // montada, as paredes sobem e o desenho todo sobe junto: empurra pra baixo
    // na mesma medida, senão a caixinha "escala" pelo palco enquanto fecha
    caixa.style.setProperty('--desloc', `calc(var(--s) * ${(f * 0.4).toFixed(3)})`);
  }

  function textos() {
    const nome = (campoNome.value || '').trim() || 'seu nome';
    const idade = campoIdade.value;
    document.querySelectorAll('.eco-nome').forEach(el => { el.textContent = nome; });
    document.querySelectorAll('.eco-idade').forEach(el => {
      el.textContent = idade ? (idade === '1' ? '1 ano' : idade + ' anos') : '';
    });

    const msg = idade
      ? `Oi! Vim pelo site e queria um mimo personalizado para ${nome}, ${idade} anos.`
      : `Oi! Vim pelo site e queria um mimo personalizado para ${nome}.`;
    pedir.href = 'https://wa.me/5585997703618?text=' + encodeURIComponent(msg);
  }

  range.addEventListener('input', () => {
    gsap.killTweensOf(estado);
    estado.f = range.value / 100;
    aplicar();
  });

  campoNome.addEventListener('input', textos);
  campoIdade.addEventListener('change', textos);

  temas.addEventListener('click', e => {
    const btn = e.target.closest('.tema');
    if (!btn) return;
    temas.querySelectorAll('.tema').forEach(b => {
      const eu = b === btn;
      b.classList.toggle('ativo', eu);
      b.setAttribute('aria-pressed', eu ? 'true' : 'false');
    });
    caixa.dataset.tema = btn.dataset.tema;
  });

  /* arrastar pra girar: é a segunda camada de interação, depois da barra */
  let arrastando = false, xInicial = 0, giroInicial = 0;
  palco.addEventListener('pointerdown', e => {
    arrastando = true; xInicial = e.clientX; giroInicial = giroArrasto;
    palco.setPointerCapture(e.pointerId);
  });
  palco.addEventListener('pointermove', e => {
    if (!arrastando) return;
    // trava em ±55°: passando disso a pessoa vê o VERSO da parede da frente
    // e o nome sai espelhado, que parece defeito
    const g = giroInicial + (e.clientX - xInicial) * 0.4;
    giroArrasto = Math.max(-55, Math.min(55, g));
    aplicar();
  });
  const solta = () => { arrastando = false; };
  palco.addEventListener('pointerup', solta);
  palco.addEventListener('pointercancel', solta);

  textos();
  aplicar();

  /* Uma montagem sozinha na primeira vez que a seção aparece: sem isso a
     folha fica parada e ninguém descobre que a barra faz alguma coisa.
     É um disparo único, não um loop — então vale também em movimento
     reduzido, só que mais devagar. */
  ScrollTrigger.create({
    trigger: '#assinatura',
    start: 'top 62%',
    once: true,
    onEnter: () => {
      gsap.to(estado, {
        f: 1,
        duration: suave ? 2.6 : 1.7,
        ease: 'power2.inOut',
        delay: .35,
        onUpdate: () => { range.value = Math.round(estado.f * 100); aplicar(); },
      });
    },
  });
})();
