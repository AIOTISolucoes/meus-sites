/* =========================================================================
   DRUMMER BARBEARIA — animações
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   Atenção: o PC do usuário reporta reduce (animações do Windows desligadas),
   então é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   A marca deles é um wordmark dentro de uma moldura. Então a moldura se
   desenha primeiro e as letras sobem de dentro dela — é a ordem em que a
   marca se monta, não um efeito solto. */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});

gsap.timeline()
  .to('#logo-intro .tr', { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' })
  .from('#logo-intro .marca-nome', { y: 62, duration: .75, ease: 'power3.out' }, '-=.2')
  .from('#logo-intro .marca-sub', { y: 34, opacity: 0, duration: .6, ease: 'power3.out' }, '-=.5')
  .to('.intro-marca', { scale: .95, duration: .45, ease: 'power2.inOut' }, '+=.35')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', {
    yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1,
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

gsap.utils.toArray('[data-item]').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0, y: 14, duration: .6, ease: 'power3.out',
    delay: i * .07,
    scrollTrigger: { trigger: item, start: 'top 92%' },
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
      boxShadow: self.progress > 0 ? '0 10px 26px rgba(13,13,13,.12)' : 'none',
      duration: .3,
    });
  },
});

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());


/* =========================================================================
   HERO — O PRATO DE BATERIA

   As luminárias da barbearia são pratos de bateria (dá pra ver nas fotos
   assets/salao-pratos.jpg e barbeiro-pratos.jpg), e o nome da casa é Drummer.
   Então o fundo do hero é um prato visto de cima: os sulcos concêntricos do
   latão. O ponteiro BATE e ele vibra — ondas que saem do ponto da batida,
   atravessam os sulcos e morrem.

   Armadilhas já pagas (COMO-FAZER.md) respeitadas aqui: passo de tempo fixo
   com guarda de Number.isFinite, UM stroke pra todos os anéis (um por anel
   derruba o quadro), pausa fora da tela e no visibilitychange, e vigia de FPS
   que rareia os sulcos sozinho em aparelho fraco.
   ========================================================================= */

