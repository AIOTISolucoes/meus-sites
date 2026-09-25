/* =========================================================================
   GENTLEMAN BARBEARIA — animações

   Estrutura: intro · poste do hero · ícones · trilho · revelações · e no fim
   a seção-assinatura deste cliente (Monte o seu Gentleman).
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   ⚠️ O PC do usuário reporta reduce (animações do Windows desligadas), então
   é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   A cabeça e a faixa são silhuetas preenchidas — entram por escala/opacidade.
   O script "Gentleman" é que se DESENHA, e é ele o momento.

   Truque: o script é um path de PREENCHIMENTO (veio do contorno da letra,
   não do eixo dela). Pra ele se desenhar, ele vira temporariamente um traço
   com dasharray; no fim o preenchimento aparece por cima. Sem isso a palavra
   nasceria pronta e a intro não teria assunto. */

const script = document.querySelector('#brasao-intro .script');
const linha = script.getTotalLength();

gsap.set(script, {
  attr: { 'stroke-width': 1.1 },
  stroke: 'currentColor',
  fillOpacity: 0,
  strokeDasharray: linha,
  strokeDashoffset: linha,
});

const abertura = gsap.timeline();

abertura
  // ⚠️ tem que ser fromTo, não from: a cabeça nasce com opacity:0 no CSS, e um
  // .from({opacity:0}) animaria de 0 PARA 0 — a cabeça nunca aparecia e a
  // intro rodava inteira mostrando só o script. Custou um teste de vídeo.
  .fromTo('#brasao-intro .cabeca',
    { opacity: 0, y: -14, scale: .9, transformOrigin: '50% 60%' },
    { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'power3.out' })
  .to(script, { strokeDashoffset: 0, duration: 1.5, ease: 'power1.inOut' }, '-=.25')
  .to(script, { fillOpacity: 1, duration: .35, ease: 'power2.out' }, '-=.15')
  .to(script, { strokeWidth: 0, duration: .3 }, '<')
  .fromTo('#brasao-intro .faixa',
    { opacity: 0, xPercent: -6 },
    { opacity: 1, xPercent: 0, duration: .55, ease: 'power3.out' }, '-=.2')
  .to('.intro-marca', { scale: .95, duration: .5, ease: 'power2.inOut' }, '+=.35')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', { yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1 }, '-=.45')
  .from('#inicio .etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', { opacity: 0, y: 22, duration: .7, stagger: .1 }, '-=.55')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

/* -------------------------------------------------- O POSTE DO HERO
   As faixas do poste de barbeiro da fachada deles (laranja/branco/azul),
   subindo devagar atrás do texto. Não é enfeite genérico: é o objeto que
   está na porta da barbearia, e é o que diz "barbearia" sem escrever.

   O ponteiro atrasa as faixas por perto, como a mão encostando no cilindro. */

const tela = document.getElementById('poste');
if (tela) {
  const ctx = tela.getContext('2d', { alpha: false });
  // ⚠️ faixa larga NÃO fica mais parecida com o poste: fica um zebrado gigante
  // atravessando a tela, e o hero vira o padrão em vez do texto. A leitura de
  // "poste" vem da repetição, não do tamanho. Testado em 108 (ruim) e 52 (bom).
  const FAIXA = 52;            // largura de uma faixa medida na diagonal
  const INCLINACAO = 0.42;     // quanto a faixa deita (dx por dy)
  const CORES = ['#1b2532', '#e2621c', '#161b21', '#cfc7ba'];

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
    ctx.fillStyle = '#0f1216';
    ctx.fillRect(0, 0, larg, alt);

    // O período é o conjunto das 4 faixas: o deslocamento tem que voltar a
    // zero nesse período, senão a emenda salta a cada volta.
    const periodo = FAIXA * CORES.length;
    const base = -periodo * 2 + (desloc % periodo);
    const total = larg + Math.abs(INCLINACAO) * alt + periodo * 4;

    // agrupado por faixa, um path por faixa: com um fill() por pedaço o
    // quadro cai pela metade (lição do canvas do Estúdio)
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
    veu.addColorStop(0, 'rgba(15,18,22,.94)');
    veu.addColorStop(.55, 'rgba(15,18,22,.82)');
    veu.addColorStop(1, 'rgba(15,18,22,.93)');
    ctx.fillStyle = veu;
    ctx.fillRect(0, 0, larg, alt);

    // o halo que segue o ponteiro: revela um pouco as faixas por perto
    if (atracao > .01) {
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 210);
      halo.addColorStop(0, `rgba(226,98,28,${.16 * atracao})`);
      halo.addColorStop(1, 'rgba(226,98,28,0)');
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
      // o ponteiro segura as faixas por perto; longe dele elas correm soltas
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
    // movimento reduzido ele fica PINTADO E PARADO. A textura continua lá, a
    // agitação não.
    desenhar();
  } else {
    tela.addEventListener('pointermove', e => {
      const r = tela.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    tela.addEventListener('pointerleave', () => { mx = my = -9999; });
  }

  if (!suave) {
    // pausar fora da tela e com a aba escondida: o hero é a 1ª seção, mas o
    // resto da página é longo e o canvas não pode ficar girando à toa
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
    .from(card, { opacity: 0, y: 40, duration: .8, ease: 'power3.out', delay: (i % 4) * .08 })
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

gsap.from('.horarios li', {
  opacity: 0, x: -22, duration: .7, ease: 'power3.out', stagger: .1,
  scrollTrigger: { trigger: '.horarios', start: 'top 88%' },
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
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(0,0,0,.4)' : 'none',
      duration: .3,
    });
  },
});

