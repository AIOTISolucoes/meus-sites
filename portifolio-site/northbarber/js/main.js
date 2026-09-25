/* =========================================================================
   NORTH BARBER SHOP — animações

   Estrutura: intro · poste do hero · ícones · trilho · revelações · e no fim
   a seção-assinatura deste cliente (a conta do plano).
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   ⚠️ O PC do usuário reporta reduce (animações do Windows desligadas), então
   é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   A ordem conta a marca: primeiro o anel se fecha, depois entra o "N" feito
   de navalha e poste (que é o melhor detalhe deles), depois o script "North"
   se escreve, e por último "BARBER SHOP".

   Truque do script: ele é um path de PREENCHIMENTO (veio do contorno da
   letra, não do eixo dela). Pra se desenhar, vira temporariamente um traço
   com dasharray; no fim o preenchimento aparece por cima. */

const script = document.querySelector('#marca-intro .meio');
const anel = document.querySelector('#marca-intro .anel');

const linhaAnel = anel.getTotalLength();
gsap.set(anel, { strokeDasharray: linhaAnel, strokeDashoffset: linhaAnel });

const linha = script.getTotalLength();
gsap.set(script, {
  attr: { 'stroke-width': 1.1 },
  stroke: 'currentColor',
  fillOpacity: 0,
  strokeDasharray: linha,
  strokeDashoffset: linha,
});

gsap.timeline()
  .to(anel, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
  // ⚠️ fromTo, não from: os grupos nascem com opacity:0 no CSS, e um
  // .from({opacity:0}) animaria de 0 PARA 0 — a marca nunca apareceria.
  .fromTo('#marca-intro .alto',
    { opacity: 0, y: -12, scale: .88, transformOrigin: '50% 70%' },
    { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'power3.out' }, '-=.55')
  .to(script, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' }, '-=.2')
  .to(script, { fillOpacity: 1, duration: .35, ease: 'power2.out' }, '-=.15')
  .to(script, { strokeWidth: 0, duration: .3 }, '<')
  .fromTo('#marca-intro .baixo',
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: .5, ease: 'power3.out' }, '-=.15')
  .to('.intro-marca', { scale: .95, duration: .5, ease: 'power2.inOut' }, '+=.35')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', { yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1 }, '-=.45')
  .from('#inicio .etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', { opacity: 0, y: 22, duration: .7, stagger: .1 }, '-=.55')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

/* -------------------------------------------------- O POSTE DO HERO
   As faixas do poste de barbeiro que forma a perna direita do "N" da marca
   deles, subindo devagar atrás do texto. Não é enfeite genérico: é o objeto
   que está dentro da própria logo.

   O ponteiro atrasa as faixas por perto, como a mão encostando no cilindro. */

const tela = document.getElementById('poste');
if (tela) {
  const ctx = tela.getContext('2d', { alpha: false });
  // ⚠️ faixa larga NÃO fica mais parecida com o poste: vira um zebrado
  // gigante atravessando a tela e o hero passa a ser o padrão, não o texto.
  // A leitura de "poste" vem da repetição, não do tamanho.
  const FAIXA = 52;
  const INCLINACAO = 0.42;
  const CORES = ['#0a1136', '#c62430', '#01052a', '#38445e'];

  let larg = 0, alt = 0, desloc = 0, dpr = 1;
  let mx = -9999, my = -9999, atracao = 0;

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    larg = tela.clientWidth;
    alt = tela.clientHeight;
    tela.width = Math.round(larg * dpr);
    tela.height = Math.round(alt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function desenhar() {
    ctx.fillStyle = '#01052a';
    ctx.fillRect(0, 0, larg, alt);

    // O período é o conjunto das 4 faixas: o deslocamento tem que voltar a
    // zero nesse período, senão a emenda salta a cada volta.
    const periodo = FAIXA * CORES.length;
    const base = -periodo * 2 + (desloc % periodo);
    const total = larg + Math.abs(INCLINACAO) * alt + periodo * 4;

    // um path por faixa: com um fill() por pedaço o quadro cai pela metade
    for (let i = 0; i * FAIXA < total; i++) {
      const x = base + i * FAIXA;
      ctx.fillStyle = CORES[i % CORES.length];
      ctx.beginPath();
      ctx.moveTo(x, alt);
      ctx.lineTo(x + INCLINACAO * alt, 0);
      ctx.lineTo(x + INCLINACAO * alt + FAIXA, 0);
      ctx.lineTo(x + FAIXA, alt);
      ctx.closePath();
      ctx.fill();
    }

    // véu: as faixas são só textura, o hero é o texto
    const veu = ctx.createLinearGradient(0, 0, larg, alt);
    veu.addColorStop(0, 'rgba(1,5,42,.94)');
    veu.addColorStop(.55, 'rgba(1,5,42,.82)');
    veu.addColorStop(1, 'rgba(1,5,42,.93)');
    ctx.fillStyle = veu;
    ctx.fillRect(0, 0, larg, alt);

    if (atracao > .01) {
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 210);
      halo.addColorStop(0, `rgba(198,36,48,${.18 * atracao})`);
      halo.addColorStop(1, 'rgba(198,36,48,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, larg, alt);
    }
  }

  /* Passo de tempo FIXO com acumulador. Sem isto a velocidade anda junto com
     a taxa de quadros e o poste gira o dobro numa tela de 120Hz. */
  const PASSO = 1000 / 60;
  let anterior = null, acumulado = 0, rodando = true;

  function quadro(agora) {
    requestAnimationFrame(quadro);
    if (!rodando) { anterior = agora; return; }
    // guarda da 1ª chamada: sem ela `acumulado` vira NaN, a física nunca roda
    // e a tela fica pintada porém CONGELADA — parece normal e o bug leva horas
    if (!Number.isFinite(anterior)) { anterior = agora; return; }

    acumulado = Math.min(acumulado + (agora - anterior), 200);
    anterior = agora;

    while (acumulado >= PASSO) {
      desloc += 0.62 * (1 - atracao * 0.55);
      atracao += ((mx > -9000 ? 1 : 0) - atracao) * 0.06;
      acumulado -= PASSO;
    }
    desenhar();
  }

  medir();
  window.addEventListener('resize', () => { medir(); if (suave) desenhar(); });

  if (suave) {
    // O poste girando é exatamente "o que se repete sozinho pra sempre": em
    // movimento reduzido ele fica PINTADO E PARADO.
    desenhar();
  } else {
    tela.addEventListener('pointermove', e => {
      const r = tela.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    tela.addEventListener('pointerleave', () => { mx = my = -9999; });

    new IntersectionObserver(([e]) => { rodando = e.isIntersecting; }, { threshold: 0 })
      .observe(tela);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { rodando = false; anterior = null; }
    });
    requestAnimationFrame(quadro);
  }
}

/* ------------------------------------------------------- ÍCONES (cards) */

document.querySelectorAll('[data-svc]').forEach((card, i) => {
  const tracos = card.querySelectorAll('.tr');
  tracos.forEach(p => {
    const tam = p.getTotalLength();
    gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
  });

  gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } })
    .from(card, { opacity: 0, y: 40, duration: .8, ease: 'power3.out', delay: (i % 3) * .08 })
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
    opacity: 0, y: 34, duration: .8, ease: 'power3.out',
    delay: i * .1,
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
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(0,0,0,.45)' : 'none',
      duration: .3,
    });
  },
});

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());

