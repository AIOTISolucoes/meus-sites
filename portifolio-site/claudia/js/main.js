/* =========================================================================
   CLAUDIA ANDRADE — MASSOTERAPIA
   intro desenhada + ondas de alívio + mapa do corpo + respiração guiada
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

/* ------------------------------------------------- ONDAS DE ALÍVIO (hero)
   Linhas de contorno horizontais, como as curvas de nível de um mapa — só que
   aqui o "terreno" é tecido: cada linha é uma corda de pontos com mola e
   atrito, e os pontos conversam com os vizinhos, então a depressão feita pelo
   ponteiro se espalha pra lateral e volta devagar, como músculo cedendo à
   pressão da mão e retomando a forma.

   Canvas e não SVG porque são ~30 linhas × ~100 pontos redesenhadas todo
   quadro; com um <path> por linha o navegador reflui a árvore inteira. */

const tela = document.getElementById('ondas');
const ctx = tela && tela.getContext('2d');

if (ctx) (function ondasDeAlivio() {
  const TOQUE = window.matchMedia('(hover: none)').matches;

  // [cor, opacidade, espessura] — três degraus só, pra permitir agrupar o
  // traçado num único stroke() por degrau em vez de um por linha
  const DEGRAUS = [
    ['207,225,247', .11, .8],
    ['207,225,247', .2, 1.1],
    ['111,164,232', .34, 1.4],
  ];

  // tabela de seno: o sopro de repouso roda por ponto, e Math.sin nesse volume
  // vira o gargalo do quadro. A imprecisão não aparece num movimento orgânico.
  const TAU = Math.PI * 2, TAM = 2048;
  const SENO = new Float32Array(TAM);
  for (let i = 0; i < TAM; i++) SENO[i] = Math.sin((i / TAM) * TAU);
  const sen = a => SENO[(((a % TAU) + TAU) % TAU) * (TAM / TAU) | 0];

  const MOLA = .006;    // volta ao repouso: baixa de propósito, o alívio é lento
  const ATRITO = .972;  // sem isso a linha oscila feito corda de violão
  const TENSAO = .22;   // quanto o ponto arrasta os vizinhos (espalha a covinha)

  let L = 0, A = 0, linhas = [], grupos = [], px = 0, ponteiro = false;
  let alvoX = -9999, alvoY = -9999, atualX = -9999, atualY = -9999;
  let rodando = true, t = 0;

  function medir() {
    const r = tela.getBoundingClientRect();
    L = Math.max(1, r.width);
    A = Math.max(1, r.height);
    // teto no dpr: retina "pura" dobra o custo de pintura sem ganho visível
    const dpr = Math.min(window.devicePixelRatio || 1, L < 760 ? 1.5 : 2);
    tela.width = Math.round(L * dpr);
    tela.height = Math.round(A * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function semear() {
    // densidade por espaço (uma linha a cada ~30px), não por faixa de tela:
    // mantém a mesma leitura no celular e no monitor grande
    const qtd = Math.max(10, Math.min(34, Math.round(A / 30)));
    // os pontos passam da borda dos dois lados: a linha não pode "terminar"
    // dentro da tela, senão a ponta aparece quando alguém a empurra
    const n = Math.max(24, Math.min(110, Math.round(L / 18)));
    const passo = (L + 160) / (n - 1);
    const espaco = A / (qtd + 1);

    px = passo;
    linhas = [];
    for (let i = 0; i < qtd; i++) {
      // Curva de repouso: linha reta lê como listra de persiana. Todas as
      // linhas seguem o MESMO relevo, com a fase andando de uma pra outra —
      // é o que dá a leitura de curva de nível (ou de corpo deitado) em vez
      // de ondas soltas cada uma pro seu lado. Amplitude presa a uma fração
      // do espaçamento pra nenhuma linha encostar na vizinha.
      const repouso = new Float32Array(n);
      for (let j = 0; j < n; j++) {
        const x = -80 + j * passo;
        repouso[j] = Math.sin(x * .0042 + i * .34) * espaco * .42
                   + Math.sin(x * .0091 + i * .22 + 1.7) * espaco * .2;
      }

      linhas.push({
        base: espaco * (i + 1),
        repouso,
        // y guarda o DESLOCAMENTO em relação ao repouso, não a posição
        // absoluta: assim a mola e o acoplamento puxam de volta pra curva
        // original em vez de endireitar o relevo até virar listra de novo
        y: new Float32Array(n),
        v: new Float32Array(n),
        n,
        fase: i * .5,
        // as linhas do meio são as mais visíveis: é onde o olho cai primeiro
        grupo: i % 7 === 3 ? 2 : (i % 3 === 0 ? 1 : 0),
      });
    }

    grupos = DEGRAUS.map(([cor, op, larg]) => ({
      cor: `rgba(${cor},${op})`, larg, lista: [],
    }));
    for (const linha of linhas) grupos[linha.grupo].lista.push(linha);
    janelaIni = 0;
  }

  function fisica() {
    t += PASSO;

    // ponteiro com inércia: o empurrão vira pressão de mão, não teleporte
    atualX += (alvoX - atualX) * .16;
    atualY += (alvoY - atualY) * .16;

    const raio = L < 760 ? 120 : 175;
    const raio2 = raio * raio;
    const forca = suave ? 0 : (L < 760 ? 2.6 : 3.6);
    // O sopro é uma força por passo, e a mola (MOLA) devolve tudo: a amplitude
    // que aparece na tela é ~sopro/MOLA. Com valores "pequenos e seguros" isso
    // dava 0,27px — invisível, tela parada. Estes números valem ~6px de
    // ondulação (3px em movimento reduzido), que é o mínimo que se enxerga.
    const sopro = suave ? .019 : .037;
    const ritmo = suave ? .3 : .5;

    for (let k = 0; k < linhas.length; k++) {
      const linha = linhas[k];
      const { y, v, n, base, repouso } = linha;

      for (let i = 0; i < n; i++) {
        // acoplamento com os vizinhos: é o que faz a depressão ter borda macia
        // em vez de um degrau só no ponto empurrado
        const esq = i > 0 ? y[i - 1] : y[i];
        const dir = i < n - 1 ? y[i + 1] : y[i];
        v[i] += (esq + dir - 2 * y[i]) * TENSAO;

        // respiração de repouso: sem isso a tela fica morta quando ninguém
        // mexe o ponteiro (e no celular ninguém mexe)
        const x = -80 + i * px;
        v[i] += sen(t * ritmo + x * .006 + linha.fase) * sopro;

        v[i] -= y[i] * MOLA;
        v[i] *= ATRITO;
      }

      if (ponteiro) {
        for (let i = 0; i < n; i++) {
          const x = -80 + i * px;
          const dx = x - atualX;
          const dy = (base + repouso[i] + y[i]) - atualY;
          const d2 = dx * dx + dy * dy;
          if (d2 < raio2) {
            const cai = 1 - Math.sqrt(d2) / raio;
            // ao quadrado: a mão afunda o centro e apenas encosta na borda
            v[i] += cai * cai * forca;
          }
        }
      }

      for (let i = 0; i < n; i++) y[i] += v[i];
    }
  }

  function pintar() {
    ctx.clearRect(0, 0, L, A);
    for (let g = 0; g < grupos.length; g++) {
      const grupo = grupos[g];
      if (!grupo.lista.length) continue;

      ctx.beginPath();
      for (let k = 0; k < grupo.lista.length; k++) {
        const { y, n, base, repouso } = grupo.lista[k];
        const alt = i => base + repouso[i] + y[i];
        ctx.moveTo(-80, alt(0));
        // curva pelos pontos médios: sem isso aparecem quinas em cada ponto
        for (let i = 1; i < n - 1; i++) {
          const x = -80 + i * px;
          ctx.quadraticCurveTo(x, alt(i), x + px / 2, (alt(i) + alt(i + 1)) / 2);
        }
        ctx.lineTo(-80 + (n - 1) * px, alt(n - 1));
      }
      ctx.strokeStyle = grupo.cor;
      ctx.lineWidth = grupo.larg;
      ctx.stroke();
    }
  }

  // Passo de tempo fixo com acumulador: sem isso a física andaria junto com a
  // taxa de quadros — em tela de 120Hz a onda voltaria no dobro da velocidade,
  // e em máquina fraca viraria câmera lenta.
  const PASSO = 1 / 60;
  let ultimo = 0, acumulado = 0;

  function quadro(agora) {
    if (!rodando) return;
    // a 1ª chamada pode vir sem timestamp (se disparada na mão, e não pelo
    // rAF). Sem esta guarda `agora - ultimo` vira NaN, contamina o acumulador
    // e a física nunca mais roda: as linhas ficam pintadas, porém congeladas.
    if (!Number.isFinite(agora)) { requestAnimationFrame(quadro); return; }
    if (!ultimo) ultimo = agora;
    // teto de 100ms: ao voltar de outra aba, não despejar um tranco de física
    acumulado += Math.min((agora - ultimo) / 1000, .1);
    ultimo = agora;

    let voltas = 0;
    while (acumulado >= PASSO && voltas < 2) {
      fisica();
      acumulado -= PASSO;
      voltas++;
    }
    pintar();
    vigiar(agora);
    requestAnimationFrame(quadro);
  }

  // Aparelho fraco não avisa. Em vez de chutar uma densidade segura pra todo
  // mundo, começa cheio e vai tirando linha se o quadro não estiver fechando:
  // some o excesso sem ninguém perceber e quem tem máquina boa fica com tudo.
  let janelaIni = 0, janelaQtd = 0, cortes = 0, ruins = 0;
  function vigiar(agora) {
    if (cortes >= 2 || linhas.length <= 8) return;
    if (!janelaIni) { janelaIni = agora; janelaQtd = 0; return; }
    janelaQtd++;
    const dur = agora - janelaIni;
    if (dur < 1500) return;

    const fps = janelaQtd / (dur / 1000);
    janelaIni = agora;
    janelaQtd = 0;

    // limiar baixo de propósito: janela sem foco ou monitor em economia seguram
    // o quadro em 30fps sem que o site esteja pesado, e cortar aí seria
    // estragar o visual à toa
    if (fps < 26) {
      if (++ruins < 2) return;
      ruins = 0;
      linhas = linhas.filter((_, i) => i % 2 === 0);
      for (const g of grupos) g.lista.length = 0;
      for (const linha of linhas) grupos[linha.grupo].lista.push(linha);
      cortes++;
    } else {
      ruins = 0;
    }
  }

  function ligar() { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } }
  function desligar() { rodando = false; }

  medir();
  semear();
  requestAnimationFrame(quadro);

  // "Movimento reduzido" não é "tela congelada": quem liga isso quer menos
  // agitação, não um fundo morto. As ondas continuam respirando devagar, só
  // não reagem mais ao ponteiro — nada que persiga o cursor.
  if (!suave) {
    if (!TOQUE) {
      window.addEventListener('pointermove', e => {
        const r = tela.getBoundingClientRect();
        alvoX = e.clientX - r.left;
        alvoY = e.clientY - r.top;
        if (!ponteiro) { atualX = alvoX; atualY = alvoY; ponteiro = true; }
      }, { passive: true });
      window.addEventListener('pointerleave', () => { ponteiro = false; }, { passive: true });
    } else {
      // no celular o dedo passa rolando: afunda onde encostou e solta depois
      window.addEventListener('touchmove', e => {
        const p = e.touches[0];
        if (!p) return;
        const r = tela.getBoundingClientRect();
        alvoX = p.clientX - r.left;
        alvoY = p.clientY - r.top;
        if (!ponteiro) { atualX = alvoX; atualY = alvoY; ponteiro = true; }
      }, { passive: true });
      window.addEventListener('touchend', () => { ponteiro = false; }, { passive: true });
    }
  }

  // não gastar bateria com o hero fora da tela nem com a aba escondida
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? ligar() : desligar()),
      { threshold: 0 }).observe(tela);
  }
  document.addEventListener('visibilitychange', () => {
    document.hidden ? desligar() : ligar();
  });

  let atraso;
  window.addEventListener('resize', () => {
    clearTimeout(atraso);
    atraso = setTimeout(() => {
      const antes = L;
      medir();
      // no celular, rolar mostra/esconde a barra do navegador e dispara resize
      // à toa; refazer as linhas só quando a largura muda de verdade
      if (Math.abs(L - antes) > 2) semear();
    }, 180);
  }, { passive: true });
})();

