/* =========================================================================
   Reserva Iguatemi Bosque — animações

   Do _modelo: intro, ícones, revelações, parallax, nav.
   Só deste cliente (no fim do arquivo): a ARARA — as fichas dos consultores
   se abrem na passagem do ponteiro, do jeito que a gente afasta cabide numa
   loja pra ver a peça de trás.
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. Aqui ele deixa a arara mais lenta e com menos
   amplitude — não desligada, porque a arara É a interação da página.
   O PC do usuário reporta reduce, então é ESTE o caminho que ele vê. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    stagger: .22,
  })
  .to('#logo-intro .marca-nome', { opacity: 1, duration: .5 }, '-=.35')
  .to('#logo-intro .marca-sub', { opacity: 1, duration: .45 }, '-=.28')
  .to('.intro-marca', { scale: .94, duration: .5, ease: 'power2.inOut' }, '+=.35')
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
  .from('.hero-foto', { opacity: 0, x: 40, duration: .9, ease: 'power3.out' }, '-=.8')
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
    delay: i * .12,
    scrollTrigger: { trigger: item, start: 'top 88%' },
  });
});

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

/* parallax: marcar o elemento com data-parallax="0.06" */
if (!suave) {
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const forca = parseFloat(el.dataset.parallax) || .06;
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
      boxShadow: self.progress > 0 ? '0 10px 30px rgba(80,50,30,.14)' : 'none',
      duration: .3,
    });
  },
});

window.addEventListener('load', () => ScrollTrigger.refresh());

/* =========================================================================
   A ARARA — seção-assinatura

   O gesto central de comprar roupa em loja física é passar a mão na arara e
   afastar os cabides. É isso: as fichas dos cinco consultores se abrem para
   os lados conforme o ponteiro passa entre elas, inclinando de leve porque
   estão penduradas por um gancho (transform-origin acima da ficha), e voltam
   ao lugar sozinhas.

   Não é canvas: são 5 elementos, então CSS transform + um rAF com
   interpolação resolve melhor e sem custo.
   ========================================================================= */

(function arara() {
  const palco = document.getElementById('rv-arara');
  const filtros = document.getElementById('rv-filtros');
  const nota = document.getElementById('rv-nota');
  const btnSorteio = document.getElementById('rv-tanto-faz');
  if (!palco) return;

  const fichas = [...palco.querySelectorAll('.ficha')];
  const RAIO = suave ? 130 : 190;        // alcance da "mão" em px
  const FORCA = suave ? 0.32 : 0.62;     // quanto a ficha chega a se afastar
  const APROX = 0.16;                    // o quanto anda por quadro rumo ao alvo

  const estado = fichas.map(() => ({ x: 0, alvo: 0, y: 0, alvoY: 0 }));
  const ponteiro = { x: 0, dentro: false };
  let rodando = false, visivel = true;

  const escolha = { procura: 'quero ver uma peça pra mim', entrega: 'passar na loja pra experimentar' };

  function linkDe(ficha) {
    const msg = `Oi, ${ficha.dataset.nome}! Vim pelo site da loja — ${escolha.procura}, e prefiro ${escolha.entrega}.`;
    return `https://wa.me/${ficha.dataset.zap}?text=${encodeURIComponent(msg)}`;
  }

  function atualizarLinks() {
    fichas.forEach(f => { f.href = linkDe(f); });
  }

  /* ---- física da arara ---- */

  function medirAlvos() {
    const caixa = palco.getBoundingClientRect();
    fichas.forEach((f, i) => {
      const r = f.getBoundingClientRect();
      // centro em repouso: desconta o deslocamento que já está aplicado
      const centro = r.left + r.width / 2 - caixa.left - estado[i].x;
      const d = ponteiro.x - centro;
      const dist = Math.abs(d);

      if (!ponteiro.dentro || dist > RAIO) {
        estado[i].alvo = 0;
        estado[i].alvoY = 0;
        return;
      }
      // empurra pro lado contrário ao ponteiro; quem está bem embaixo dele
      // sobe um pouco, como cabide que a gente levanta pra ver
      const peso = 1 - dist / RAIO;
      estado[i].alvo = -Math.sign(d || 1) * peso * RAIO * FORCA;
      estado[i].alvoY = dist < 70 ? -10 * peso : 0;
    });
  }

  function quadro() {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    if (!visivel) return;

    medirAlvos();

    let parado = true;
    fichas.forEach((f, i) => {
      const e = estado[i];
      e.x += (e.alvo - e.x) * (suave ? APROX * 0.55 : APROX);
      e.y += (e.alvoY - e.y) * (suave ? APROX * 0.55 : APROX);
      if (Math.abs(e.alvo - e.x) > 0.4 || Math.abs(e.alvoY - e.y) > 0.4) parado = false;
      // o giro sai do próprio deslocamento: pendurada no gancho, a ficha
      // inclina pro lado pra onde foi empurrada
      const giro = e.x * 0.035;
      f.style.transform = `translate3d(${e.x.toFixed(2)}px, ${e.y.toFixed(2)}px, 0) rotate(${giro.toFixed(2)}deg)`;
    });

    // nada se movendo e ponteiro fora: desliga o loop até a próxima passagem
    if (parado && !ponteiro.dentro) rodando = false;
  }

  function acorda() {
    if (rodando) return;
    rodando = true;
    requestAnimationFrame(quadro);   // sempre pelo rAF, nunca quadro() na mão
  }

  palco.addEventListener('pointermove', e => {
    // no celular a arara é uma faixa de arrasto: empurrar cabide com o dedo
    // atrapalharia o scroll horizontal
    if (e.pointerType === 'touch') return;
    ponteiro.x = e.clientX - palco.getBoundingClientRect().left;
    ponteiro.dentro = true;
    acorda();
  });
  palco.addEventListener('pointerleave', () => { ponteiro.dentro = false; acorda(); });

  new IntersectionObserver(es => {
    visivel = es[0].isIntersecting;
    if (visivel) acorda();
  }, { threshold: 0 }).observe(palco);

  document.addEventListener('visibilitychange', () => { visivel = !document.hidden; });

  /* ---- filtros: alimentam a mensagem que vai pro WhatsApp ---- */

  filtros.addEventListener('click', e => {
    const btn = e.target.closest('.op');
    if (!btn) return;
    const grupo = btn.closest('.opcoes').dataset.grupo;
    btn.closest('.opcoes').querySelectorAll('.op').forEach(b => {
      const eu = b === btn;
      b.classList.toggle('ativo', eu);
      b.setAttribute('aria-pressed', eu ? 'true' : 'false');
    });
    escolha[grupo] = btn.dataset.valor;
    atualizarLinks();
  });

  /* ---- "escolhe por mim": sorteia e MOSTRA quem saiu ----
     de propósito não abre o WhatsApp sozinho: abrir aba sem a pessoa ver
     quem foi escolhido é o tipo de surpresa que faz fechar o site. */

  btnSorteio.addEventListener('click', () => {
    const i = Math.floor(Math.random() * fichas.length);
    const f = fichas[i];

    fichas.forEach(o => o.classList.remove('sorteada'));
    f.classList.add('sorteada');
    f.scrollIntoView({ block: 'nearest', inline: 'center', behavior: suave ? 'auto' : 'smooth' });

    nota.innerHTML =
      `Saiu <strong>${f.dataset.nome}</strong> — todos atendem de tudo, então pode ir tranquilo. ` +
      `<a href="${linkDe(f)}" target="_blank" rel="noopener">Falar com ${f.dataset.nome} ↗</a>`;
  });

  atualizarLinks();
})();