/* =========================================================================
   A SEÇÃO-ASSINATURA: A CONTA DO PLANO

   O produto que a North empurra é o plano mensal, e a pergunta que decide a
   compra é "vale a pena pra mim?". Essa pergunta é ARITMÉTICA: depende de
   quantas vezes a pessoa vai por mês.

   ⚠️ A conta usa SÓ o valor mensal publicado por eles, dividido pelas idas.
   O valor AVULSO de corte e barba não está publicado em lugar nenhum, então
   o site não compara com ele nem diz "você economiza X" — isso exigiria
   inventar o preço avulso, que é o erro que queima o cliente.
   ========================================================================= */

(() => {
  const degraus = document.querySelectorAll('.degrau');
  if (!degraus.length) return;

  const PLANOS = {
    'cabelo': { mes: 99.90, nome: 'Cabelo' },
    'barba': { mes: 119.90, nome: 'Barba' },
    'cabelo-barba': { mes: 199.90, nome: 'Cabelo e barba' },
  };

  const dinheiro = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  let idas = 2;

  function contar() {
    document.getElementById('mostrador-numero').innerHTML =
      `<span>${idas}</span> ${idas === 1 ? 'ida' : 'idas'}`;

    document.querySelectorAll('.plano').forEach(cartao => {
      const p = PLANOS[cartao.dataset.plano];
      cartao.querySelector('[data-cada]').textContent = dinheiro(p.mes / idas);
    });

    document.getElementById('conta-aviso').textContent =
      `A conta é o valor mensal publicado pela North dividido por ${idas} ` +
      `${idas === 1 ? 'ida' : 'idas'} no mês. O preço avulso de corte e barba não ` +
      'está publicado, então este site não compara com ele — quem informa isso é a barbearia.';

    const msg =
      'Oi! Vim pelo site e queria saber do plano de assinatura.\n' +
      `Eu costumo ir umas ${idas} ${idas === 1 ? 'vez' : 'vezes'} por mês.\n\n` +
      'Qual plano vocês indicam?';
    document.getElementById('btn-plano').href =
      'https://wa.me/5585921852119?text=' + encodeURIComponent(msg);
  }

  degraus.forEach(btn => {
    btn.addEventListener('click', () => {
      idas = Number(btn.dataset.idas);
      degraus.forEach(o => o.setAttribute('aria-pressed', String(o === btn)));
      contar();
      if (!suave) {
        gsap.fromTo('.plano-cada b',
          { opacity: .25, y: 8 },
          { opacity: 1, y: 0, duration: .45, ease: 'power3.out', stagger: .06 });
      }
    });
  });

  contar();
})();