(function heroPrato() {
  const cv = document.getElementById('fundo');
  if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: true });

  const VELOCIDADE = 380;   // px/s que a onda percorre pelo prato
  const LARGURA = 190;      // espessura da frente de onda, em px
  const TEMPO_ONDA = 2.2;   // segundos até a batida sumir
  const SEG = 40;           // pontos por anel

  let larg = 0, alt = 0, dpr = 1;
  let passoAnel = 11;
  let cx = 0, cy = 0, raioMax = 0, aneis = [];
  let ondas = [];
  let raf = null, anterior = null, acumulado = 0;
  let visivel = true, naTela = true;

  const PASSO = 1 / 60;

  function montar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    larg = cv.clientWidth;
    alt = cv.clientHeight;
    if (!larg || !alt) return;

    cv.width = Math.round(larg * dpr);
    cv.height = Math.round(alt * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // o centro do prato fica à DIREITA: à esquerda mora o texto do hero
    cx = larg * 0.72;
    cy = alt * 0.46;

    raioMax = Math.max(
      Math.hypot(cx, cy), Math.hypot(larg - cx, cy),
      Math.hypot(cx, alt - cy), Math.hypot(larg - cx, alt - cy)) + 20;

    aneis = [];
    for (let r = 26; r < raioMax; r += passoAnel) aneis.push(r);
  }

  function bater(x, y, forca) {
    ondas.push({ x, y, idade: 0, forca, fase: Math.random() * 6.2832 });
    if (ondas.length > 14) ondas.shift();
  }

  function fisica(dt) {
    for (let i = ondas.length - 1; i >= 0; i--) {
      ondas[i].idade += dt;
      if (ondas[i].idade > TEMPO_ONDA) ondas.splice(i, 1);
    }
  }

  /* deslocamento do sulco num ponto: soma das ondas vivas. O sulco não anda
     junto com a onda inteira — só a FRENTE dela empurra, por isso o
     envelope gaussiano em volta do raio da frente. */
  function desloc(px, py, ang) {
    let d = 0;
    for (let i = 0; i < ondas.length; i++) {
      const o = ondas[i];
      const dist = Math.hypot(px - o.x, py - o.y);
      const frente = VELOCIDADE * o.idade;
      const e = (dist - frente) / LARGURA;
      if (e < -3 || e > 3) continue;
      const env = Math.exp(-e * e);
      const decai = 1 - o.idade / TEMPO_ONDA;
      // o prato de verdade não vibra igual em toda volta: o termo azimutal é
      // o que tira a cara de sonar
      const az = 1 + 0.3 * Math.cos(2 * ang + o.fase);
      d += o.forca * env * decai * decai * az * Math.cos(e * 3.1);
    }
    return d;
  }

  function desenhar() {
    ctx.clearRect(0, 0, larg, alt);

    // a cúpula do prato, no centro
    const cupula = ctx.createRadialGradient(cx - 14, cy - 16, 4, cx, cy, 120);
    cupula.addColorStop(0, 'rgba(217,164,78,.16)');
    cupula.addColorStop(1, 'rgba(217,164,78,0)');
    ctx.fillStyle = cupula;
    ctx.fillRect(cx - 130, cy - 130, 260, 260);

    // UM path com todos os anéis: um stroke por anel derruba o quadro
    ctx.beginPath();
    for (let i = 0; i < aneis.length; i++) {
      const r0 = aneis[i];
      for (let s = 0; s <= SEG; s++) {
        const ang = (s / SEG) * 6.2832;
        const cosA = Math.cos(ang), sinA = Math.sin(ang);
        const px = cx + cosA * r0, py = cy + sinA * r0;
        const r = ondas.length ? r0 + desloc(px, py, ang) : r0;
        const x = cx + cosA * r, y = cy + sinA * r;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    }
    ctx.lineWidth = 1;
    // a .13 os sulcos apareciam, mas a DEFORMAÇÃO da batida não: o que se vê
    // é a curva do anel entortando, e isso precisa de traço legível
    ctx.strokeStyle = 'rgba(217, 164, 78, .2)';
    ctx.stroke();
  }

  /* vigia de FPS: medir FPS em headless engana (rasteriza por software); o
     número confiável é o tempo DENTRO do callback */
  let amostras = 0, somaMs = 0, jaRareou = false;
  function medir(ms) {
    if (jaRareou || amostras > 90) return;
    somaMs += ms; amostras++;
    if (amostras === 90 && somaMs / 90 > 7) {
      jaRareou = true;
      passoAnel = Math.round(passoAnel * 1.8);
      montar();
    }
  }

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

  let ultimaBatida = 0, ux = null, uy = null;
  const palco = cv.parentElement;

  palco.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const agora = performance.now();
    if (ux !== null && agora - ultimaBatida > 150) {
      // batida mais forte quanto mais rápido o ponteiro passou
      const v = Math.min(Math.hypot(x - ux, y - uy) / 6, 9);
      if (v > 0.8) { bater(x, y, 3 + v); ultimaBatida = agora; }
    }
    ux = x; uy = y;
  });
  palco.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    bater(e.clientX - r.left, e.clientY - r.top, 26);
  });
  palco.addEventListener('pointerleave', () => { ux = null; uy = null; });

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
    temporizador = setTimeout(montar, 180);
  });

  montar();
  ligar();
  // uma batida de boas-vindas: sem ela o prato nasce parado e ninguém
  // descobre que ele reage. É uma vez só, não é animação que se repete.
  setTimeout(() => bater(cx, cy, 30), 1400);
})();


/* =========================================================================
   SEÇÃO-ASSINATURA — MONTAR O COMBO

   A pergunta real de quem vai à barbearia é "quanto vai dar". A Drummer
   publica a tabela inteira na página de agendamento dela, então dá pra
   responder isso ANTES da pessoa sentar na cadeira.

   ⚠️ Os valores abaixo são os da tabela pública deles (schedweb.com.br).
   Se a barbearia mudar a tabela, é AQUI e no index.html que se mexe — e
   também no agente `drummer_barbearia` do agents.yaml.
   ========================================================================= */

