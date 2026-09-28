(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('force-motion');

  // Âncoras com rolagem suave em JS. `scroll-behavior: smooth` no CSS faz o
  // ScrollTrigger.refresh() medir errado quando a página não está no topo.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!link || !hash || hash.length < 2 || link.classList.contains('skip')) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', hash);
  });

  /* ---------- Menu ---------- */
  const nav = document.querySelector('#nav');
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuBtn.innerHTML = `<i class="ph-bold ph-${open ? 'x' : 'list'}" aria-hidden="true"></i>`;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('a')?.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Poste de barbeiro: gira com a rolagem e marca o progresso ---------- */
  const root = document.documentElement;
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    const max = Math.max(1, root.scrollHeight - innerHeight);
    root.style.setProperty('--progress', (scrollY / max).toFixed(4));
    if (!reduce) root.style.setProperty('--pole', ((scrollY * 0.35) % 60).toFixed(2));
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Cartão do bento: vira para mostrar o antes ---------- */
  const card = document.querySelector('[data-flip]');
  const flipBtn = card?.querySelector('.hc-toggle');
  flipBtn?.addEventListener('click', () => {
    const on = !card.classList.contains('flipped');
    card.classList.toggle('flipped', on);
    flipBtn.setAttribute('aria-pressed', String(on));
    flipBtn.querySelector('span').textContent = on ? 'Ver como ele saiu' : 'Ver como ele chegou';
    card.querySelector('[data-flip-label]').textContent = on ? 'Antes' : 'Depois';
  });

  /* ---------- O kit do Tio: foco de luz de ferramenta em ferramenta ---------- */
  // Posições medidas na imagem (fração da largura e da altura) e raio do foco.
  const TOOLS = [
    { name: 'Máquina', desc: 'O degradê começa aqui.', x: .176, y: .332, r: .13 },
    { name: 'Navalha', desc: 'Contorno e acabamento, linha por linha.', x: .384, y: .293, r: .13 },
    { name: 'Tesoura', desc: 'O topo no detalhe, sem pressa.', x: .596, y: .332, r: .12 },
    { name: 'Pente', desc: 'Divide, levanta e mede antes de cortar.', x: .785, y: .352, r: .11 },
    { name: 'Pincel', desc: 'Espuma no ponto para a navalha deslizar.', x: .221, y: .762, r: .11 },
    { name: 'Borrifador', desc: 'Cabelo úmido, corte preciso.', x: .466, y: .762, r: .12 },
    { name: 'Escova de nuca', desc: 'Tira os fiozinhos antes do espelho.', x: .758, y: .781, r: .12 }
  ];
  const kit = document.querySelector('[data-kit]');
  const kitList = document.querySelector('.kit-list');
  const kitName = document.querySelector('[data-kit-name]');
  const kitDesc = document.querySelector('[data-kit-desc]');
  const kitCount = document.querySelector('[data-kit-count]');
  let tool = -1;
  const kitButtons = TOOLS.map((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t.name;
    b.setAttribute('aria-pressed', 'false');
    b.dataset.tool = String(i);
    b.addEventListener('click', () => setTool(i));
    kitList.append(b);
    return b;
  });
  const setTool = (i, instant = false) => {
    if (i === tool) return;
    tool = i;
    const t = TOOLS[i];
    const radius = kit.clientWidth * t.r;
    const to = { '--x': `${(t.x * 100).toFixed(2)}%`, '--y': `${(t.y * 100).toFixed(2)}%`, '--r': `${radius.toFixed(1)}px` };
    kit.classList.add('lit');
    if (window.gsap && !reduce && !instant) window.gsap.to(kit, { ...to, duration: .7, ease: 'expo.out', overwrite: true });
    else Object.entries(to).forEach(([k, v]) => kit.style.setProperty(k, v));
    kitName.textContent = t.name;
    kitDesc.textContent = t.desc;
    kitCount.textContent = `${i + 1} de ${TOOLS.length}`;
    kitButtons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  };
  // Tocar na foto acende a ferramenta mais próxima.
  kit.addEventListener('click', event => {
    const r = kit.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width, y = (event.clientY - r.top) / r.height;
    let best = 0, dist = Infinity;
    TOOLS.forEach((t, i) => { const d = Math.hypot((t.x - x) * 1.5, t.y - y); if (d < dist) { dist = d; best = i; } });
    setTool(best);
  });
  new ResizeObserver(() => { if (tool >= 0) kit.style.setProperty('--r', `${(kit.clientWidth * TOOLS[tool].r).toFixed(1)}px`); }).observe(kit);
  setTool(0, true);
  // A rolagem só troca a ferramenta quando entra num novo trecho; assim uma
  // escolha feita no toque não é desfeita pelo menor movimento da página.
  let scrollTool = 0;
  const toolFromScroll = progress => {
    const i = Math.min(TOOLS.length - 1, Math.floor(progress * TOOLS.length));
    if (i !== scrollTool) { scrollTool = i; setTool(i); }
  };
  window.TioMil = { ...(window.TioMil || {}), setTool, getTool: () => tool };

  /* ---------- Texto que acende palavra por palavra ---------- */
  const scrub = document.querySelector('[data-scrub]');
  const words = [];
  if (scrub) {
    const parts = scrub.textContent.trim().split(/\s+/);
    scrub.textContent = '';
    parts.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      scrub.append(span, i < parts.length - 1 ? ' ' : '');
      words.push(span);
    });
  }
  const lightWords = p => {
    const n = words.length;
    words.forEach((w, i) => {
      const local = Math.min(1, Math.max(0, p * (n + 4) - i) / 4);
      w.style.setProperty('--o', (0.16 + 0.84 * local).toFixed(3));
    });
  };

  /* ---------- Antes e depois: a máquina passa e os fios caem ---------- */
  const compare = document.querySelector('[data-compare]');
  const range = compare.querySelector('.c-range');
  const canvas = compare.querySelector('.c-hair');
  const ctx = canvas.getContext('2d');
  const hairs = [];
  let hairRAF = 0;
  let pos = 0;
  const sizeCanvas = () => {
    const r = compare.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(sizeCanvas).observe(compare);
  const TONES = ['rgba(52,50,48,.9)', 'rgba(96,92,88,.85)', 'rgba(150,146,140,.8)', 'rgba(30,28,26,.9)'];
  const spawn = (fromPct, toPct) => {
    if (reduce) return;
    const r = compare.getBoundingClientRect();
    const steps = Math.min(26, Math.ceil(Math.abs(toPct - fromPct) * 2.2));
    for (let i = 0; i < steps; i += 1) {
      const pct = fromPct + (toPct - fromPct) * (i / Math.max(1, steps));
      hairs.push({
        x: r.width * pct / 100 + (Math.random() - .5) * 6,
        y: r.height * (0.08 + Math.random() * 0.5),
        vx: (Math.random() - .5) * 1.4 + Math.sign(toPct - fromPct) * 0.6,
        vy: -Math.random() * 1.2,
        len: 6 + Math.random() * 12,
        a: Math.random() * Math.PI,
        va: (Math.random() - .5) * 0.2,
        bend: (Math.random() - .5) * 8,
        c: TONES[(Math.random() * TONES.length) | 0]
      });
    }
    if (hairs.length > 260) hairs.splice(0, hairs.length - 260);
    if (!hairRAF) hairRAF = requestAnimationFrame(drawHair);
  };
  const drawHair = () => {
    const w = canvas.width, h = canvas.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    ctx.clearRect(0, 0, w / dpr, h / dpr);
    for (let i = hairs.length - 1; i >= 0; i -= 1) {
      const p = hairs[i];
      p.vy += 0.16; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.a += p.va;
      if (p.y > h / dpr + 20) { hairs.splice(i, 1); continue; }
      const dx = Math.cos(p.a) * p.len / 2, dy = Math.sin(p.a) * p.len / 2;
      ctx.strokeStyle = p.c; ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(p.x - dx, p.y - dy);
      ctx.quadraticCurveTo(p.x + p.bend * Math.sin(p.a), p.y + p.bend * Math.cos(p.a), p.x + dx, p.y + dy);
      ctx.stroke();
    }
    hairRAF = hairs.length ? requestAnimationFrame(drawHair) : 0;
  };
  const setPos = (value, withHair = true) => {
    const next = Math.max(0, Math.min(100, value));
    if (withHair && Math.abs(next - pos) > 0.15) spawn(pos, next);
    pos = next;
    compare.style.setProperty('--pos', next.toFixed(2));
    compare.style.setProperty('--tag-depois', Math.min(1, next / 18).toFixed(3));
    compare.style.setProperty('--tag-antes', Math.min(1, (100 - next) / 18).toFixed(3));
    range.value = String(Math.round(next));
    range.setAttribute('aria-valuetext', `${Math.round(next)}% do depois à mostra`);
  };
  // Quem mexe na linha manda: por um instante a rolagem não move a máquina
  // (focar o controle rola a página, e o scrub continuaria andando sozinho).
  let manualAt = 0;
  let intro = null;                       // passada automática do celular
  const manual = () => { manualAt = performance.now(); intro?.kill(); intro = null; };
  ['focus', 'pointerdown', 'keydown', 'input'].forEach(type => range.addEventListener(type, manual));
  range.addEventListener('input', () => setPos(Number(range.value)));
  window.TioMil = { ...(window.TioMil || {}), setPos, getPos: () => pos };
  setPos(reduce ? 50 : 0, false);
  if (reduce) lightWords(1);

  /* ---------- Movimento (GSAP) ---------- */
  const startMotion = () => {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) { setPos(50, false); lightWords(1); return; }
    if (reduce) return;
    gsap.registerPlugin(ST);

    gsap.from('.hero h1 .line', { yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 });
    gsap.fromTo('.hero-img', { scale: 1.14 }, { scale: 1.04, duration: 2.4, ease: 'expo.out' });
    gsap.to('.hero-media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-word', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    // A cadeira acompanha o mouse de leve (só com mouse de verdade).
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hx = gsap.quickTo('.hero-img', 'x', { duration: 1.2, ease: 'expo.out' });
      const hy = gsap.quickTo('.hero-img', 'y', { duration: 1.2, ease: 'expo.out' });
      document.querySelector('.hero').addEventListener('pointermove', e => { hx((e.clientX / innerWidth - .5) * -26); hy((e.clientY / innerHeight - .5) * -16); });
    }

    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', () => {
      // A seção fica presa; a rolagem vira a passada da máquina.
      ST.create({
        trigger: '.compare-sec', start: 'top top', end: '+=150%', pin: true, scrub: .5,
        onUpdate: self => {
          lightWords(Math.min(1, self.progress * 1.25));
          if (performance.now() - manualAt > 1200) setPos(self.progress * 100);
        }
      });
      // Os pins são criados na ordem da página: o ScrollTrigger calcula cada um
      // somando o espaço dos anteriores (fora de ordem, o ritual e o kit se sobrepõem).
      // O kit fica preso e a rolagem passa o foco pelas sete ferramentas.
      ST.create({ trigger: '.kit', start: 'top top', end: '+=210%', pin: true, onUpdate: self => toolFromScroll(self.progress) });
      // O ritual anda de lado; cada desenho é traçado quando o cartão entra.
      const track = document.querySelector('.ritual-track');
      const distance = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: '.ritual', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: .6, invalidateOnRefresh: true } });
      document.querySelectorAll('.step').forEach(step => {
        const paths = step.querySelectorAll('.step-art path');
        paths.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
        gsap.to(paths, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 85%', end: 'center 55%', scrub: true } });
        const img = step.querySelector('.step-img');
        if (img) gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });
    mm.add('(max-width: 860px)', () => {
      ST.create({ trigger: '.kit-figure', start: 'top 70%', end: 'bottom 15%', onUpdate: self => toolFromScroll(self.progress) });
      ST.create({ trigger: '.compare-copy', start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: self => lightWords(self.progress) });
      ST.create({
        trigger: '.compare', start: 'top 70%', once: true,
        onEnter: () => {
          if (performance.now() - manualAt < 1200) return;
          const o = { v: pos };
          intro = gsap.to(o, { v: 62, duration: 1.8, ease: 'power2.inOut', onUpdate: () => setPos(o.v) });
        }
      });
      document.querySelectorAll('.step').forEach(step => {
        const paths = step.querySelectorAll('.step-art path');
        paths.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
        gsap.to(paths, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: step, start: 'top 85%', end: 'center 60%', scrub: true } });
        const img = step.querySelector('.step-img');
        if (img) gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });

    // A faixa de slogans acelera (e inverte) com a velocidade da rolagem.
    const track = document.querySelector('.marquee-track');
    track.style.animation = 'none';
    const loop = gsap.to(track, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
    let settle = 0;
    ST.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: self => {
      const v = self.getVelocity();
      gsap.to(loop, { timeScale: (v < 0 ? -1 : 1) * Math.min(6, 1 + Math.abs(v) / 400), duration: .2, overwrite: true });
      clearTimeout(settle);
      settle = setTimeout(() => gsap.to(loop, { timeScale: loop.timeScale() < 0 ? -1 : 1, duration: .8, overwrite: true }), 140);
    } });

    gsap.utils.toArray('.b-card').forEach((c, i) => {
      gsap.from(c, { scale: .94, opacity: .35, y: 30, duration: 1, ease: 'expo.out', delay: (i % 3) * .06, scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
    });
    gsap.fromTo('.b-photo img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.b-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.where-seal', { rotate: -120, ease: 'none', scrollTrigger: { trigger: '.where', start: 'top bottom', end: 'bottom top', scrub: true } });

    let lastHeight = document.body.scrollHeight; let refreshTimer = 0;
    new ResizeObserver(() => {
      const height = document.body.scrollHeight;
      if (Math.abs(height - lastHeight) < 2) return;
      lastHeight = height;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { ST.refresh(); lastHeight = document.body.scrollHeight; }, 120);
    }).observe(document.body);
  };
  if (document.readyState === 'complete') startMotion(); else addEventListener('load', startMotion, { once: true });

  /* ---------- Opção de movimento para quem usa "reduzir movimento" ---------- */
  (() => {
    const osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!osReduce) return;
    const forced = document.documentElement.classList.contains('force-motion');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'motion-optin';
    button.textContent = forced ? 'Reduzir animações' : 'Ativar animações';
    button.addEventListener('click', () => {
      try { forced ? localStorage.removeItem('motion-optin') : localStorage.setItem('motion-optin', '1'); } catch (e) { /* sem storage: usa a URL */ }
      const url = new URL(location.href);
      url.searchParams.set('motion', forced ? '0' : '1');
      location.replace(url);
    });
    (forced ? document.querySelector('.footer') : document.body).append(button);
    if (forced) button.classList.add('in-footer');
  })();
})();