/* ------------------------------------------------------- ÍCONES (serviços)
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

/* --------------------------------------------------------- ONDE DÓI (mapa)
   A pessoa aponta no corpo em vez de ler uma lista de serviços: a dúvida dela
   é "isso que eu sinto tem solução aqui?", não "quais técnicas existem". */

(function mapaDoCorpo() {
  const bloco = document.querySelector('.mapa-bloco');
  if (!bloco) return;

  const zonas = bloco.querySelectorAll('.zona');
  const paineis = bloco.querySelectorAll('[data-painel]');
  let atual = 'vazio';

  function mostrar(nome) {
    if (nome === atual) return;
    atual = nome;
    bloco.classList.add('escolhido');

    zonas.forEach(z => z.classList.toggle('ativa', z.dataset.zona === nome));
    paineis.forEach(p => { p.hidden = p.dataset.painel !== nome; });

    const alvo = bloco.querySelector(`[data-painel="${nome}"]`);
    if (!alvo) return;
    gsap.fromTo(alvo,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: .45, ease: 'power2.out' });
  }

  zonas.forEach(zona => {
    const nome = zona.dataset.zona;
    zona.addEventListener('click', () => mostrar(nome));
    // dá pra chegar pelo teclado: o SVG é a navegação inteira desta seção
    zona.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostrar(nome); }
    });
  });

  const corpo = bloco.querySelector('.mapa-corpo');
  gsap.from(corpo, {
    opacity: 0, y: 40, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: bloco, start: 'top 78%' },
  });
  gsap.from(bloco.querySelector('.mapa-painel'), {
    opacity: 0, y: 40, duration: 1, delay: .12, ease: 'power3.out',
    scrollTrigger: { trigger: bloco, start: 'top 78%' },
  });
})();

