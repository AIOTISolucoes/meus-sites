(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 760px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Menu ---------- */
  const nav = document.querySelector('#nav');
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuBtn.innerHTML = `<i class="ph ph-${open ? 'x' : 'list'}" aria-hidden="true"></i>`;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('a')?.focus();
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Fatias do hero ---------- */
  const hero = document.querySelector('.hero');
  const slatsBox = document.querySelector('[data-slats]');
  const heroImg = hero.querySelector('.hero-media img');
  const buildSlats = () => {
    const count = narrow.matches ? 4 : 6;
    slatsBox.style.setProperty('--count', count);
    slatsBox.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const slat = document.createElement('div');
      slat.className = 'slat';
      slat.style.cssText = `--i:${i};--count:${count};--img:url("${heroImg.currentSrc || heroImg.src}");` +
        `--dir:${i % 2 ? -1 : 1};--dur:${9 + (i * 1.7) % 5}s;--delay:${-i * 1.3}s`;
      slat.append(document.createElement('i'));
      slatsBox.append(slat);
    }
  };
  buildSlats();
  narrow.addEventListener('change', buildSlats);

  const toggle = document.querySelector('[data-motion-toggle]');
  const setPaused = paused => {
    hero.classList.toggle('paused', paused);
    toggle.setAttribute('aria-pressed', String(!paused));
    toggle.textContent = paused ? 'Ativar movimento' : 'Pausar movimento';
  };
  if (reduce) { toggle.hidden = true; } else {
    toggle.addEventListener('click', () => setPaused(!hero.classList.contains('paused')));
    document.addEventListener('visibilitychange', () => hero.classList.toggle('paused', document.hidden || toggle.getAttribute('aria-pressed') === 'false'));
  }

  // Cursor puxa a "gaveta" mais próxima, como a mão no puxador.
  if (finePointer && !reduce) {
    let frame = 0;
    hero.addEventListener('pointermove', event => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (hero.classList.contains('paused')) return;
        const rect = hero.getBoundingClientRect();
        const y = (event.clientY - rect.top) / rect.height;
        const x = (event.clientX - rect.left) / rect.width - .5;
        const slats = slatsBox.children;
        [...slats].forEach((slat, index) => {
          const center = (index + .5) / slats.length;
          const pull = Math.max(0, 1 - Math.abs(center - y) * slats.length * .9);
          slat.style.setProperty('--pull', (pull * 2.4 + x * 1.2).toFixed(2));
          slat.style.setProperty('--glow', (pull * .12).toFixed(3));
        });
      });
    });
    hero.addEventListener('pointerleave', () => [...slatsBox.children].forEach(slat => { slat.style.removeProperty('--pull'); slat.style.removeProperty('--glow'); }));
  }

  /* ---------- Gaveteiro + cupom ---------- */
  const drawers = [...document.querySelectorAll('.drawer')];
  const needEl = document.querySelector('#receipt-need');
  const hintEl = document.querySelector('#receipt-hint');
  const itemEl = document.querySelector('#receipt-item');
  const messageEl = document.querySelector('#receipt-message');
  const preview = document.querySelector('.receipt-preview');
  const whatsapp = document.querySelector('#receipt-whatsapp');
  const receipt = document.querySelector('#receipt');
  const phone = '5585981833811';
  let need = '';

  const buildMessage = () => {
    const item = itemEl.value.trim();
    const how = receipt.querySelector('input[name="how"]:checked').value;
    if (!need) return 'Oi! Vi o site da Farmácia Provisão e queria fazer uma consulta.';
    if (need === 'Falar com o farmacêutico') {
      return `Oi! Vi o site da Farmácia Provisão e queria falar com o farmacêutico${item ? ` sobre ${item}` : ''}. Pode me ajudar?`;
    }
    const what = item ? `${item} (${need.toLowerCase()})` : `um item de ${need.toLowerCase()}`;
    return `Oi! Vi o site da Farmácia Provisão e queria saber se vocês têm ${what}. Quero ${how}.`;
  };
  const render = (print = false) => {
    const text = buildMessage();
    messageEl.textContent = text;
    whatsapp.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    whatsapp.setAttribute('aria-disabled', String(!need));
    if (print && !reduce) {
      preview.classList.remove('printing');
      void preview.offsetWidth;
      preview.classList.add('printing');
    }
  };
  const openDrawer = drawer => {
    drawers.forEach(item => item.setAttribute('aria-pressed', String(item === drawer)));
    need = drawer.dataset.need;
    needEl.textContent = need;
    hintEl.textContent = drawer.dataset.hint;
    render(true);
    if (narrow.matches) receipt.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  drawers.forEach(drawer => drawer.addEventListener('click', () => openDrawer(drawer)));
  itemEl.addEventListener('input', () => render());
  receipt.querySelectorAll('input[name="how"]').forEach(input => input.addEventListener('change', () => render()));
  receipt.addEventListener('submit', event => event.preventDefault());
  render();

  /* ---------- GSAP (opcional: o site funciona sem) ---------- */
  const startMotion = () => {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const ease = 'power4.out';

    gsap.from('.hero-copy > *', { y: 28, autoAlpha: 0, duration: 1, stagger: .09, ease, clearProps: 'all' });
    gsap.from('.slat', { xPercent: i => (i % 2 ? 6 : -6), duration: 1.4, stagger: .06, ease });

    // Scroll: as fatias se afastam em direções alternadas, como gavetas abrindo.
    gsap.to('.slat', {
      xPercent: i => (i % 2 ? -3.5 : 3.5), yPercent: i => (i - 2.5) * 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
    });

    gsap.from('.drawer', {
      z: -120, y: 30, opacity: 0, duration: .9, stagger: { each: .07, grid: [3, 2], from: 'start' }, ease,
      scrollTrigger: { trigger: '.cabinet', start: 'top 80%' }
    });

    // Fita do cupom: desenrola com a rolagem (scrub).
    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      gsap.fromTo('.tape-paper', { clipPath: 'inset(0 0 88% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 55%', end: 'bottom 85%', scrub: .5 }
      });
      gsap.to('.tape-roll', {
        rotateX: 540, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 55%', end: 'bottom 85%', scrub: .5 }
      });
    });
    mm.add('(max-width: 960px)', () => {
      gsap.fromTo('.tape-paper', { clipPath: 'inset(0 0 70% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', ease: 'none',
        scrollTrigger: { trigger: '.tape', start: 'top 85%', end: 'bottom 70%', scrub: .5 }
      });
    });

    gsap.fromTo('.pharmacist-photo img', { scale: 1.12 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.pharmacist', start: 'top bottom', end: 'center center', scrub: .6 }
    });
    gsap.from('.where-card', {
      y: 24, opacity: 0, duration: .8, stagger: .08, ease,
      scrollTrigger: { trigger: '.where-grid', start: 'top 85%' }
    });
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  };
  if (document.readyState === 'complete') startMotion(); else addEventListener('load', startMotion, { once: true });
})();
