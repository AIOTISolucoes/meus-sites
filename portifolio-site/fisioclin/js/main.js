/* =========================================================================
   FISIOCLIN — animações

   Duas coisas são só deste cliente e estão no fim do arquivo:
   1. o cobogó do hero (canvas) — a fachada deles redesenhada, com a luz
      seguindo o ponteiro como o sol bate na parede de verdade;
   2. o guia "Por onde eu começo?" — o painel da fachada acende a
      especialidade indicada.
   ========================================================================= */

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   Atenção: o PC do usuário reporta reduce (animações do Windows desligadas),
   então é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animar = Boolean(window.gsap && window.ScrollTrigger);

// Animação é um aprimoramento: CDN indisponível não pode esconder a página
// nem impedir que o guia e os links de contato funcionem.
if (animar && !suave) {
gsap.registerPlugin(ScrollTrigger);
gsap.set('#intro', { display: 'grid' });
gsap.set('#nav', { yPercent: -110 });

/* ---------------------------------------------------------------- INTRO */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});

gsap.timeline()
  .to('#logo-intro .tr', {
    strokeDashoffset: 0,
    duration: 1.1,
    ease: 'power2.inOut',
    stagger: .24,
  })
  .to('#logo-intro .marca-nome', { opacity: 1, duration: .5 }, '-=.4')
  .to('#logo-intro .marca-sub', { opacity: 1, duration: .45 }, '-=.3')
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.4')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { yPercent: 0, duration: .6, ease: 'power3.out' }, '-=.35')
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
    delay: i * .09,
    scrollTrigger: { trigger: item, start: 'top 90%' },
  });
});

gsap.from('.casa-foto', {
  opacity: 0, y: 50, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.casa-foto', start: 'top 85%' },
});

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

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

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(122,74,52,.12)' : 'none',
      duration: .3,
    });
  },
});

window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* =========================================================================
   1. O COBOGÓ DO HERO

   A fachada da Fisioclin é um painel vazado de triângulos em relevo. Aqui ele
   é redesenhado numa grade: cada célula quadrada é cortada por uma diagonal
   (a orientação varia por posição) e vira dois triângulos que apontam para
   lados opostos.

   O relevo aparece por iluminação: para cada triângulo, o brilho é o quanto a
   sua "dobra" aponta para a luz. A luz é o ponteiro. É por isso que a parede
   parece girar quando o mouse anda — é o mesmo efeito do sol da tarde
   atravessando o brise.

   Custo: os triângulos são quantizados em poucos tons e desenhados agrupados,
   um path por tom. Um fill por triângulo derrubaria o quadro pela metade
   (lição do cabelo do Estúdio).
   ========================================================================= */