/* ------------------------------------------------------ COMO É A SESSÃO
   A linha da esquerda se preenche conforme a rolagem: o progresso do scroll
   é o progresso da própria sessão. */

if (document.querySelector('.passos')) {
  gsap.to('.trilha-cheia', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.passos',
      start: 'top 62%',
      end: 'bottom 80%',
      scrub: .6,
    },
  });

  gsap.utils.toArray('[data-passo]').forEach(passo => {
    ScrollTrigger.create({
      trigger: passo,
      start: 'top 68%',
      onEnter: () => passo.classList.add('aceso'),
      onLeaveBack: () => passo.classList.remove('aceso'),
    });
    gsap.from(passo, {
      opacity: 0, x: -24, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: passo, start: 'top 80%' },
    });
  });
}

/* ------------------------------------------------- GALERIA (scrubbing)
   A faixa horizontal anda conforme o scroll vertical: a seção fica presa na
   tela e o trilho desliza junto. No celular vira rolagem lateral com o dedo
   (CSS), porque prender a tela no toque atrapalha mais do que ajuda. */

const trilho = document.querySelector('.trilho-interno');
if (trilho && window.innerWidth > 760) {
  const percurso = () => trilho.scrollWidth - window.innerWidth;

  gsap.to(trilho, {
    x: () => -percurso(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#galeria',
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
        containerAnimation: gsap.getTweensOf(trilho)[0],
        start: 'left 92%',
      },
    });
  });
}

