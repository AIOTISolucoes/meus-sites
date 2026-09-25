/* =========================================================================
   LS BARBEARIA — animações
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   Atenção: o PC do usuário reporta reduce (animações do Windows desligadas),
   então é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   O brasão se desenhando. Os .tr são traço; o bigode é PREENCHIDO (em
   contorno vira rabisco), então ele não se desenha: entra por escala. */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});
gsap.set('#logo-intro .bigode', { scale: 0, transformOrigin: '100px 94px' });

gsap.timeline()
  .to('#logo-intro .tr', {
    strokeDashoffset: 0,
    duration: 1.1,
    ease: 'power2.inOut',
    stagger: .16,
  })
  .to('#logo-intro .bigode', { scale: 1, duration: .5, ease: 'back.out(1.7)' }, '-=.35')
  .to('#logo-intro .marca-faixa', { opacity: 1, duration: .45 }, '-=.25')
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
  .from('#inicio .etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
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

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

/* nav ganha sombra ao sair do topo */
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 26px rgba(22,20,14,.14)' : 'none',
      duration: .3,
    });
  },
});

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());


/* =========================================================================
   HERO — O DEGRADÊ VIRADO TEXTURA, E O RISCO DA NAVALHA

   O fundo é o próprio degradê: pontos grandes e densos em cima, curtos e
   ralos embaixo, igual à lateral de uma cabeça. Quando o ponteiro passa, ele
   RASPA — os pontos somem no rastro e voltam a crescer em ~2,4s, e o risco
   fica marcado em amarelo enquanto fecha.

   Armadilhas já pagas (COMO-FAZER.md) respeitadas aqui: passo de tempo fixo
   com guarda de Number.isFinite, strokes agrupados por faixa (um fill por
   faixa, não por ponto), pausa fora da tela e no visibilitychange, e vigia
   de FPS que rareia o campo sozinho em aparelho fraco.
   ========================================================================= */