(function cobogoHero() {
  const cv = document.getElementById('fundo');
  if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: false });
  if (!ctx) return;

  const PASSO = 1000 / 60;      // passo de tempo fixo
  const NTONS = 12;
  const RAIO = 460;             // alcance da luz, em px de tela

  // sombra -> luz. Só estes tons são pintados, então o custo é ~12 fills.
  const TONS = (() => {
    // faixa larga de propósito: com a sombra em 231 o relevo mal aparecia e a
    // parede virava um papel de parede bege
    const a = [219, 207, 189], b = [255, 254, 252];
    return Array.from({ length: NTONS }, (_, i) => {
      const t = i / (NTONS - 1);
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
    });
  })();

  // as 4 orientações da diagonal; cada uma dá dois triângulos com normais
  // opostas. A normal é o lado pra onde a dobra "olha".
  const S = Math.SQRT1_2;
  const ORI = [
    { tri: [[0, 0, 1, 0, 0, 1], [1, 0, 1, 1, 0, 1]], n: [[-S, -S], [S, S]] },
    { tri: [[0, 0, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1]], n: [[S, -S], [-S, S]] },
    { tri: [[0, 0, 1, 0, 0, 1], [1, 0, 1, 1, 0, 1]], n: [[S, S], [-S, -S]] },
    { tri: [[0, 0, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1]], n: [[-S, S], [S, -S]] },
  ];

  let lado = 62, cols = 0, linhas = 0, celulas = [];
  let larg = 0, alt = 0, dpr = 1;

  // hash determinístico: a mesma parede em todo carregamento (e o mesmo
  // desenho no celular e no desktop)
  const hash = (i, j) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  function montar() {
    larg = cv.clientWidth;
    alt = cv.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(larg * dpr);
    cv.height = Math.round(alt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(larg / lado) + 1;
    linhas = Math.ceil(alt / lado) + 1;
    celulas = [];
    for (let j = 0; j < linhas; j++) {
      for (let i = 0; i < cols; i++) {
        const h = hash(i, j);
        celulas.push({
          x: i * lado,
          y: j * lado,
          o: Math.floor(h * 4) % 4,
          // variação fixa de tom: sem ela a parede fica com cara de piso
          v: (hash(i + 7, j + 3) - .5) * .13,
        });
      }
    }
  }

  // a luz persegue o ponteiro; sem isso ela salta e a parede pisca
  let luzX = 0, luzY = 0, alvoX = 0, alvoY = 0, temPonteiro = false;

  function reposicionarPadrao(t) {
    // sem ponteiro (ou em movimento reduzido) a luz passeia sozinha, devagar
    const v = suave ? .00012 : .00028;
    alvoX = larg * (.5 + .42 * Math.cos(t * v));
    alvoY = alt * (.42 + .3 * Math.sin(t * v * 1.35));
  }

  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    alvoX = e.clientX - r.left;
    alvoY = e.clientY - r.top;
    temPonteiro = true;
  }, { passive: true });

  cv.addEventListener('pointerleave', () => { temPonteiro = false; }, { passive: true });

  const buckets = Array.from({ length: NTONS }, () => []);

  function pintar() {
    ctx.fillStyle = '#f4efe7';
    ctx.fillRect(0, 0, larg, alt);

    for (const b of buckets) b.length = 0;

    for (const c of celulas) {
      const ori = ORI[c.o];
      const cx = c.x + lado / 2, cy = c.y + lado / 2;
      let dx = luzX - cx, dy = luzY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      dx /= dist; dy /= dist;
      const aten = 1 / (1 + (dist / RAIO) * (dist / RAIO));

      for (let t = 0; t < 2; t++) {
        const n = ori.n[t];
        const lambert = n[0] * dx + n[1] * dy;
        let b = .44 + .82 * lambert * aten + c.v;
        b = b < 0 ? 0 : b > 1 ? 1 : b;
        buckets[Math.round(b * (NTONS - 1))].push(c, t);
      }
    }

    // um path por tom: ~12 chamadas de fill no lugar de ~1200
    for (let k = 0; k < NTONS; k++) {
      const b = buckets[k];
      if (!b.length) continue;
      ctx.beginPath();
      for (let m = 0; m < b.length; m += 2) {
        const c = b[m], t = b[m + 1];
        const p = ORI[c.o].tri[t];
        ctx.moveTo(c.x + p[0] * lado, c.y + p[1] * lado);
        ctx.lineTo(c.x + p[2] * lado, c.y + p[3] * lado);
        ctx.lineTo(c.x + p[4] * lado, c.y + p[5] * lado);
        ctx.closePath();
      }
      ctx.fillStyle = TONS[k];
      ctx.fill();
    }

    // o vinco: a linha fina que separa os módulos, como a junta do painel real
    ctx.strokeStyle = 'rgba(122,74,52,.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= cols; i++) { ctx.moveTo(i * lado, 0); ctx.lineTo(i * lado, alt); }
    for (let j = 0; j <= linhas; j++) { ctx.moveTo(0, j * lado); ctx.lineTo(larg, j * lado); }
    ctx.stroke();
  }

  let acumulado = 0, anterior = 0, rodando = true, id = 0;
  let custo = 0, quadros = 0, jaAliviou = false;

  function quadro(agora) {
    id = requestAnimationFrame(quadro);
    if (!rodando) { anterior = agora; return; }

    // sem esta guarda, `agora` vem undefined na 1ª chamada, `acumulado` vira
    // NaN, o while nunca entra e a parede fica pintada porém CONGELADA — o
    // bug parece "não tem animação" e custa horas
    if (!Number.isFinite(anterior) || !Number.isFinite(agora)) { anterior = agora; return; }

    let dt = agora - anterior;
    anterior = agora;
    if (dt > 200) dt = 200;
    acumulado += dt;

    if (!temPonteiro || suave) reposicionarPadrao(agora);

    let mexeu = false;
    while (acumulado >= PASSO) {
      acumulado -= PASSO;
      // lerp de 0.06 por passo: ~10 quadros pra chegar. Direto no alvo faria
      // a parede piscar a cada tremida do mouse.
      luzX += (alvoX - luzX) * .06;
      luzY += (alvoY - luzY) * .06;
      mexeu = true;
    }
    if (!mexeu) return;

    const t0 = performance.now();
    pintar();
    custo += performance.now() - t0;

    // vigia: em aparelho fraco a célula cresce uma vez e a conta cai pela
    // metade. Medir FPS em headless engana (rasteriza por software), então o
    // número que vale é o tempo dentro do próprio callback.
    if (++quadros === 90) {
      if (!jaAliviou && custo / quadros > 7) {
        lado = 84;
        jaAliviou = true;
        montar();
      }
      custo = 0; quadros = 0;
    }
  }

  montar();
  luzX = alvoX = larg * .62;
  luzY = alvoY = alt * .38;
  pintar();

  // Visibilidade da aba e da seção são estados independentes. Ao voltar à
  // aba, o hero visível precisa retomar mesmo sem novo evento de interseção.
  let visivel = true;
  const atualizarVisibilidade = () => { rodando = visivel && !document.hidden; };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      visivel = es[0].isIntersecting;
      atualizarVisibilidade();
    }, { threshold: 0 }).observe(cv);
  }
  document.addEventListener('visibilitychange', atualizarVisibilidade);
  atualizarVisibilidade();

  let redim;
  window.addEventListener('resize', () => {
    clearTimeout(redim);
    redim = setTimeout(() => { montar(); pintar(); }, 160);
  });

  requestAnimationFrame(quadro);
})();

