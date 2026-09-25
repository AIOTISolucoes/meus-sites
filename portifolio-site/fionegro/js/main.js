/* =========================================================================
   [[CLIENTE]] — animações

   Este arquivo traz só o que se repete em TODO site de cliente. A seção
   inventada pra este cliente (o momento que ninguém mais tem) entra no fim,
   onde está marcado.
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   Atenção: o PC do usuário reporta reduce (animações do Windows desligadas),
   então é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   A logo do cliente se desenhando traço a traço. Todo path com class="tr"
   entra na conta, então dá pra trocar o desenho sem mexer aqui. */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});

gsap.timeline()
  .to('#logo-intro .tr', {
    strokeDashoffset: 0,
    duration: 1.15,
    ease: 'power2.inOut',
    stagger: .28,
  })
  .to('#logo-intro .marca-nome', { opacity: 1, duration: .5 }, '-=.4')
  .to('#logo-intro .marca-sub', { opacity: 1, duration: .45 }, '-=.3')
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.4')
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

/* ------------------------------------------------------- ÍCONES (cards)
   Cada traço do ícone se desenha quando o card entra na tela. */

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

/* --------------------------------------------------- TRILHO HORIZONTAL
   A faixa de fotos anda conforme o scroll vertical: a seção fica presa na
   tela e o trilho desliza junto. No celular vira arrasto com o dedo (é CSS,
   ver .trilho no estilo.css) — prender a tela no toque atrapalha mais do que
   ajuda. */

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

/* parallax opcional: marcar o elemento com data-parallax="0.14" */
if (!suave) {
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const forca = parseFloat(el.dataset.parallax) || .12;
    const img = el.querySelector('img') || el;
    gsap.fromTo(img,
      { yPercent: -forca * 100 },
      {
        yPercent: forca * 100,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
  });
}

/* nav ganha sombra ao sair do topo */
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(20,40,70,.12)' : 'none',
      duration: .3,
    });
  },
});

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());

/* =========================================================================
   DAQUI PRA BAIXO: A SEÇÃO-ASSINATURA DESTE CLIENTE

   É o pedaço que NÃO se copia — é o que faz o site não parecer modelo.
   Já feitos: cabelo com física de cordinha que desvia do ponteiro (Estúdio),
   mapa do corpo clicável (Claudia), tesoura que corta a página no scroll
   (Sabtec), abelha voando (Colmeia).

   Se for canvas animado, o COMO-FAZER.md tem a lista de armadilhas que já
   custaram tempo (passo de tempo fixo, agrupar strokes, amplitude/mola,
   pausar fora da tela). Ler ANTES de escrever.
   ========================================================================= */