(function heroDegrade() {
  const cv = document.getElementById('fundo');
  if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: true });

  const RAIO_RASPA = 58;      // largura do risco, em px de tela
  const TEMPO_VOLTA = 3.0;    // segundos até o cabelo voltar ao normal
  const TEMPO_RISCO = 1.4;    // segundos que a marca amarela leva pra sumir
  const FAIXAS = 5;           // quantos grupos de opacidade (1 fill cada)

  let larg = 0, alt = 0, dpr = 1;
  let espaco = window.innerWidth < 760 ? 21 : 15;
  let pontos = [], grade = [], gradeCols = 0, gradeLinhas = 0, celula = 0;
  let riscos = [];
  let raf = null, anterior = null, acumulado = 0;
  let visivel = true, naTela = true;

  const PASSO = 1 / 60;

  /* ---- montagem do campo ---- */

  function montar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    larg = cv.clientWidth;
    alt = cv.clientHeight;
    if (!larg || !alt) return;

    cv.width = Math.round(larg * dpr);
    cv.height = Math.round(alt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pontos = [];
    for (let y = espaco * .5; y < alt + espaco; y += espaco) {
      for (let x = espaco * .5; x < larg + espaco; x += espaco) {
        const ny = Math.min(y / alt, 1);
        // rarear embaixo além de encurtar: só encurtar deixa o campo com cara
        // de céu estrelado, não de cabelo raspado
        if (Math.random() < ny * .55) continue;
        pontos.push({
          x: x + (Math.random() - .5) * espaco * .8,
          y: y + (Math.random() - .5) * espaco * .8,
          // é isto que faz o campo LER como degradê: o fio vai de comprido em
          // cima a quase pele embaixo
          comp: (2 + (1 - ny) * 11) * (.7 + Math.random() * .6),
          ang: 1.62 + (Math.random() - .5) * .5,   // caindo, com desalinho
          vida: 1,
        });
      }
    }

    // índice espacial: sem ele cada movimento do ponteiro varreria os ~6 mil
    // pontos do campo
    celula = espaco * 3;
    gradeCols = Math.ceil(larg / celula) + 1;
    gradeLinhas = Math.ceil(alt / celula) + 1;
    grade = Array.from({ length: gradeCols * gradeLinhas }, () => []);
    pontos.forEach((p, i) => {
      const c = Math.min(Math.floor(p.x / celula), gradeCols - 1);
      const l = Math.min(Math.floor(p.y / celula), gradeLinhas - 1);
      grade[l * gradeCols + c].push(i);
    });
  }

  /* ---- raspar ao longo do trecho que o ponteiro andou ---- */

  function raspar(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2) - RAIO_RASPA, maxX = Math.max(x1, x2) + RAIO_RASPA;
    const minY = Math.min(y1, y2) - RAIO_RASPA, maxY = Math.max(y1, y2) + RAIO_RASPA;

    const c0 = Math.max(Math.floor(minX / celula), 0);
    const c1 = Math.min(Math.floor(maxX / celula), gradeCols - 1);
    const l0 = Math.max(Math.floor(minY / celula), 0);
    const l1 = Math.min(Math.floor(maxY / celula), gradeLinhas - 1);

    const dx = x2 - x1, dy = y2 - y1;
    const comp2 = dx * dx + dy * dy;

    for (let l = l0; l <= l1; l++) {
      for (let c = c0; c <= c1; c++) {
        const balde = grade[l * gradeCols + c];
        for (let k = 0; k < balde.length; k++) {
          const p = pontos[balde[k]];
          // distância do ponto ao SEGMENTO (não ao ponteiro): num movimento
          // rápido o ponteiro salta 80px e o risco sairia pontilhado
          let t = comp2 > 0 ? ((p.x - x1) * dx + (p.y - y1) * dy) / comp2 : 0;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const ex = x1 + dx * t - p.x, ey = y1 + dy * t - p.y;
          const d2 = ex * ex + ey * ey;
          if (d2 < RAIO_RASPA * RAIO_RASPA) {
            const forca = 1 - Math.sqrt(d2) / RAIO_RASPA;
            const restante = 1 - forca * 1.15;
            if (restante < p.vida) p.vida = restante < 0 ? 0 : restante;
          }
        }
      }
    }

    riscos.push({ x1, y1, x2, y2, idade: 0 });
    if (riscos.length > 220) riscos.splice(0, riscos.length - 220);
  }

  /* ---- física ---- */

  function fisica(dt) {
    const ganho = dt / TEMPO_VOLTA;
    for (let i = 0; i < pontos.length; i++) {
      const p = pontos[i];
      if (p.vida < 1) { p.vida += ganho; if (p.vida > 1) p.vida = 1; }
    }
    for (let i = riscos.length - 1; i >= 0; i--) {
      riscos[i].idade += dt;
      if (riscos[i].idade > TEMPO_RISCO) riscos.splice(i, 1);
    }
  }

  /* ---- desenho ---- */

  function desenhar() {
    ctx.clearRect(0, 0, larg, alt);

    // um stroke por faixa de vida. Um stroke por fio derruba o quadro, e
    // gradiente por fio derruba pela metade (ver COMO-FAZER.md)
    ctx.lineCap = 'round';
    for (let f = 0; f < FAIXAS; f++) {
      const lo = f / FAIXAS, hi = (f + 1) / FAIXAS;
      const meio = (lo + hi) / 2;
      ctx.beginPath();
      let algum = false;
      for (let i = 0; i < pontos.length; i++) {
        const p = pontos[i];
        if (p.vida <= lo || p.vida > hi) continue;
        const c = p.comp * p.vida;
        if (c < .5) continue;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.ang) * c, p.y + Math.sin(p.ang) * c);
        algum = true;
      }
      if (!algum) continue;
      ctx.lineWidth = .6 + meio * .8;
      ctx.strokeStyle = `rgba(242, 239, 228, ${(.30 * meio).toFixed(3)})`;
      ctx.stroke();
    }

    // a marca amarela do risco, enquanto fecha
    if (riscos.length) {
      ctx.lineCap = 'round';
      ctx.lineWidth = 2.6;
      for (let i = 0; i < riscos.length; i++) {
        const s = riscos[i];
        const vigor = 1 - s.idade / TEMPO_RISCO;
        ctx.strokeStyle = `rgba(250, 236, 65, ${(vigor * vigor * .8).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
    }
  }

  /* ---- vigia de FPS: em aparelho fraco, rareia o campo uma vez ----
     medir FPS em headless engana (rasteriza por software); o número
     confiável é o tempo DENTRO do callback */

  let amostras = 0, somaMs = 0, jaRareou = false;

  function medir(ms) {
    if (jaRareou || amostras > 90) return;
    somaMs += ms; amostras++;
    if (amostras === 90 && somaMs / 90 > 6) {
      jaRareou = true;
      espaco = Math.round(espaco * 1.5);
      montar();
    }
  }

  /* ---- laço ---- */

  function quadro(agora) {
    // sem esta guarda o 1º delta vira NaN, a física nunca roda e a tela fica
    // pintada porém congelada — parece tudo normal e o bug leva horas
    if (!Number.isFinite(anterior)) anterior = agora;
    acumulado += Math.min((agora - anterior) / 1000, .25);
    anterior = agora;

    const t0 = performance.now();
    while (acumulado >= PASSO) { fisica(PASSO); acumulado -= PASSO; }
    desenhar();
    medir(performance.now() - t0);

    raf = requestAnimationFrame(quadro);
  }

  function ligar() {
    if (raf || !visivel || !naTela) return;
    anterior = null;
    raf = requestAnimationFrame(quadro);
  }
  function desligar() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = null;
  }

  /* ---- ponteiro ---- */

  let ux = null, uy = null;

  cv.parentElement.addEventListener('pointermove', e => {
    const cx = cv.getBoundingClientRect();
    const x = e.clientX - cx.left, y = e.clientY - cx.top;
    if (ux !== null) raspar(ux, uy, x, y);
    ux = x; uy = y;
  });
  cv.parentElement.addEventListener('pointerleave', () => { ux = null; uy = null; });

  /* ---- ciclo de vida ---- */

  const olho = new IntersectionObserver(ent => {
    naTela = ent[0].isIntersecting;
    naTela ? ligar() : desligar();
  }, { threshold: 0 });
  olho.observe(cv);

  document.addEventListener('visibilitychange', () => {
    visivel = !document.hidden;
    visivel ? ligar() : desligar();
  });

  let temporizador = null;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { montar(); }, 180);
  });

  montar();
  ligar();
})();


/* =========================================================================
   SEÇÃO-ASSINATURA — ONDE COMEÇA O SEU DEGRADÊ

   O gesto central da barbearia é a mão subindo a lateral da cabeça pra
   decidir onde o degradê começa. Aqui quem faz o gesto é quem está olhando:
   arrasta na cabeça e o cabelo é REDESENHADO fio a fio — comprimento,
   densidade e peso mudam de verdade ao longo da altura, não é troca de
   imagem pronta.
   ========================================================================= */

(function seletorDegrade() {
  const cv = document.getElementById('fade-canvas');
  if (!cv) return;

  const ctx = cv.getContext('2d');
  const elNome = document.getElementById('fade-nome');
  const elDesc = document.getElementById('fade-desc');
  const elNota = document.getElementById('fade-nota');
  const elDica = document.getElementById('fade-dica');
  const cta = document.getElementById('fade-cta');
  const presets = [...document.querySelectorAll('.fade-preset')];

  // 438 de altura corta o pescoço logo abaixo da mandíbula. Com o quadro mais
  // alto sobra um pescoço solto, sem ombro, com cara de girafa.
  const L = 360, A = 438;          // sistema de coordenadas do desenho
  const Y_BAIXO = 280, Y_ALTO = 128;  // onde a linha do degradê pode ficar:
                                      // rente à orelha (baixo) ou no alto
  const Y_PELE = 352;              // altura em que o cabelo chega a zero

  /* Perfil virado pra direita: nuca e costas à esquerda, rosto à direita.
     Proporções de cabeça masculina: topo em 42, queixo em 350 (altura 308),
     largura ~0,73 da altura, e o nariz é o único ponto que passa da testa.
     ⚠️ O pescoço fecha em y=486, FORA do quadro de 460 de propósito: fechando
     em 460 o contorno desenha uma linha horizontal atravessando o rodapé. */
  const CABECA = new Path2D(`
    M 168 42
    C 236 42 280 96 280 156
    C 280 172 276 182 274 192
    C 272 200 278 214 286 228
    C 294 242 302 252 303 259
    C 304 264 299 266 292 266
    C 285 266 280 268 279 274
    C 278 280 281 286 285 290
    C 281 295 278 299 277 306
    C 276 314 279 320 281 325
    C 280 335 268 345 250 351
    C 234 357 220 367 216 385
    C 214 394 214 400 214 406
    L 214 486 L 106 486
    C 106 430 100 380 88 350
    C 68 306 52 252 52 196
    C 52 108 100 42 168 42 Z
  `);

  /* a linha do cabelo: até onde o couro cabeludo avança sobre o rosto.
     Pares [y, x] — à esquerda deste x tem cabelo, à direita é rosto. */
  const LINHA_CABELO = [
    [42, 330], [80, 300], [118, 268], [155, 212], [195, 186],
    [240, 178], [285, 180], [325, 190], [360, 198],
  ];

  const ORELHA = { x: 150, y: 245, rx: 20, ry: 27 };

  const NIVEIS = [
    { max: 33, nome: 'Degradê baixo', desc: 'A transição começa logo acima da orelha. Discreto, cresce sem marcar degrau e é o que mais dura entre um corte e o próximo.' },
    { max: 56, nome: 'Degradê médio', desc: 'A transição começa na altura da têmpora. É o meio-termo: marca bem e continua discreto no trabalho.' },
    { max: 79, nome: 'Degradê alto', desc: 'A virada sobe até perto da linha do topete. O contraste aparece de longe e o desenho da cabeça fica todo à mostra.' },
    { max: 100, nome: 'Navalhado', desc: 'Vai até a pele embaixo, com a virada bem no alto e curta. É o mais marcado dos quatro — e o que pede retoque mais cedo.' },
  ];

  function nivelDe(v) { return NIVEIS.find(n => v <= n.max) || NIVEIS[3]; }

  function xLinhaCabelo(y) {
    if (y <= LINHA_CABELO[0][0]) return LINHA_CABELO[0][1];
    for (let i = 1; i < LINHA_CABELO.length; i++) {
      const [ya, xa] = LINHA_CABELO[i - 1], [yb, xb] = LINHA_CABELO[i];
      if (y <= yb) return xa + (xb - xa) * ((y - ya) / (yb - ya));
    }
    return LINHA_CABELO[LINHA_CABELO.length - 1][1];
  }

  /* ---- os fios, gerados uma vez ----
     posição fixa (o cabelo não muda de lugar quando a altura muda; o que
     muda é o comprimento de cada fio) */

  let fios = [];

  function semear() {
    fios = [];
    const passo = 4.6;
    for (let y = 44; y < Y_PELE; y += passo) {
      for (let x = 46; x < 300; x += passo) {
        if (x > xLinhaCabelo(y)) continue;             // já é rosto
        const ox = (x - ORELHA.x) / ORELHA.rx, oy = (y - ORELHA.y) / ORELHA.ry;
        if (ox * ox + oy * oy < 1.18) continue;        // a orelha não tem cabelo
        // não precisa testar se caiu fora da cabeça: o clip(CABECA) na hora
        // de desenhar já apara o que sobra (e isPointInPath tem semântica
        // ambígua sob transform — não vale o risco)
        const jx = x + (Math.random() - .5) * passo * .9;
        const jy = y + (Math.random() - .5) * passo * .9;
        fios.push({
          x: jx, y: jy,
          // o fio cai pra trás e pra baixo, como cabelo penteado
          ang: 2.0 + (Math.random() - .5) * .85,
          var: .75 + Math.random() * .5,
        });
      }
    }
  }

  /* ---- desenho ---- */

  let escala = 1, alturaAtual = 45;

  function desenhar() {
    const yVirada = Y_BAIXO - (alturaAtual / 100) * (Y_BAIXO - Y_ALTO);
    // quanto mais alto o degradê, mais curta e dura é a virada
    const dureza = .8 + (alturaAtual / 100) * .9;

    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.clearRect(0, 0, L, A);

    // pele
    ctx.fillStyle = '#cfc9bd';
    ctx.fill(CABECA);

    // sombra suave na nuca, pra cabeça não ficar chapada
    ctx.save();
    ctx.clip(CABECA);
    const sombra = ctx.createLinearGradient(53, 0, 288, 0);
    sombra.addColorStop(0, 'rgba(22,20,14,.20)');
    sombra.addColorStop(.55, 'rgba(22,20,14,0)');
    ctx.fillStyle = sombra;
    ctx.fillRect(0, 0, L, A);
    ctx.restore();

    // ---- os fios, agrupados em faixas de comprimento (um stroke por faixa;
    // um stroke por fio derruba o quadro)
    ctx.save();
    ctx.clip(CABECA);
    ctx.lineCap = 'round';

    const FAIXAS = 6;
    for (let f = 0; f < FAIXAS; f++) {
      const lo = f / FAIXAS, hi = (f + 1) / FAIXAS;
      const meio = (lo + hi) / 2;
      ctx.beginPath();
      let algum = false;

      for (let i = 0; i < fios.length; i++) {
        const fio = fios[i];
        let c;
        if (fio.y <= yVirada) c = 1;
        else if (fio.y >= Y_PELE) c = 0;
        else c = Math.pow((Y_PELE - fio.y) / (Y_PELE - yVirada), dureza);
        if (c <= lo || c > hi) continue;

        const comp = (1.1 + c * 9.4) * fio.var;
        ctx.moveTo(fio.x, fio.y);
        ctx.lineTo(fio.x + Math.cos(fio.ang) * comp, fio.y + Math.sin(fio.ang) * comp);
        algum = true;
      }
      if (!algum) continue;

      // fio curto deixa o couro aparecer: fica mais claro e mais fino
      ctx.lineWidth = .7 + meio * 1.05;
      ctx.strokeStyle = `rgba(26, 23, 18, ${(.20 + meio * .68).toFixed(3)})`;
      ctx.stroke();
    }
    ctx.restore();

    // orelha: contorno cheio + a hélice como ARCO aberto. Duas elipses
    // concêntricas viravam um alvo de tiro no meio da cabeça.
    ctx.strokeStyle = 'rgba(22,20,14,.55)';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.ellipse(ORELHA.x, ORELHA.y, ORELHA.rx, ORELHA.ry, -.12, 0, 6.2832);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(ORELHA.x + 3, ORELHA.y - 1, ORELHA.rx * .52, ORELHA.ry * .55, -.12, -2.5, 1.5);
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // contorno da cabeça
    ctx.strokeStyle = '#16140e';
    ctx.lineWidth = 2.2;
    ctx.stroke(CABECA);

    // ---- a marca da altura escolhida
    const xIni = 44, xFim = xLinhaCabelo(yVirada) + 14;
    // traço escuro cheio por baixo e amarelo tracejado por cima: só o amarelo
    // desaparece sobre o cabelo, e só o escuro desaparece sobre a pele
    ctx.beginPath();
    ctx.moveTo(xIni, yVirada);
    ctx.lineTo(xFim, yVirada);
    ctx.strokeStyle = 'rgba(10, 9, 6, .85)';
    ctx.lineWidth = 3.4;
    ctx.stroke();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = '#faec41';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // pega de arrastar, na lateral
    ctx.fillStyle = '#faec41';
    ctx.strokeStyle = '#16140e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(xIni - 26, yVirada - 11, 26, 22, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xIni - 19, yVirada - 3.5); ctx.lineTo(xIni - 13, yVirada - 7.5); ctx.lineTo(xIni - 7, yVirada - 3.5);
    ctx.moveTo(xIni - 19, yVirada + 3.5); ctx.lineTo(xIni - 13, yVirada + 7.5); ctx.lineTo(xIni - 7, yVirada + 3.5);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  /* ---- estado ---- */

  function aplicar(v, comTransicao) {
    v = Math.max(0, Math.min(100, v));
    const nivel = nivelDe(v);

    elNome.textContent = nivel.nome;
    elDesc.textContent = nivel.desc;
    cv.setAttribute('aria-valuenow', Math.round(v));
    cv.setAttribute('aria-valuetext', nivel.nome);
    presets.forEach(b => b.classList.toggle('ativo', nivelDe(+b.dataset.altura).nome === nivel.nome));

    if (comTransicao && !suave) {
      gsap.to({ v: alturaAtual }, {
        v, duration: .5, ease: 'power2.out',
        onUpdate() { alturaAtual = this.targets()[0].v; desenhar(); },
      });
    } else {
      alturaAtual = v;
      desenhar();
    }
  }

  /* ---- tamanho ---- */

  function dimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const larg = cv.clientWidth || L;
    escala = (larg / L) * dpr;
    cv.width = Math.round(L * escala);
    cv.height = Math.round(A * escala);
    if (!fios.length) semear();
    desenhar();
  }

  /* ---- arrastar ---- */

  function alturaDoEvento(e) {
    const cx = cv.getBoundingClientRect();
    const y = (e.clientY - cx.top) / cx.height * A;
    return (Y_BAIXO - y) / (Y_BAIXO - Y_ALTO) * 100;
  }

  let arrastando = false;

  cv.addEventListener('pointerdown', e => {
    arrastando = true;
    cv.setPointerCapture(e.pointerId);
    elDica.classList.add('some');
    aplicar(alturaDoEvento(e), false);
  });
  cv.addEventListener('pointermove', e => { if (arrastando) aplicar(alturaDoEvento(e), false); });
  cv.addEventListener('pointerup', e => { arrastando = false; cv.releasePointerCapture(e.pointerId); });
  cv.addEventListener('pointercancel', () => { arrastando = false; });

  cv.addEventListener('keydown', e => {
    const passo = e.shiftKey ? 10 : 4;
    let v = null;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') v = alturaAtual + passo;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') v = alturaAtual - passo;
    else if (e.key === 'Home') v = 0;
    else if (e.key === 'End') v = 100;
    if (v === null) return;
    e.preventDefault();
    elDica.classList.add('some');
    aplicar(v, false);
  });

  presets.forEach(b => {
    b.addEventListener('click', () => {
      elDica.classList.add('some');
      aplicar(+b.dataset.altura, true);
    });
  });

  /* ---- levar a escolha pro Direct ----
     o link ig.me/m/ NÃO aceita mensagem pronta na URL (diferente do wa.me),
     então a mensagem vai pela área de transferência e a pessoa cola */

  cta.addEventListener('click', () => {
    const nome = nivelDe(alturaAtual).nome.toLowerCase();
    const msg = `Oi! Vi o site de vocês. Queria marcar um corte com ${nome}. Que dia dá pra encaixar?`;

    // abrir ANTES de copiar: depois de um await o navegador trata a janela
    // como não solicitada e bloqueia
    window.open('https://ig.me/m/lsbarbearia_', '_blank', 'noopener');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(
        () => { elNota.textContent = 'Mensagem copiada — é só colar no Direct.'; },
        () => { elNota.textContent = `Peça assim no Direct: "${nome}".`; }
      );
    } else {
      elNota.textContent = `Peça assim no Direct: "${nome}".`;
    }
  });

  /* ---- partida ---- */

  let temporizador = null;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(dimensionar, 180);
  });

  dimensionar();
  aplicar(45, false);

  // a fonte/imagem pode mudar a largura depois da 1ª medida
  window.addEventListener('load', dimensionar);
})();
