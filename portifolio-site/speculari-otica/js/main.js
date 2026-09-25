(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Menu ---------- */
  const nav = document.querySelector('#nav');
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('a')?.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Hero: lente de foco ---------- */
  const hero = document.querySelector('.hero');
  const focus = document.querySelector('[data-focus]');
  const ticks = focus.querySelector('.ticks');
  const coordX = document.querySelector('[data-coords]');
  const coordY = document.querySelector('[data-coords-y]');
  const toggle = document.querySelector('[data-motion-toggle]');
  for (let i = 0; i < 72; i += 1) {
    const angle = (i / 72) * Math.PI * 2;
    const inner = i % 6 === 0 ? 84 : 89;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 100 + Math.cos(angle) * inner);
    line.setAttribute('y1', 100 + Math.sin(angle) * inner);
    line.setAttribute('x2', 100 + Math.cos(angle) * 94);
    line.setAttribute('y2', 100 + Math.sin(angle) * 94);
    ticks.append(line);
  }

  const state = { x: .64, y: .5, tx: .64, ty: .5, pointerAt: 0, visible: true, paused: false };
  const baseRadius = () => (innerWidth < 760 ? 30 : 17);
  let t0 = performance.now();

  const frame = now => {
    const idle = now - state.pointerAt > 2200;
    if (idle && !state.paused) {
      const t = (now - t0) / 1000;
      state.tx = .62 + Math.sin(t * .23) * .14;
      state.ty = .5 + Math.sin(t * .31 + 1) * .12;
    }
    state.x = lerp(state.x, state.tx, .08);
    state.y = lerp(state.y, state.ty, .08);
    // Rolar a página "puxa o foco": o círculo cresce até a imagem inteira ficar nítida.
    const progress = clamp(scrollY / (hero.offsetHeight * .8), 0, 1);
    const radius = baseRadius() + progress * progress * 95;
    focus.style.setProperty('--x', `${(state.x * 100).toFixed(2)}%`);
    focus.style.setProperty('--y', `${(state.y * 100).toFixed(2)}%`);
    focus.style.setProperty('--r', `${radius.toFixed(2)}vmax`);
    coordX.textContent = `x ${state.x.toFixed(2)}`;
    coordY.textContent = `y ${state.y.toFixed(2)}`;
    if (state.visible) requestAnimationFrame(frame);
  };

  if (!reduce) {
    const move = event => {
      const rect = hero.getBoundingClientRect();
      state.tx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      state.ty = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      state.pointerAt = performance.now();
    };
    hero.addEventListener(finePointer ? 'pointermove' : 'pointerdown', move);
    if (!finePointer) hero.addEventListener('touchmove', event => move(event.touches[0]), { passive: true });
    new IntersectionObserver(entries => {
      const wasVisible = state.visible;
      state.visible = entries[0].isIntersecting && !document.hidden;
      if (state.visible && !wasVisible) requestAnimationFrame(frame);
    }).observe(hero);
    toggle.addEventListener('click', () => {
      state.paused = !state.paused;
      hero.classList.toggle('paused', state.paused);
      toggle.setAttribute('aria-pressed', String(!state.paused));
      toggle.textContent = state.paused ? 'Ativar foco automático' : 'Pausar foco automático';
    });
    requestAnimationFrame(frame);
  } else {
    toggle.hidden = true;
  }

  /* ---------- Estúdio: formato, presença, material ---------- */
  const form = document.querySelector('#studio-form');
  const art = document.querySelector('[data-frame]');
  const lenses = art.querySelectorAll('.lens');
  const presence = document.querySelector('#presence');
  const presenceOut = document.querySelector('#presence-out');
  const caption = document.querySelector('[data-caption]');
  const message = document.querySelector('#studio-message');
  const cta = document.querySelector('#studio-cta');
  const levels = ['bem discreta', 'discreta', 'equilibrada', 'marcante', 'bem marcante'];
  let lastShape = 'round';

  const update = () => {
    const use = form.elements.use.value;
    const shapeInput = form.querySelector('input[name="shape"]:checked');
    const materialInput = form.querySelector('input[name="material"]:checked');
    const shape = shapeInput.value;
    const level = levels[Number(presence.value) - 1];
    lenses.forEach(lens => lens.setAttribute('href', `#lens-${shape}`));
    art.dataset.shape = shape;
    art.dataset.tone = materialInput.dataset.tone;
    art.dataset.use = use;
    art.style.setProperty('--stroke', (materialInput.dataset.tone === 'gold' ? 1.6 : 2.6) + (Number(presence.value) - 1) * (materialInput.dataset.tone === 'gold' ? .7 : 2.1));
    if (shape !== lastShape && !reduce) {
      art.classList.remove('draw'); void art.getBoundingClientRect(); art.classList.add('draw');
    }
    lastShape = shape;
    presenceOut.textContent = level;
    const label = shapeInput.dataset.label.toLowerCase();
    caption.textContent = `${shapeInput.dataset.label} · ${level} · ${materialInput.value} · ${use}`;
    const text = `Oi! Vi o site da Speculari e queria provar armações ${use === 'grau' ? 'de grau' : 'esportivas'}: formato ${label}, presença ${level}, ${materialInput.value}. Posso agendar uma visita?`;
    message.textContent = text;
    cta.href = `https://wa.me/5585981082522?text=${encodeURIComponent(text)}`;
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', event => event.preventDefault());
  update();

  /* ---------- GSAP: entrada e macro com scrub ---------- */
  const startMotion = () => {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    // Entrada como um ajuste de foco: desfoque e espaçamento se assentam.
    gsap.from('.hero h1', { filter: 'blur(10px)', letterSpacing: '0.06em', opacity: 0, duration: 1.4, ease: 'expo.out' });
    gsap.from('.hero-lead, .hero-actions', { y: 16, opacity: 0, duration: .9, stagger: .1, delay: .35, ease: 'expo.out' });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      const detail = document.querySelector('.detail');
      detail.classList.add('is-pinned');
      const tl = gsap.timeline({ scrollTrigger: { trigger: detail, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      tl.fromTo('.detail-frame img', { scale: 1 }, { scale: 1.85, ease: 'none', duration: 3 }, 0)
        .fromTo('.detail-lines path', { strokeDashoffset: 60 }, { strokeDashoffset: 0, stagger: .8, duration: .8, ease: 'none' }, .3)
        .fromTo('.note', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: .8, duration: .6, ease: 'none' }, .5)
        .fromTo('.detail-copy', { opacity: 1 }, { opacity: .35, duration: .8, ease: 'none' }, 2.2);
      ScrollTrigger.refresh();
      return () => detail.classList.remove('is-pinned');
    });
    mm.add('(max-width: 960px)', () => {
      gsap.fromTo('.detail-frame img', { scale: 1 }, {
        scale: 1.35, ease: 'none',
        scrollTrigger: { trigger: '.detail-frame', start: 'top bottom', end: 'bottom top', scrub: .5 }
      });
    });

    gsap.fromTo('.lens-photo img', { scale: 1.15 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.lenses', start: 'top bottom', end: 'center center', scrub: .6 }
    });
    gsap.from('.visit h2 span', {
      yPercent: 40, opacity: 0, filter: 'blur(6px)', stagger: .12, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.visit', start: 'top 75%' }
    });
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  };
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 60);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (document.readyState === 'complete') startMotion(); else addEventListener('load', startMotion, { once: true });
})();
