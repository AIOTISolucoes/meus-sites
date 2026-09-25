/* =========================================================================
   ELO BARBEARIA — animações

   Estrutura: intro · ícones · trilho · revelações · e no fim a seção-
   assinatura deste cliente (o visagismo).
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   ⚠️ O PC do usuário reporta reduce (animações do Windows desligadas), então
   é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   O selo CARIMBA: gira um pouco, vem grande e assenta. Ele não pode se
   desenhar traço a traço — é uma mancha cheia com vazados, num path só (o
   fill-rule="evenodd" exige disco e buracos no mesmo path), e em contorno
   viraria rabisco. Carimbar é o gesto certo pra um selo.

   ⚠️ fromTo, não from: o path nasce com opacity:0 no CSS, e um
   .from({opacity:0}) animaria de 0 PARA 0 — a marca nunca apareceria. */

gsap.timeline()
  .fromTo('#marca-intro .meio',
    { opacity: 0, scale: 1.35, rotate: -14, transformOrigin: '50% 50%' },
    { opacity: 1, scale: 1, rotate: 0, duration: .95, ease: 'power4.out' })
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.5')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', { yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1 }, '-=.45')
  .from('#inicio .etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', { opacity: 0, y: 22, duration: .7, stagger: .1 }, '-=.55')
  .from('.hero-foto', { opacity: 0, y: 40, scale: .97, duration: 1, ease: 'power3.out' }, '-=.9')
  .from('.hero-selo', { opacity: 0, scale: .5, rotate: -40, duration: .7, ease: 'back.out(1.7)' }, '-=.4')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

/* o selo do hero gira devagar enquanto a página rola: é o carimbo da casa
   acompanhando a leitura, não um enfeite que se mexe sozinho */
if (!suave) {
  gsap.to('.hero-selo svg', {
    rotate: 120,
    ease: 'none',
    scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: 1 },
  });
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

gsap.from('.horarios li', {
  opacity: 0, x: -22, duration: .7, ease: 'power3.out', stagger: .1,
  scrollTrigger: { trigger: '.horarios', start: 'top 88%' },
});

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(20,21,15,.12)' : 'none',
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
   A SEÇÃO-ASSINATURA: O VISAGISMO

   A Elo se apresenta como "especialistas em imagem masculina", e visagismo é
   o que a separa das outras. Visagismo começa numa pergunta simples — qual o
   formato do seu rosto — e é essa pergunta que a seção põe na mão de quem
   está olhando.

   ⚠️ O texto abaixo é PRINCÍPIO GERAL de visagismo, não diagnóstico. O site
   diz isso com todas as letras, e o agente tem a mesma regra: quem olha o
   rosto da pessoa é o barbeiro, na cadeira.
   ========================================================================= */

