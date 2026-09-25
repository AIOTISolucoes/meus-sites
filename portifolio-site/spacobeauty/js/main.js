/* =========================================================================
   SPAÇO BEAUTY
   intro desenhada + fios flutuando no hero + o olho que troca de técnica
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
    duration: 1.05,
    ease: 'power2.inOut',
    stagger: .18,
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

/* ------------------------------------------------------ FIOS NO HERO
   Extensão de cílios é feita fio a fio, então o fundo é literalmente isso:
   fios soltos vagando no ar. Cada um é uma lasca afilada (não um traço de
   espessura fixa — fio de cílio é grosso na base e fino na ponta), com deriva
   e giro próprios. O ponteiro os empurra pra longe e eles voltam a vagar. */

const tela = document.getElementById('fios');
const ctx = tela && tela.getContext('2d');

if (ctx) (function fiosSoltos() {
  const TOQUE = window.matchMedia('(hover: none)').matches;

  // três tons de castanho da marca; opacidade baixa pra não brigar com o texto
  // fio fino precisa de mais opacidade que lasca grossa pra continuar visível
  const TONS = ['rgba(74,42,12,.46)', 'rgba(138,90,48,.38)', 'rgba(42,22,8,.34)'];

  let L = 0, A = 0, fios = [], rodando = true;
  let alvoX = -9999, alvoY = -9999, atualX = -9999, atualY = -9999, ponteiro = false;

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
    // densidade por área, não por faixa de tela: mesma leitura no celular e no
    // monitor grande
    const qtd = Math.max(18, Math.min(52, Math.round((L * A) / 28000)));
    fios = [];
    for (let i = 0; i < qtd; i++) {
      const comp = 46 + Math.random() * 86;
      fios.push({
        x: Math.random() * L,
        y: Math.random() * A,
        // ângulo em torno de uma mesma diagonal: fio espalhado pra todo lado
        // vira confete/serragem. Concentrar a direção é o que faz o campo ler
        // como fibra caindo no ar.
        ang: -.75 + (Math.random() - .5) * 1.15,
        comp,
        // meia-espessura: o traço todo tem o dobro disso. Cílio é fino — com
        // 2px de meia-espessura a lasca já vira lasca de madeira.
        larg: .32 + comp * .0075,
        curva: .22 + Math.random() * .42,   // todos arqueiam pro mesmo lado
        vx: (Math.random() - .5) * .17,
        vy: -.05 - Math.random() * .13,     // sobem devagar, como pluma
        vang: (Math.random() - .5) * .0035,
        tom: (Math.random() * TONS.length) | 0,
      });
    }
    janelaIni = 0;
  }

  function fisica() {
    atualX += (alvoX - atualX) * .12;
    atualY += (alvoY - atualY) * .12;

    const raio = L < 760 ? 110 : 165;
    const raio2 = raio * raio;
    const empurrao = suave ? 0 : .55;
    const ritmo = suave ? .45 : 1;

    for (let i = 0; i < fios.length; i++) {
      const f = fios[i];
      f.x += f.vx * ritmo;
      f.y += f.vy * ritmo;
      f.ang += f.vang * ritmo;

      if (ponteiro && empurrao) {
        const dx = f.x - atualX, dy = f.y - atualY;
        const d2 = dx * dx + dy * dy;
        if (d2 < raio2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const cai = 1 - d / raio;
          f.x += (dx / d) * cai * cai * empurrao * 6;
          f.y += (dy / d) * cai * cai * empurrao * 6;
          f.ang += cai * .012;   // o fio também gira ao ser empurrado
        }
      }

      // dá a volta pela borda oposta: o campo nunca esvazia
      const m = 90;
      if (f.x < -m) f.x = L + m; else if (f.x > L + m) f.x = -m;
      if (f.y < -m) f.y = A + m; else if (f.y > A + m) f.y = -m;
    }
  }

  function pintar() {
    ctx.clearRect(0, 0, L, A);
    // um fill() por tom (e não por fio): com 90 fios seriam 90 chamadas
    for (let t = 0; t < TONS.length; t++) {
      ctx.beginPath();
      for (let i = 0; i < fios.length; i++) {
        const f = fios[i];
        if (f.tom !== t) continue;

        const cx = Math.cos(f.ang), cy = Math.sin(f.ang);
        const px = -cy, py = cx;                       // perpendicular
        const w = f.larg;
        const mx = f.x + cx * f.comp * .5 + px * f.curva * f.comp * .5;
        const my = f.y + cy * f.comp * .5 + py * f.curva * f.comp * .5;
        const tx = f.x + cx * f.comp, ty = f.y + cy * f.comp;

        // lasca: sobe por um lado até a ponta (largura zero) e volta pelo outro
        ctx.moveTo(f.x + px * w, f.y + py * w);
        ctx.quadraticCurveTo(mx + px * w * .45, my + py * w * .45, tx, ty);
        ctx.quadraticCurveTo(mx - px * w * .45, my - py * w * .45, f.x - px * w, f.y - py * w);
      }
      ctx.fillStyle = TONS[t];
      ctx.fill();
    }
  }

  const PASSO = 1 / 60;
  let ultimo = 0, acumulado = 0;

  function quadro(agora) {
    if (!rodando) return;
    // sem esta guarda, a 1ª chamada sem timestamp vira NaN no acumulador e a
    // física nunca roda: os fios ficam pintados, porém parados
    if (!Number.isFinite(agora)) { requestAnimationFrame(quadro); return; }
    if (!ultimo) ultimo = agora;
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

  // aparelho fraco não avisa: começa cheio e vai tirando fio se o quadro não
  // estiver fechando
  let janelaIni = 0, janelaQtd = 0, cortes = 0, ruins = 0;
  function vigiar(agora) {
    if (cortes >= 2 || fios.length <= 20) return;
    if (!janelaIni) { janelaIni = agora; janelaQtd = 0; return; }
    janelaQtd++;
    const dur = agora - janelaIni;
    if (dur < 1500) return;
    const fps = janelaQtd / (dur / 1000);
    janelaIni = agora; janelaQtd = 0;
    if (fps < 26) {
      if (++ruins < 2) return;
      ruins = 0;
      fios = fios.filter((_, i) => i % 2 === 0);
      cortes++;
    } else { ruins = 0; }
  }

  function ligar() { if (!rodando) { rodando = true; requestAnimationFrame(quadro); } }
  function desligar() { rodando = false; }

  medir();
  semear();
  requestAnimationFrame(quadro);

  if (!suave) {
    const alvo = (x, y) => {
      const r = tela.getBoundingClientRect();
      alvoX = x - r.left; alvoY = y - r.top;
      if (!ponteiro) { atualX = alvoX; atualY = alvoY; ponteiro = true; }
    };
    if (!TOQUE) {
      window.addEventListener('pointermove', e => alvo(e.clientX, e.clientY), { passive: true });
      window.addEventListener('pointerleave', () => { ponteiro = false; }, { passive: true });
    } else {
      window.addEventListener('touchmove', e => {
        const p = e.touches[0];
        if (p) alvo(p.clientX, p.clientY);
      }, { passive: true });
      window.addEventListener('touchend', () => { ponteiro = false; }, { passive: true });
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? ligar() : desligar()),
      { threshold: 0 }).observe(tela);
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
   O OLHAR — seção-assinatura

   A dúvida real de quem procura extensão de cílios não é "quais técnicas
   existem", é "como isso vai ficar no MEU olho". Então em vez de uma lista de
   nomes, os fios são desenhados de verdade sobre um olho: cada técnica tem sua
   própria curva de comprimento, inclinação e densidade ao longo da pálpebra.

   Os fios são gerados em código (e não desenhados à mão) porque é isso que
   permite que a diferença entre Fox Eyes e Volume Brasileiro seja a MESMA
   diferença que existe na cadeira: onde o comprimento cresce e pra onde o fio
   aponta.
   ========================================================================= */

(function oOlhar() {
  const svg = document.getElementById('olho');
  if (!svg) return;

  const alvoFios = document.getElementById('fios-cilios');
  const botoes = document.querySelectorAll('.tecnica');
  const elNome = document.getElementById('tec-nome');
  const elDesc = document.getElementById('tec-desc');
  const vivo = document.getElementById('olho-vivo');
  const iris = document.getElementById('iris');

  // a MESMA curva do path da pálpebra de cima no HTML: os fios nascem em cima
  // dela, não perto dela
  const P0 = [95, 168], P1 = [140, 92], P2 = [300, 78], P3 = [372, 140];

  const ponto = t => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0],
            a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1]];
  };
  const tangente = t => {
    const u = 1 - t, a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
    return [a * (P1[0] - P0[0]) + b * (P2[0] - P1[0]) + c * (P3[0] - P2[0]),
            a * (P1[1] - P0[1]) + b * (P2[1] - P1[1]) + c * (P3[1] - P2[1])];
  };
  const normaliza = v => {
    const m = Math.hypot(v[0], v[1]) || 1;
    return [v[0] / m, v[1] / m];
  };
  const gira = (v, a) => {
    const s = Math.sin(a), c = Math.cos(a);
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
  };
  // ruído estável: o mesmo fio tem sempre a mesma variação, senão o desenho
  // "treme" a cada troca de técnica
  const ruido = i => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  // t=0 é o canto de dentro (lacrimal), t=1 é o canto de fora
  const TECNICAS = {
    fox: {
      nome: 'Fox Eyes',
      desc: 'O canto de fora ganha comprimento e o olhar sobe. É o efeito puxado, de gatinho — alonga principalmente quem tem o olho mais redondo.',
      qtd: 36, larg: 2.1, cor: '#150b04', curl: .5,
      incl: t => .12 + .95 * t * t,
      comp: t => 20 + 52 * Math.pow(t, 1.7),
    },
    egipcio: {
      nome: 'Egípcio 5D',
      desc: 'Leques densos e fechados, montados fio a fio. É o olhar mais marcado da casa — para quem quer que apareça de longe.',
      qtd: 48, larg: 2.5, cor: '#100803', curl: .42, zigue: .06,
      incl: t => -.04 + .5 * t,
      comp: t => 38 + 26 * Math.sin(t * Math.PI * .92) + 16 * t,
    },
    brasileiro: {
      nome: 'Volume Brasileiro',
      desc: 'Fios em Y que se abrem e se cruzam. Enche sem pesar: fica fofo, com cara de cílio natural bonito, e é o mais confortável no dia a dia.',
      qtd: 56, larg: 1.5, cor: '#1a0e05', curl: .46, zigue: .17,
      incl: t => .04 + .42 * t,
      comp: t => 30 + 20 * Math.sin(t * Math.PI * .85) + 12 * t,
    },
    lifting: {
      nome: 'Lash lifting',
      desc: 'Sem extensão nenhuma: curva o seu próprio fio na raiz e levanta o olhar. Para quem já tem cílio e só quer abrir o olho.',
      qtd: 30, larg: 1.9, cor: '#241408', curl: .82,
      incl: t => -.1 + .3 * t,
      comp: t => 16 + 12 * Math.sin(t * Math.PI * .8) + 7 * t,
    },
    marrom: {
      nome: 'Fios marrom',
      desc: 'A mesma aplicação, em marrom no lugar do preto. Suaviza o contorno do olho — costuma cair bem em pele e cabelo mais claros.',
      qtd: 52, larg: 1.6, cor: '#5c3a1f', curl: .46, zigue: .15,
      incl: t => .04 + .42 * t,
      comp: t => 29 + 19 * Math.sin(t * Math.PI * .85) + 12 * t,
    },
  };

  function caminhos(est) {
    const saida = [];
    const passo = .88 / (est.qtd - 1);
    for (let i = 0; i < est.qtd; i++) {
      // fios perfeitamente espaçados viram pente. O deslocamento é sempre o
      // mesmo pro mesmo fio (ruído com semente), então o desenho não treme a
      // cada troca de técnica.
      const t = Math.min(.97, Math.max(.05,
        .08 + i * passo + (ruido(i + 31) - .5) * passo * .85));
      const b = ponto(t);
      const tg = tangente(t);
      const n = normaliza([tg[1], -tg[0]]);   // aponta pra fora da pálpebra

      const varia = i % 2 === 0 ? 1 : -1;
      const incl = est.incl(t) + (est.zigue || 0) * varia
                 + (ruido(i + 53) - .5) * .1;
      const d = gira(n, incl);
      const C = est.comp(t) * (.84 + .32 * ruido(i));

      const c = [b[0] + d[0] * C * .55, b[1] + d[1] * C * .55];
      const dp = gira(d, est.curl * (.85 + .3 * ruido(i + 77)));
      const p = [b[0] + dp[0] * C, b[1] + dp[1] * C];

      saida.push(`M${b[0].toFixed(1)} ${b[1].toFixed(1)} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`);
    }
    return saida;
  }

  function desenhar(chave) {
    const est = TECNICAS[chave];
    alvoFios.textContent = '';

    const paths = caminhos(est).map((d, i) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', d);
      el.setAttribute('stroke', est.cor);
      // a base do fio é mais grossa que a ponta: com stroke de espessura fixa
      // isso se compensa variando a espessura fio a fio
      el.setAttribute('stroke-width', (est.larg * (.82 + .36 * ruido(i + 7))).toFixed(2));
      alvoFios.appendChild(el);
      return el;
    });

    // cada fio se desenha da raiz pra ponta, na ordem em que seria aplicado
    paths.forEach(el => {
      const tam = el.getTotalLength();
      gsap.set(el, { strokeDasharray: tam, strokeDashoffset: tam });
    });
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: suave ? .5 : .34,
      ease: 'power2.out',
      stagger: suave ? .012 : .018,
    });
  }

  // o piscar esconde a troca: os fios somem e voltam com o olho fechado, então
  // não existe o instante feio em que um conjunto vira o outro
  function piscar(aoFechar) {
    const tl = gsap.timeline();
    tl.to(vivo, { scaleY: .06, duration: .13, ease: 'power2.in', svgOrigin: '234 150' })
      .add(() => { if (aoFechar) aoFechar(); })
      .to(vivo, { scaleY: 1, duration: .2, ease: 'power2.out', svgOrigin: '234 150' });
    return tl;
  }

  function trocar(chave) {
    const est = TECNICAS[chave];
    botoes.forEach(b => b.classList.toggle('ativa', b.dataset.tec === chave));
    piscar(() => {
      elNome.textContent = est.nome;
      elDesc.textContent = est.desc;
      desenhar(chave);
    });
  }

  botoes.forEach(b => b.addEventListener('click', () => trocar(b.dataset.tec)));

  // só desenha quando a seção aparece: o traçado é o espetáculo, e rodar isso
  // fora da tela desperdiça a primeira impressão
  let iniciado = false;
  const comecar = () => {
    if (iniciado) return;
    iniciado = true;
    desenhar('fox');

    // piscadas de vez em quando, com intervalo irregular (relógio certinho
    // entrega que é máquina)
    const agenda = () => {
      const espera = (suave ? 9 : 5) + Math.random() * 4;
      gsap.delayedCall(espera, () => { piscar(); agenda(); });
    };
    agenda();
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) comecar(); },
      { threshold: .3 }).observe(svg);
  } else {
    comecar();
  }

  // a íris acompanha o ponteiro de leve: é o detalhe que faz o desenho deixar
  // de ser ilustração e virar olhar
  if (!suave) {
    const secao = document.getElementById('olhar');
    secao.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      gsap.to(iris, {
        x: Math.max(-1, Math.min(1, dx)) * 15,
        y: Math.max(-1, Math.min(1, dy)) * 7,
        duration: .8,
        ease: 'power2.out',
      });
    }, { passive: true });
    secao.addEventListener('pointerleave', () => {
      gsap.to(iris, { x: 0, y: 0, duration: 1.1, ease: 'power2.out' });
    }, { passive: true });
  }
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

/* ------------------------------------------------- REVELAÇÕES DE SEÇÃO */

gsap.utils.toArray('.titulo-secao').forEach(tit => {
  gsap.from(tit, {
    opacity: 0, y: 46, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: tit, start: 'top 86%' },
  });
});

gsap.utils.toArray('[data-item]').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0, y: 30, duration: .8, ease: 'power3.out', delay: i * .14,
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
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(74,42,12,.12)' : 'none',
      duration: .3,
    });
  },
});

window.addEventListener('load', () => ScrollTrigger.refresh());
