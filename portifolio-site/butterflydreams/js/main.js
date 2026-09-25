/* =========================================================================
   BUTTERFLY DREAMS SALON
   intro desenhada + mechas de cor no hero + a escala da colorimetria
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});

gsap.timeline()
  .to('#logo-intro .tr', {
    strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .14,
  })
  .to('#logo-intro .marca-nome', { opacity: 1, duration: .5 }, '-=.4')
  .to('#logo-intro .marca-sub', { opacity: 1, duration: .45 }, '-=.3')
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.4')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', {
    yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1,
  }, '-=.45')
  .from('.etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', {
    opacity: 0, y: 22, duration: .7, stagger: .1,
  }, '-=.55')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

/* ------------------------------------------------------ MECHAS (hero)
   Faixas verticais nos tons reais da escala de colorimetria — é o leque de
   cores do salão, em movimento. Elas ondulam devagar e SE ABREM na passagem do
   ponteiro, como quando alguém passa a mão no cabelo pra mostrar a mecha.

   Faixa larga e não fio fino de propósito: fio fino já é a assinatura de outro
   site, e aqui o assunto é COR, não textura. */

const tela = document.getElementById('mechas');
const ctx = tela && tela.getContext('2d');

if (ctx) (function mechas() {
  const TOQUE = window.matchMedia('(hover: none)').matches;

  // os tons da escala 1-10, do preto ao louro claríssimo
  const TONS = ['13,11,10', '47,33,26', '106,74,53', '138,98,66', '168,127,82',
                '198,161,113', '221,197,154', '235,220,187'];

  let L = 0, A = 0, faixas = [], rodando = true, t = 0;
  let alvoX = -9999, atualX = -9999, ponteiro = false;

  function medir() {
    const r = tela.getBoundingClientRect();
    L = Math.max(1, r.width);
    A = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, L < 760 ? 1.5 : 2);
    tela.width = Math.round(L * dpr);
    tela.height = Math.round(A * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function semear() {
    const qtd = Math.max(7, Math.min(16, Math.round(L / 110)));
    const larg = (L + 160) / qtd;
    faixas = [];
    for (let i = 0; i < qtd; i++) {
      faixas.push({
        base: -80 + larg * (i + .5),
        larg: larg * (.55 + Math.random() * .3),
        amp: 12 + Math.random() * 26,     // o quanto ondula
        vel: .18 + Math.random() * .22,
        fase: Math.random() * Math.PI * 2,
        desl: 0,                           // afastamento causado pelo ponteiro
        tom: TONS[(Math.random() * TONS.length) | 0],
        alfa: .07 + Math.random() * .07,
      });
    }
    janelaIni = 0;
  }

  function fisica() {
    t += PASSO;
    atualX += (alvoX - atualX) * .14;
    const raio = L < 760 ? 130 : 200;
    const forca = suave ? 0 : 1;

    for (const f of faixas) {
      let alvoDesl = 0;
      if (ponteiro && forca) {
        const dx = f.base - atualX;
        const d = Math.abs(dx);
        if (d < raio) {
          // abre pro lado de fora: a mecha se afasta da mão
          alvoDesl = (dx >= 0 ? 1 : -1) * (1 - d / raio) * 62;
        }
      }
      // volta devagar quando a mão sai
      f.desl += (alvoDesl - f.desl) * .09;
    }
  }

  function pintar() {
    ctx.clearRect(0, 0, L, A);
    const ritmo = suave ? .45 : 1;
    for (const f of faixas) {
      const meia = f.larg / 2;
      ctx.beginPath();
      // borda esquerda descendo
      for (let y = -20; y <= A + 20; y += 22) {
        const x = f.base + f.desl
                + Math.sin(y * .006 + t * f.vel * ritmo + f.fase) * f.amp;
        if (y === -20) ctx.moveTo(x - meia, y); else ctx.lineTo(x - meia, y);
      }
      // borda direita voltando
      for (let y = A + 20; y >= -20; y -= 22) {
        const x = f.base + f.desl
                + Math.sin(y * .006 + t * f.vel * ritmo + f.fase) * f.amp;
        ctx.lineTo(x + meia, y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${f.tom},${f.alfa})`;
      ctx.fill();
    }
  }

  const PASSO = 1 / 60;
  let ultimo = 0, acumulado = 0;

  function quadro(agora) {
    if (!rodando) return;
    // sem esta guarda a 1ª chamada sem timestamp vira NaN e a física trava
    if (!Number.isFinite(agora)) { requestAnimationFrame(quadro); return; }
    if (!ultimo) ultimo = agora;
    acumulado += Math.min((agora - ultimo) / 1000, .1);
    ultimo = agora;
    let voltas = 0;
    while (acumulado >= PASSO && voltas < 2) { fisica(); acumulado -= PASSO; voltas++; }
    pintar();
    vigiar(agora);
    requestAnimationFrame(quadro);
  }

  let janelaIni = 0, janelaQtd = 0, cortes = 0, ruins = 0;
  function vigiar(agora) {
    if (cortes >= 2 || faixas.length <= 5) return;
    if (!janelaIni) { janelaIni = agora; janelaQtd = 0; return; }
    janelaQtd++;
    const dur = agora - janelaIni;
    if (dur < 1500) return;
    const fps = janelaQtd / (dur / 1000);
    janelaIni = agora; janelaQtd = 0;
    if (fps < 26) {
      if (++ruins < 2) return;
      ruins = 0;
      faixas = faixas.filter((_, i) => i % 2 === 0);
      cortes++;
    } else { ruins = 0; }
  }

  function ligar() { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } }
  function desligar() { rodando = false; }

  medir(); semear();
  requestAnimationFrame(quadro);

  if (!suave) {
    const alvo = x => {
      const r = tela.getBoundingClientRect();
      alvoX = x - r.left;
      if (!ponteiro) { atualX = alvoX; ponteiro = true; }
    };
    if (!TOQUE) {
      window.addEventListener('pointermove', e => alvo(e.clientX), { passive: true });
      window.addEventListener('pointerleave', () => { ponteiro = false; }, { passive: true });
    } else {
      window.addEventListener('touchmove', e => { const p = e.touches[0]; if (p) alvo(p.clientX); }, { passive: true });
      window.addEventListener('touchend', () => { ponteiro = false; }, { passive: true });
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? ligar() : desligar()), { threshold: 0 }).observe(tela);
  }
  document.addEventListener('visibilitychange', () => { document.hidden ? desligar() : ligar(); });

  let atraso;
  window.addEventListener('resize', () => {
    clearTimeout(atraso);
    atraso = setTimeout(() => {
      const antes = L;
      medir();
      if (Math.abs(L - antes) > 2) semear();
    }, 180);
  }, { passive: true });
})();

/* =========================================================================
   A ESCALA — seção-assinatura

   A pergunta que mais chega num salão de colorimetria é "dá pra chegar no
   loiro que eu quero?". A resposta profissional não é sim ou não: é a escala
   de níveis (1 a 10) e o FUNDO DE CLAREAMENTO — o pigmento quente que aparece
   no fio conforme ele clareia, e que precisa ser neutralizado.

   Colocar isso na tela faz duas coisas de uma vez: responde a dúvida real da
   visitante e mostra que quem atende domina a técnica. É o argumento de venda
   do salão, virado interface.
   ========================================================================= */

(function aEscala() {
  const colDe = document.getElementById('niveis-de');
  if (!colDe) return;
  const colPara = document.getElementById('niveis-para');

  const NIVEIS = [
    { n: 1, nome: 'Preto', cor: '#0d0b0a' },
    { n: 2, nome: 'Castanho muito escuro', cor: '#1e1512' },
    { n: 3, nome: 'Castanho escuro', cor: '#2f211a' },
    { n: 4, nome: 'Castanho médio', cor: '#4a3226' },
    { n: 5, nome: 'Castanho claro', cor: '#6b4a35' },
    { n: 6, nome: 'Louro escuro', cor: '#8a6242' },
    { n: 7, nome: 'Louro médio', cor: '#a87f52' },
    { n: 8, nome: 'Louro claro', cor: '#c6a171' },
    { n: 9, nome: 'Louro muito claro', cor: '#ddc59a' },
    { n: 10, nome: 'Louro claríssimo', cor: '#ebdcbb' },
  ];

  // o pigmento que o fio revela ao chegar em cada nível
  const FUNDO = {
    1: ['Vermelho', '#5e1a0d'], 2: ['Vermelho', '#6b1b0e'], 3: ['Vermelho', '#7d2410'],
    4: ['Vermelho-alaranjado', '#9c3a12'], 5: ['Alaranjado', '#b85916'],
    6: ['Alaranjado', '#cc7a1e'], 7: ['Amarelo-alaranjado', '#d99c2a'],
    8: ['Amarelo', '#e5bb3c'], 9: ['Amarelo claro', '#efd469'],
    10: ['Amarelo claríssimo', '#f7e79c'],
  };

  const elFundoCor = document.getElementById('fundo-cor');
  const elFundoNome = document.getElementById('fundo-nome');
  const elFundoTexto = document.getElementById('fundo-texto');
  const elSaltoNum = document.getElementById('salto-num');
  const elSaltoTxt = document.getElementById('salto-txt');
  const elVeredito = document.getElementById('veredito');

  let de = 4, para = 8;

  function montar(col, lado) {
    NIVEIS.forEach(nv => {
      const b = document.createElement('button');
      b.className = 'nivel';
      b.dataset.n = nv.n;
      b.setAttribute('role', 'option');
      b.innerHTML = `<i style="background:${nv.cor}"></i>
        <span class="nivel-n">${nv.n}</span>
        <span class="nivel-nome">${nv.nome}</span>`;
      b.addEventListener('click', () => {
        if (lado === 'de') de = nv.n; else para = nv.n;
        marcar();
        atualizar();
      });
      col.appendChild(b);
    });
  }

  function marcar() {
    colDe.querySelectorAll('.nivel').forEach(b =>
      b.classList.toggle('ativo', +b.dataset.n === de));
    colPara.querySelectorAll('.nivel').forEach(b =>
      b.classList.toggle('ativo', +b.dataset.n === para));
  }

  function atualizar() {
    const salto = para - de;
    const [nomeF, corF] = FUNDO[para];

    gsap.to(elFundoCor, { backgroundColor: corF, duration: .5, ease: 'power2.out' });
    elFundoNome.textContent = nomeF;

    if (salto > 0) {
      elFundoTexto.textContent =
        'É esse pigmento que aparece no fio ao clarear — e é ele que precisa ser neutralizado pra cor final não puxar para o quente.';
    } else if (salto === 0) {
      elFundoTexto.textContent =
        'Sem clareamento: aqui é só depositar cor, tonalizar ou dar brilho.';
    } else {
      elFundoTexto.textContent =
        'Escurecer não revela fundo de clareamento — o trabalho é de deposição de pigmento.';
    }

    // contador que anda em vez de pular: dá tempo de perceber a mudança
    const alvo = Math.abs(salto);
    gsap.to({ v: +elSaltoNum.textContent || 0 }, {
      v: alvo, duration: .5, ease: 'power2.out',
      onUpdate() { elSaltoNum.textContent = Math.round(this.targets()[0].v); },
    });
    elSaltoTxt.textContent = salto >= 0
      ? (alvo === 1 ? 'nível de clareamento' : 'níveis de clareamento')
      : (alvo === 1 ? 'nível para escurecer' : 'níveis para escurecer');

    let veredito;
    if (salto <= 0) {
      veredito = 'Sem clareamento envolvido, o cabelo sofre bem menos. Costuma resolver numa sessão.';
    } else if (salto <= 2) {
      veredito = 'Salto curto: em fio saudável costuma sair numa sessão só.';
    } else if (salto <= 4) {
      veredito = 'Salto médio: em geral pede mais de uma sessão para não maltratar o fio.';
    } else {
      veredito = 'Salto grande: isso é um projeto de cor, feito em várias sessões e com pausa entre elas.';
    }
    elVeredito.textContent = veredito;
    gsap.fromTo(elVeredito, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 });
  }

  montar(colDe, 'de');
  montar(colPara, 'para');
  marcar();
  atualizar();
})();

/* ------------------------------------------------------- ÍCONES (cards) */

document.querySelectorAll('[data-svc]').forEach((card, i) => {
  const tracos = card.querySelectorAll('.tr');
  tracos.forEach(p => {
    const tam = p.getTotalLength();
    gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
  });
  gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } })
    .from(card, { opacity: 0, y: 40, duration: .8, ease: 'power3.out', delay: i * .08 })
    .to(tracos, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .1 }, '-=.5');
});

/* --------------------------------------------------- TRILHO HORIZONTAL */

const trilho = document.querySelector('.trilho-interno');
if (trilho && window.innerWidth > 760) {
  const percurso = () => trilho.scrollWidth - window.innerWidth;
  gsap.to(trilho, {
    x: () => -percurso(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#galeria', start: 'top top', end: () => '+=' + percurso(),
      pin: true, scrub: 1, invalidateOnRefresh: true,
    },
  });
  gsap.utils.toArray('.painel-foto').forEach(foto => {
    gsap.from(foto, {
      y: 60, opacity: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: {
        trigger: foto,
        containerAnimation: gsap.getTweensOf(trilho)[0],
        start: 'left 92%',
      },
    });
  });
}

/* ------------------------------------------------------------ PARALLAX */

if (!suave) {
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const forca = parseFloat(el.dataset.parallax) || .12;
    const img = el.querySelector('img') || el;
    gsap.fromTo(img, { yPercent: -forca * 100 }, {
      yPercent: forca * 100, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
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
    opacity: 0, x: -26, duration: .8, ease: 'power3.out', delay: i * .12,
    scrollTrigger: { trigger: item, start: 'top 88%' },
  });
});

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(18,16,13,.12)' : 'none',
      duration: .3,
    });
  },
});

window.addEventListener('load', () => ScrollTrigger.refresh());