(function montarCombo() {
  const palco = document.querySelector('.combo-palco');
  if (!palco) return;

  const PRECOS = { corte: 35, barba: 30, sobrancelha: 10, acabamento: 10 };
  const NOMES = { corte: 'Corte', barba: 'Barba', sobrancelha: 'Sobrancelha', acabamento: 'Acabamento' };

  /* Os combos publicados. Repare que só existem para Degradê, Social e
     Na tesoura — Navalhado e Kids NÃO aparecem em combo nenhum na tabela
     deles, então nesses dois o valor é a soma. Não inventar desconto. */
  const COMBOS = [
    { itens: ['corte', 'barba'], valor: 60 },
    { itens: ['corte', 'barba', 'sobrancelha'], valor: 70 },
    { itens: ['corte', 'sobrancelha'], valor: 45 },
    { itens: ['barba', 'sobrancelha', 'acabamento'], valor: 50 },
  ];
  const CORTES_EM_COMBO = ['Degradê', 'Social', 'Na tesoura'];

  const pratos = [...palco.querySelectorAll('.prato')];
  const opsCorte = [...palco.querySelectorAll('.corte-op')];
  const elLista = document.getElementById('combo-lista');
  const elValor = document.getElementById('combo-valor');
  const elSelo = document.getElementById('combo-selo');

  let corte = 'Degradê';

  const dinheiro = v => 'R$ ' + v.toFixed(2).replace('.', ',');

  function selecionados() {
    return pratos.filter(b => b.getAttribute('aria-pressed') === 'true')
                 .map(b => b.dataset.svcId);
  }

  function comboDe(sel) {
    if (sel.includes('corte') && !CORTES_EM_COMBO.includes(corte)) return null;
    return COMBOS.find(c =>
      c.itens.length === sel.length && c.itens.every(i => sel.includes(i))) || null;
  }

  function recalcular() {
    const sel = selecionados();
    elLista.innerHTML = '';

    if (!sel.length) {
      const li = document.createElement('li');
      li.className = 'vazio';
      li.textContent = 'Bata num prato pra começar a montar.';
      elLista.appendChild(li);
      elValor.textContent = dinheiro(0);
      elSelo.hidden = true;
      return;
    }

    let soma = 0;
    ['corte', 'barba', 'sobrancelha', 'acabamento'].forEach(id => {
      if (!sel.includes(id)) return;
      soma += PRECOS[id];
      const li = document.createElement('li');
      const nome = document.createElement('span');
      nome.textContent = id === 'corte' ? `Corte ${corte.toLowerCase()}` : NOMES[id];
      const val = document.createElement('span');
      val.textContent = dinheiro(PRECOS[id]);
      li.append(nome, val);
      elLista.appendChild(li);
    });

    const combo = comboDe(sel);
    const total = combo ? combo.valor : soma;
    elValor.textContent = dinheiro(total);

    const economia = combo ? soma - combo.valor : 0;
    if (economia > 0) {
      elSelo.textContent = `Combo da casa · economiza ${dinheiro(economia)}`;
      elSelo.hidden = false;
    } else if (combo) {
      elSelo.textContent = 'Combo da casa';
      elSelo.hidden = false;
    } else if (sel.includes('corte') && !CORTES_EM_COMBO.includes(corte) && sel.length > 1) {
      // honestidade: a tabela deles não traz combo pra estes dois
      elSelo.textContent = `${corte} não entra nos combos da tabela · valor somado`;
      elSelo.hidden = false;
    } else {
      elSelo.hidden = true;
    }
  }

  pratos.forEach(b => {
    b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      if (!suave) {
        b.classList.remove('batido');
        void b.offsetWidth;          // reinicia a animação: sem isto, o 2º
        b.classList.add('batido');   // clique seguido não toca a onda
      }
      recalcular();
    });
    b.addEventListener('animationend', () => b.classList.remove('batido'));
  });

  opsCorte.forEach(op => {
    op.addEventListener('click', () => {
      corte = op.dataset.corte;
      opsCorte.forEach(o => o.classList.toggle('ativo', o === op));
      // escolher um corte liga o prato do corte: ninguém escolhe "Navalhado"
      // querendo dizer "sem corte"
      const pCorte = pratos.find(p => p.dataset.svcId === 'corte');
      pCorte.setAttribute('aria-pressed', 'true');
      recalcular();
    });
  });

  recalcular();
})();