/* ------------------------------------------------------------- RESPIRE
   O círculo conduz o ritmo que ela pede no começo do atendimento: inspira em
   4s, segura 2s, solta em 6s. Aqui a animação não é enfeite, é o conteúdo da
   seção — por isso ela continua rodando em "movimento reduzido", só sem o
   halo pulsando junto. */

(function respiracao() {
  const respiro = document.getElementById('respiro');
  if (!respiro) return;

  const bola = respiro.querySelector('.bola');
  const halo = respiro.querySelector('.halo');
  const instrucao = respiro.querySelector('.instrucao');
  const contagem = document.getElementById('contagem');
  const CICLOS = 3;
  let volta = 0;

  const diz = txt => gsap.timeline()
    .to(instrucao, { opacity: 0, duration: .25 })
    .call(() => { instrucao.textContent = txt; })
    .to(instrucao, { opacity: 1, duration: .25 });

  const ciclo = gsap.timeline({ paused: true, repeat: CICLOS - 1 });
  ciclo
    .call(() => diz('inspire'))
    .to(bola, { scale: 1, duration: 4, ease: 'sine.inOut' }, 0)
    .to(halo, { opacity: suave ? 1 : .55, duration: 4 }, 0)
    .call(() => diz('segure'))
    .to({}, { duration: 2 })
    .call(() => diz('solte devagar'))
    .to(bola, { scale: .42, duration: 6, ease: 'sine.inOut' })
    .to(halo, { opacity: 1, duration: 6 }, '<')
    .to({}, { duration: .8 });

  ciclo.eventCallback('onRepeat', () => {
    volta++;
    contagem.textContent = `respiração ${Math.min(volta + 1, CICLOS)} de ${CICLOS}`;
  });
  ciclo.eventCallback('onComplete', () => {
    diz('pronto');
    contagem.textContent = 'percebeu o ombro descer?';
  });

  // só respira quando está na tela: rodar isso escondido gasta bateria à toa,
  // e quem chega na seção depois pega o ciclo pela metade
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (ciclo.progress() === 1 || !ciclo.isActive()) {
          volta = 0;
          contagem.textContent = `respiração 1 de ${CICLOS}`;
          ciclo.restart();
        }
      } else {
        ciclo.pause();
      }
    }, { threshold: .45 }).observe(respiro);
  } else {
    ciclo.play();
  }
})();

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
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(14,36,69,.12)' : 'none',
      duration: .3,
    });
  },
});

window.addEventListener('load', () => ScrollTrigger.refresh());
