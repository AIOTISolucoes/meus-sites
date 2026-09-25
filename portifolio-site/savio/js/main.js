/* =========================================================================
   SÁVIO BARBEARIA — animações

   Estrutura: intro · ícones · trilho · revelações · e no fim a seção-
   assinatura deste cliente (o quiz "verdade ou mito").
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   ⚠️ O PC do usuário reporta reduce (animações do Windows desligadas), então
   é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   O selo CARIMBA: vem grande, torto, e assenta. Não pode se desenhar traço a
   traço — é uma mancha com vazados num path só (o fill-rule="evenodd" exige
   disco e buracos juntos), e em contorno o barbudo viraria rabisco.

   ⚠️ fromTo, não from: o path nasce com opacity:0 no CSS, e um
   .from({opacity:0}) animaria de 0 PARA 0 — a marca nunca apareceria. */

gsap.timeline()
  .fromTo('#marca-intro .meio',
    { opacity: 0, scale: 1.4, rotate: 12, transformOrigin: '50% 50%' },
    { opacity: 1, scale: 1, rotate: 0, duration: .95, ease: 'power4.out' })
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.5')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', { yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1 }, '-=.45')
  .from('#inicio .etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', { opacity: 0, y: 22, duration: .7, stagger: .1 }, '-=.55')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

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

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(0,0,0,.4)' : 'none',
      duration: .3,
    });
  },
});

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());

/* =========================================================================
   A SEÇÃO-ASSINATURA: VERDADE OU MITO

   A Sávio já faz quiz e mata-mata nos reels dela ("VERDADE x MITO",
   "FRESCURA x CUIDADO"). Esta seção é o formato DELA virado coisa clicável.

   ⚠️ Nada aqui é parecer médico. As seis afirmações são crenças populares
   de barbearia, e as respostas ficam no terreno do "o que se observa", nunca
   no do diagnóstico. Queda de cabelo e couro cabeludo saem daqui direto pro
   dermatologista — está escrito na tela, embaixo do quiz.
   ========================================================================= */

(() => {
  const carta = document.getElementById('carta');
  if (!carta) return;

  const CARTAS = [
    {
      pergunta: 'Raspar a cabeça faz o cabelo nascer mais forte.',
      certo: 'mito',
      resposta: 'O fio raspado volta com a ponta reta, e ponta reta parece mais ' +
                'grossa ao toque. O que nasce embaixo da pele continua o mesmo — ' +
                'raspar não muda a raiz.',
    },
    {
      pergunta: 'Aparar as pontas faz o cabelo crescer mais rápido.',
      certo: 'mito',
      resposta: 'O cabelo cresce na raiz, não na ponta. Aparar tira o fio quebrado ' +
                'e faz o corte durar mais bonito, que já é motivo de sobra — mas a ' +
                'velocidade não muda.',
    },
    {
      pergunta: 'Usar boné todo dia causa calvície.',
      certo: 'mito',
      resposta: 'Boné não causa calvície. O que ele faz é achatar o cabelo e ' +
                'segurar suor, o que pede lavagem mais caprichada. Queda de cabelo ' +
                'é outro assunto, e quem avalia é dermatologista.',
    },
    {
      pergunta: 'Água muito quente atrapalha no dia a dia do cabelo.',
      certo: 'verdade',
      resposta: 'Água muito quente resseca fio e couro cabeludo. Morna resolve ' +
                'igual e trata melhor — é o que a gente faz na lavagem aqui.',
    },
    {
      pergunta: 'Barba cresce mais rápido se você raspar sempre.',
      certo: 'mito',
      resposta: 'Mesma história do cabelo: quem manda é o folículo, não a lâmina. ' +
                'O que muda de verdade é o desenho — barba aparada com frequência ' +
                'fica mais cheia à vista.',
    },
    {
      pergunta: 'Dormir de cabelo molhado é problema.',
      certo: 'verdade',
      resposta: 'Fio molhado é fio mais frágil, e a noite inteira amassado no ' +
                'travesseiro marca e quebra. Secar antes de deitar já resolve.',
    },
  ];

  const elPergunta = document.getElementById('pergunta');
  const elVeredito = document.getElementById('veredito');
  const elResposta = document.getElementById('resposta');
  const elAcerto = document.getElementById('acerto');
  const elPlacarCarta = document.getElementById('placar-carta');
  const elPlacarAcertos = document.getElementById('placar-acertos');
  const btnProxima = document.getElementById('proxima');
  const btnFim = document.getElementById('btn-quiz');

  let i = 0;
  let acertos = 0;

  function mostrar() {
    elPergunta.textContent = CARTAS[i].pergunta;
    elPlacarCarta.textContent = `${i + 1}/${CARTAS.length}`;
    carta.classList.remove('virada');
  }

  function responder(escolha) {
    const c = CARTAS[i];
    const acertou = escolha === c.certo;
    if (acertou) {
      acertos++;
      elPlacarAcertos.textContent = acertos;
    }
    elAcerto.textContent = acertou ? 'você acertou' : 'quase';
    elVeredito.textContent = c.certo === 'verdade' ? 'Verdade' : 'Mito';
    elVeredito.className = 'carta-veredito ' + c.certo;
    elResposta.textContent = c.resposta;
    btnProxima.textContent = i === CARTAS.length - 1 ? 'Ver o resultado' : 'Próxima';
    carta.classList.add('virada');
  }

  function proxima() {
    if (i === CARTAS.length - 1) {
      // fim: a carta vira o convite, com o placar dentro da mensagem
      elAcerto.textContent = 'fim do quiz';
      elVeredito.textContent = `${acertos} de ${CARTAS.length}`;
      elVeredito.className = 'carta-veredito';
      elResposta.textContent = acertos >= 5
        ? 'Você já sabe das coisas. Vem cortar com quem também sabe.'
        : 'Se ficou dúvida, a gente resolve na cadeira — é onde essa conversa acaba mesmo.';
      btnProxima.textContent = 'Jogar de novo';
      btnProxima.onclick = () => { i = 0; acertos = 0; elPlacarAcertos.textContent = '0'; btnProxima.onclick = proxima; mostrar(); };

      const msg = `Oi! Vim pelo site e fiz o quiz de verdade ou mito — acertei ${acertos} de ${CARTAS.length}.\n\n` +
                  'Queria marcar um horário. Qual vocês têm?';
      btnFim.href = 'https://wa.me/5585985075395?text=' + encodeURIComponent(msg);
      return;
    }
    i++;
    mostrar();
  }

  document.querySelectorAll('.carta-botoes button').forEach(btn => {
    btn.addEventListener('click', () => responder(btn.dataset.resposta));
  });
  btnProxima.onclick = proxima;

  mostrar();
})();