(() => {
  const svg = document.getElementById('rosto-svg');
  if (!svg) return;

  const FORMATOS = {
    oval: {
      nome: 'Rosto oval',
      texto: 'É o formato que o visagismo usa como referência: a testa e o queixo ' +
             'já estão equilibrados. Por isso quase tudo funciona — e a escolha passa ' +
             'a ser sobre o que você quer transmitir, não sobre o que precisa corrigir.',
      itens: [
        'Aceita franja, topete e lateral baixa sem desequilibrar',
        'Dá pra ousar em textura e comprimento',
        'Cuidado só com volume excessivo nas laterais',
      ],
    },
    redondo: {
      nome: 'Rosto redondo',
      texto: 'A largura e a altura são parecidas, e as linhas são macias. O visagismo ' +
             'costuma buscar altura no topo e lateral mais fechada, pra que o olho leia ' +
             'o rosto como mais comprido do que largo.',
      itens: [
        'Volume em cima: topete, pompadour, quiff',
        'Laterais baixas ou degradê, pra afinar',
        'Evitar franja reta e volume nas laterais',
        'Barba mais cheia no queixo ajuda a alongar',
      ],
    },
    quadrado: {
      nome: 'Rosto quadrado',
      texto: 'Mandíbula marcada e testa larga — o rosto já tem estrutura. O visagismo ' +
             'costuma trabalhar a favor disso, com textura no topo em vez de mais ' +
             'ângulo, pra não endurecer o conjunto.',
      itens: [
        'Textura e movimento no topo, sem rigidez',
        'Laterais médias suavizam o ângulo da mandíbula',
        'Barba curta e alinhada mantém o traço sem pesar',
        'Evitar corte muito reto e milimétrico',
      ],
    },
    alongado: {
      nome: 'Rosto alongado',
      texto: 'O rosto é mais comprido que largo. Aqui o visagismo faz o contrário do ' +
             'rosto redondo: menos altura no topo e mais presença nas laterais, pra ' +
             'equilibrar a proporção.',
      itens: [
        'Pouca altura no topo — nada de topete alto',
        'Laterais com mais volume, não raspadas',
        'Franja lateral encurta visualmente a testa',
        'Barba com volume nos lados fecha a proporção',
      ],
    },
    triangular: {
      nome: 'Rosto triangular',
      texto: 'Testa mais larga e queixo mais estreito. O visagismo costuma buscar ' +
             'peso na parte de baixo e leveza em cima, pra equilibrar o que o olho ' +
             'lê primeiro.',
      itens: [
        'Volume moderado no topo, sem alargar a testa',
        'Laterais com corpo na altura da mandíbula',
        'Barba é uma grande aliada: dá peso ao queixo',
        'Evitar laterais muito raspadas com topo cheio',
      ],
    },
  };

  const legenda = document.getElementById('palco-legenda');
  const titulo = document.getElementById('leitura-titulo');
  const texto = document.getElementById('leitura-texto');
  const lista = document.getElementById('leitura-lista');
  const botao = document.getElementById('btn-visagismo');
  let atual = 'oval';

  function pintar() {
    const f = FORMATOS[atual];

    svg.querySelectorAll('.contorno, .cabelo').forEach(p => {
      p.style.opacity = p.dataset.forma === atual ? '' : 0;
    });
    // a opacidade "cheia" de cada peça vem do CSS: aqui só se limpa o inline
    svg.querySelectorAll(`.contorno[data-forma="${atual}"]`).forEach(p => { p.style.opacity = 1; });
    svg.querySelectorAll(`.cabelo[data-forma="${atual}"]`).forEach(p => { p.style.opacity = .9; });

    legenda.textContent = f.nome.toLowerCase();
    titulo.textContent = f.nome;
    texto.textContent = f.texto;
    lista.innerHTML = f.itens.map(i => `<li>${i}</li>`).join('');

    const msg =
      'Olá! Vim pelo site da Elo.\n' +
      `Acho que meu rosto é ${f.nome.replace('Rosto ', '').toLowerCase()}.\n\n` +
      'Queria marcar um corte com visagismo — qual horário vocês têm?';
    botao.href = 'https://wa.me/5585997360006?text=' + encodeURIComponent(msg);
  }

  document.querySelectorAll('.formato').forEach(btn => {
    btn.addEventListener('click', () => {
      if (atual === btn.dataset.forma) return;
      atual = btn.dataset.forma;
      document.querySelectorAll('.formato').forEach(o => {
        o.setAttribute('aria-pressed', String(o === btn));
      });
      pintar();
      if (!suave) {
        gsap.fromTo(`#rosto-svg .contorno[data-forma="${atual}"], #rosto-svg .cabelo[data-forma="${atual}"]`,
          { scale: .94, transformOrigin: '50% 50%' },
          { scale: 1, duration: .5, ease: 'power3.out' });
        gsap.fromTo('.leitura h3, .leitura p, .leitura li',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: .45, ease: 'power2.out', stagger: .04 });
      }
    });
  });

  pintar();
})();