/* o dia de hoje acende na tabela de horários */
(() => {
  const hoje = new Date().getDay();
  document.querySelectorAll('.horarios li').forEach(li => {
    if ((li.dataset.dia || '').split(',').includes(String(hoje))) {
      li.setAttribute('data-hoje', '');
    }
  });
})();

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());

/* =========================================================================
   A SEÇÃO-ASSINATURA: MONTE O SEU GENTLEMAN

   O brasão deles é um homem de topete, barba cheia e gravata-borboleta.
   Aqui quem escolhe o cabelo e a barba dele é quem está olhando.

   A troca é escondida por uma NAVALHA que varre o retrato: sem ela o desenho
   pisca e parece falha de carregamento; com ela a troca vira o gesto da casa.
   ========================================================================= */

(() => {
  const retrato = document.getElementById('retrato');
  if (!retrato) return;

  /* Os preços são os da tabela afixada na porta, fotografada e publicada por
     eles em 22/04/2026. Só entram aqui os três que dá pra LER na foto.
     Serviço sem valor publicado não recebe número — vira "no WhatsApp". */
  const CORTE = 39.90;
  const BARBA = 39.90;
  const COMBO = 69.90;

  const CABELOS = {
    topete:    { nome: 'Topete clássico',  corte: true,  extra: null },
    degrade:   { nome: 'Degradê',          corte: true,  extra: null },
    cachos:    { nome: 'Cachos definidos', corte: true,  extra: null },
    platinado: { nome: 'Platinado',        corte: true,  extra: 'Platinado' },
  };
  const BARBAS = {
    cheia:     { nome: 'Barba cheia aparada',     cobra: true },
    desenhada: { nome: 'Barba desenhada na navalha', cobra: true },
    feita:     { nome: 'Fazer a barba',           cobra: true },
  };

  const escolha = { cabelo: 'topete', barba: 'cheia', sobrancelha: false };

  const alvos = {
    cabelo: () => retrato.querySelectorAll('.cabelo'),
    barba: () => retrato.querySelectorAll('.barba'),
  };
  const mechas = retrato.querySelector('#mechas');
  const bigode = retrato.querySelector('#bigode');
  const sobFeita = retrato.querySelector('#sobrancelha-feita');
  const sobNatural = retrato.querySelector('#sobrancelha-natural');
  const lamina = document.getElementById('lamina');
  const legenda = document.getElementById('palco-legenda');

  const dinheiro = v => 'R$ ' + v.toFixed(2).replace('.', ',');

  /* --- o desenho --- */
  function pintar() {
    alvos.cabelo().forEach(p => {
      p.style.opacity = p.dataset.cabelo === escolha.cabelo ? 1 : 0;
    });
    alvos.barba().forEach(p => {
      p.style.opacity = p.dataset.barba === escolha.barba ? 1 : 0;
    });
    mechas.style.opacity = escolha.cabelo === 'platinado' ? 1 : 0;
    // barba feita = rosto limpo: sai o bigode junto, senão vira "aparei tudo
    // menos o bigode", que é outro serviço
    bigode.style.opacity = escolha.barba === 'feita' ? 0 : 1;
    sobFeita.style.opacity = escolha.sobrancelha ? 1 : 0;
    sobNatural.style.opacity = escolha.sobrancelha ? 0 : 1;

    legenda.textContent = [
      CABELOS[escolha.cabelo].nome.toLowerCase(),
      BARBAS[escolha.barba].nome.toLowerCase(),
      escolha.sobrancelha ? 'sobrancelha' : null,
    ].filter(Boolean).join(' · ');
  }

  /* --- a conta, montada com a tabela real deles --- */
  function contar() {
    const linhas = [];
    let total = 0;
    let temPendente = false;

    // corte + barba na mesma ida É o combo: cobrar os dois cheios seria
    // inventar um preço pior do que o que eles mesmos anunciam na porta
    linhas.push({
      texto: 'Combo — corte + barba',
      valor: dinheiro(COMBO),
      combo: true,
    });
    total += COMBO;
    linhas.push({
      texto: 'em vez de ' + dinheiro(CORTE) + ' + ' + dinheiro(BARBA),
      valor: 'economia de ' + dinheiro(CORTE + BARBA - COMBO),
    });

    if (CABELOS[escolha.cabelo].extra) {
      linhas.push({ texto: CABELOS[escolha.cabelo].extra, valor: 'a combinar' });
      temPendente = true;
    }
    if (escolha.sobrancelha) {
      linhas.push({ texto: 'Sobrancelha', valor: 'a combinar' });
      temPendente = true;
    }

    document.getElementById('conta-linhas').innerHTML = linhas.map(l =>
      `<div class="conta-linha${l.combo ? ' combo' : ''}"><span>${l.texto}</span><span>${l.valor}</span></div>`
    ).join('');

    document.getElementById('conta-total').textContent =
      temPendente ? dinheiro(total) + ' +' : dinheiro(total);

    document.getElementById('conta-aviso').textContent = temPendente
      ? 'O “+” é o que não tem valor publicado: a Gentleman passa no WhatsApp. O combo é o preço da tabela da porta, de 22/04/2026 — confirme se ainda está valendo.'
      : 'Preço da tabela afixada na porta, publicada por eles em 22/04/2026. Confirme no WhatsApp se ainda está valendo.';

    const msg =
      'Oi! Vim pelo site e montei o meu visual:\n' +
      '• Cabelo: ' + CABELOS[escolha.cabelo].nome + '\n' +
      '• Barba: ' + BARBAS[escolha.barba].nome + '\n' +
      (escolha.sobrancelha ? '• Sobrancelha\n' : '') +
      '\nQual horário vocês têm?';
    document.getElementById('btn-montado').href =
      'https://wa.me/5585996957764?text=' + encodeURIComponent(msg);
  }

  /* --- a navalha que varre a troca --- */
  let varrendo = null;
  function trocar() {
    if (suave) { pintar(); contar(); return; }

    if (varrendo) varrendo.kill();
    const largura = lamina.parentElement.offsetWidth;

    varrendo = gsap.timeline()
      .set(lamina, { x: 0, opacity: 0 })
      .to(lamina, { opacity: 1, duration: .1 })
      // o desenho só muda quando a lâmina está EM CIMA dele: é isso que faz
      // a troca parecer um corte, e não um piscar
      .to(lamina, { x: largura + 140, duration: .55, ease: 'power2.inOut', onUpdate() {
        if (this.progress() > .45 && !this.vars._feito) { this.vars._feito = true; pintar(); }
      } }, '<')
      .to(lamina, { opacity: 0, duration: .16 }, '-=.18');

    contar();
  }

  /* --- os botões --- */
  document.querySelectorAll('.opcao').forEach(btn => {
    btn.addEventListener('click', () => {
      const { grupo, valor } = btn.dataset;

      if (grupo === 'sobrancelha') {
        escolha.sobrancelha = !escolha.sobrancelha;
        btn.setAttribute('aria-pressed', String(escolha.sobrancelha));
      } else {
        if (escolha[grupo] === valor) return;
        escolha[grupo] = valor;
        document.querySelectorAll(`.opcao[data-grupo="${grupo}"]`).forEach(o => {
          o.setAttribute('aria-pressed', String(o.dataset.valor === valor));
        });
      }
      trocar();
    });
  });

  pintar();
  contar();
})();