/* =========================================================================
   2. "POR ONDE EU COMEÇO?"

   Duas perguntas -> a especialidade em que aquele cuidado costuma começar,
   acesa no painel da fachada.

   O QUE ESTE BLOCO NÃO FAZ, de propósito: não pergunta sintoma, não devolve
   diagnóstico, não promete resultado e não fala em preço, horário ou número
   de sessões. É o encaminhamento que a recepção faria — e toda resposta
   termina lembrando que quem define o plano é a avaliação presencial (a
   ressalva está fixa no HTML, não dá pra esquecer dela).
   ========================================================================= */

(function guia() {
  const svg = document.getElementById('cobogo');
  const painelQuem = document.getElementById('quem');
  const painelOque = document.getElementById('oque');
  if (!svg || !painelQuem || !painelOque) return;

  const passo2 = document.getElementById('passo2');
  const caixa = document.getElementById('resultado');
  const elTitulo = document.getElementById('res-titulo');
  const elTexto = document.getElementById('res-texto');
  const elZap = document.getElementById('res-zap');
  const legenda = document.getElementById('legenda');

  const ZAP = 'https://wa.me/5585994118007?text=';

  /* --------- o painel: mesma parede do hero, agora em SVG --------- */

  const COLS = 9, LINHAS = 10, L = 100 / COLS, A = 106 / LINHAS;
  const NS = 'http://www.w3.org/2000/svg';
  const celulas = [];

  const hash = (i, j) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  // as 4 metades do quadrado. Com só duas (o que eu tinha antes) a parede
  // saía em faixas repetidas, cara de azulejo — a fachada real tem triângulo
  // apontando pros quatro cantos.
  const FORMAS = [
    [0, 0, 1, 0, 0, 1],   // canto superior esquerdo
    [0, 0, 1, 0, 1, 1],   // canto superior direito
    [1, 0, 1, 1, 0, 1],   // canto inferior direito
    [0, 0, 1, 1, 0, 1],   // canto inferior esquerdo
  ];

  for (let j = 0; j < LINHAS; j++) {
    for (let i = 0; i < COLS; i++) {
      const h = hash(i, j);
      const p = FORMAS[Math.floor(h * 4) % 4];
      const d = `M${(i + p[0]) * L} ${(j + p[1]) * A}L${(i + p[2]) * L} ${(j + p[3]) * A}L${(i + p[4]) * L} ${(j + p[5]) * A}Z`;

      const op0 = .45 + hash(i + 2, j + 8) * .55;
      const base = document.createElementNS(NS, 'path');
      base.setAttribute('d', d);
      base.setAttribute('class', 'cel cel-base');
      base.style.opacity = op0.toFixed(2);
      svg.appendChild(base);

      const luz = document.createElementNS(NS, 'path');
      luz.setAttribute('d', d);
      luz.setAttribute('class', 'cel cel-luz');
      svg.appendChild(luz);

      celulas.push({ luz, base, op0, cx: (i + .5) / COLS, cy: (j + .5) / LINHAS });
    }
  }

  // moldura: as juntas entre os módulos
  for (let i = 1; i < COLS; i++) {
    const l = document.createElementNS(NS, 'path');
    l.setAttribute('d', `M${i * L} 0V106`);
    l.setAttribute('class', 'cel-borda');
    svg.appendChild(l);
  }
  for (let j = 1; j < LINHAS; j++) {
    const l = document.createElementNS(NS, 'path');
    l.setAttribute('d', `M0 ${j * A}H100`);
    l.setAttribute('class', 'cel-borda');
    svg.appendChild(l);
  }

  /* --------- as especialidades e onde cada uma acende --------- */

  const ESP = {
    fisio:   { nome: 'Fisioterapia',        ancora: [.26, .60] },
    pilates: { nome: 'Pilates',             ancora: [.74, .72] },
    psico:   { nome: 'Psicologia',          ancora: [.22, .24] },
    fono:    { nome: 'Fonoaudiologia',      ancora: [.76, .22] },
    nutri:   { nome: 'Nutrição',            ancora: [.50, .88] },
    to:      { nome: 'Terapia Ocupacional', ancora: [.50, .46] },
  };

  function acender(chave) {
    const [ax, ay] = ESP[chave].ancora;
    for (const c of celulas) {
      const d = Math.hypot(c.cx - ax, c.cy - ay);
      // mancha que decai com a distância: a parede acende como uma luz
      // encostada nela, não como um retângulo selecionado
      const v = Math.max(0, 1 - d / .52);
      const f = Math.pow(v, 1.25);
      c.luz.style.opacity = f.toFixed(3);
      // o resto da parede recua um pouco: sem isso o verde aparecia, mas a
      // atenção não ia pra lá
      c.base.style.opacity = (c.op0 * (1 - f * .55)).toFixed(3);
      // as células fortes crescem de leve, como o módulo se abrindo
      c.luz.style.transform = f > .15 ? `scale(${(1 + f * .1).toFixed(3)})` : 'none';
    }
  }

  /* --------- o encaminhamento --------- */

  // (o que a pessoa busca) -> especialidade, com exceção por faixa de idade
  const REGRA = {
    movimento:   { padrao: 'fisio' },
    fala:        { padrao: 'fono' },
    emocional:   { padrao: 'psico' },
    alimentacao: { padrao: 'nutri' },
    autonomia:   { padrao: 'to' },
    // criança com queixa de postura não entra em turma de Pilates: começa na
    // fisioterapia, que é quem avalia
    postura:     { padrao: 'pilates', crianca: 'fisio' },
  };

  const TEXTO = {
    'fisio.crianca': 'Na criança, a fisioterapia acompanha marcos de movimento, postura e recuperação de lesões. A conversa começa pela rotina e pelo que a família observa em casa.',
    'fisio.adulto': 'A fisioterapia cuida de dor, lesão e limitação de movimento. É a avaliação que define se o trabalho vai ser manual, com exercício, ou os dois.',
    'fisio.idoso': 'Na pessoa idosa, o trabalho costuma girar em torno de dor, equilíbrio e segurança para andar — no ritmo de quem vai fazer.',
    'pilates.adulto': 'O Pilates trabalha força, postura e consciência corporal em turmas acompanhadas de perto. Quem chega com dor ou lesão costuma passar antes por uma avaliação de fisioterapia.',
    'pilates.idoso': 'O Pilates ajuda a manter força, equilíbrio e postura. Antes de entrar na turma, a avaliação confere o que faz sentido para o seu caso.',
    'psico.crianca': 'A psicologia infantil é uma das especialidades da casa. O primeiro encontro costuma ser com quem cuida, para entender o que está acontecendo.',
    'psico.adulto': 'A psicologia atende em consultório reservado, com horário combinado. O primeiro encontro serve para entender o que você procura.',
    'psico.idoso': 'A psicologia acompanha questões de humor, memória do dia a dia e as mudanças que chegam com a idade — com o tempo que a conversa pedir.',
    'fono.crianca': 'A fonoaudiologia infantil acompanha fala, linguagem e alimentação. A avaliação é o ponto de partida para saber o que fazer.',
    'fono.adulto': 'A fonoaudiologia cuida de fala, voz, linguagem e deglutição. A avaliação define o caminho.',
    'fono.idoso': 'Na pessoa idosa, a fonoaudiologia trabalha com frequência voz, fala e engolir com segurança.',
    'nutri.crianca': 'A nutrição infantil olha a rotina da casa inteira, não só o prato da criança.',
    'nutri.adulto': 'A nutrição monta a orientação a partir da sua rotina, do seu trabalho e do que você come de verdade.',
    'nutri.idoso': 'Na pessoa idosa, a nutrição costuma trabalhar junto com as outras especialidades da casa — o que se come muda força e disposição.',
    'to.crianca': 'A terapia ocupacional trabalha as atividades do dia a dia da criança: brincar, se vestir, a escola, a coordenação.',
    'to.adulto': 'A terapia ocupacional trabalha a autonomia nas tarefas do dia a dia e a volta às atividades que importam para você.',
    'to.idoso': 'A terapia ocupacional trabalha a autonomia em casa: banho, cozinha, escada — e a segurança em cada uma delas.',
  };

  const ROTULO = { crianca: 'uma criança', adulto: 'um adulto', idoso: 'uma pessoa idosa' };

  let quem = null, oque = null;
  const opcoesOque = painelOque.querySelectorAll('.opcao');
  opcoesOque.forEach(b => { b.disabled = true; });
  passo2.setAttribute('aria-disabled', 'true');

  function marcar(grupo, botao) {
    grupo.querySelectorAll('.opcao').forEach(b => b.setAttribute('aria-pressed', String(b === botao)));
  }

  function responder() {
    if (!quem || !oque) return;
    const regra = REGRA[oque];
    const chave = regra[quem] || regra.padrao;
    const esp = ESP[chave];

    acender(chave);

    elTitulo.textContent = esp.nome;
    elTexto.textContent = TEXTO[`${chave}.${quem}`] || TEXTO[`${chave}.adulto`];
    elZap.href = ZAP + encodeURIComponent(
      `Olá! Vim pelo site. Procuro atendimento de ${esp.nome} para ${ROTULO[quem]}. Podemos falar sobre agendamento?`
    );

    legenda.innerHTML = `<i></i><span><b>${esp.nome}</b> — acesa na parede.</span>`;

    if (caixa.hidden) {
      caixa.hidden = false;
      if (animar && !suave) gsap.from(caixa, { opacity: 0, y: 16, duration: .55, ease: 'power3.out' });
    }
  }

  painelQuem.addEventListener('click', e => {
    const b = e.target.closest('.opcao');
    if (!b) return;
    quem = b.dataset.quem;
    marcar(painelQuem, b);
    passo2.classList.remove('travado');
    passo2.setAttribute('aria-disabled', 'false');
    opcoesOque.forEach(opcao => { opcao.disabled = false; });
    responder();
  });

  painelOque.addEventListener('click', e => {
    const b = e.target.closest('.opcao');
    if (!b || !quem || b.disabled) return;
    oque = b.dataset.oque;
    marcar(painelOque, b);
    responder();
  });
})();
