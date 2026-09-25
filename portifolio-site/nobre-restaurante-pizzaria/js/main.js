(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Menu ---------- */
  const nav = document.querySelector('#nav');
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
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

  /* ---------- Hero: arrastar do almoço para a noite ---------- */
  const dn = document.querySelector('[data-daynight]');
  const handle = dn.querySelector('.dn-handle');
  let split = 50; let touched = false;
  const setSplit = value => {
    split = clamp(value, 4, 96);
    dn.style.setProperty('--split', `${split}%`);
    handle.setAttribute('aria-valuenow', String(Math.round(split)));
    handle.setAttribute('aria-valuetext', split < 35 ? 'Noite' : split < 65 ? 'Entardecer' : 'Almoço');
  };
  const fromPointer = event => {
    const rect = dn.getBoundingClientRect();
    setSplit(((event.clientX - rect.left) / rect.width) * 100);
  };
  handle.addEventListener('pointerdown', event => {
    touched = true; dn.classList.add('dragging');
    handle.setPointerCapture(event.pointerId);
    fromPointer(event);
  });
  handle.addEventListener('pointermove', event => { if (dn.classList.contains('dragging')) fromPointer(event); });
  handle.addEventListener('pointerup', () => dn.classList.remove('dragging'));
  handle.addEventListener('pointercancel', () => dn.classList.remove('dragging'));
  // Toque em qualquer ponto da imagem também move a divisa.
  dn.addEventListener('click', event => { if (event.target === handle || handle.contains(event.target)) return; touched = true; fromPointer(event); });
  handle.addEventListener('keydown', event => {
    const step = { ArrowLeft: -5, ArrowRight: 5, ArrowDown: -5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[event.key];
    if (step) { event.preventDefault(); touched = true; setSplit(split + step); }
    if (event.key === 'Home') { event.preventDefault(); touched = true; setSplit(4); }
    if (event.key === 'End') { event.preventDefault(); touched = true; setSplit(96); }
  });
  // Sem interação, a luz vai e volta devagar sozinha.
  if (!reduce) {
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) requestAnimationFrame(sweep); }).observe(dn);
    const start = performance.now();
    const sweep = now => {
      if (touched || !visible) return;
      setSplit(50 + Math.sin((now - start) / 2600) * 30);
      requestAnimationFrame(sweep);
    };
    requestAnimationFrame(sweep);
  }

  /* ---------- Céu: a cor de fundo acompanha a hora ---------- */
  const chapters = [...document.querySelectorAll('.chapter')];
  const skyVar = { day: 'var(--day)', dusk: 'var(--dusk)', night: 'var(--night)', late: 'var(--late)' };
  const sky = document.querySelector('.sky');
  document.documentElement.classList.add('js-sky');
  let skyFrame = 0;
  const paintSky = () => {
    skyFrame = 0;
    const mid = innerHeight * .55;
    let current = chapters[0]; let next = null; let t = 0;
    for (let i = 0; i < chapters.length; i += 1) {
      const rect = chapters[i].getBoundingClientRect();
      if (rect.top <= mid && rect.bottom > mid) {
        current = chapters[i]; next = chapters[i + 1] || null;
        const zone = Math.min(rect.height * .45, innerHeight * .6);
        t = clamp((mid - (rect.bottom - zone)) / zone, 0, 1);
        break;
      }
      if (rect.top > mid) { current = chapters[i]; break; }
    }
    const a = skyVar[current.dataset.sky];
    const b = next ? skyVar[next.dataset.sky] : a;
    sky.style.setProperty('--sky', `color-mix(in oklch, ${a} ${(100 - t * 100).toFixed(1)}%, ${b})`);
    nav.classList.toggle('scrolled', scrollY > 50);
  };
  addEventListener('scroll', () => { if (!skyFrame) skyFrame = requestAnimationFrame(paintSky); }, { passive: true });
  addEventListener('resize', paintSky);
  paintSky();

  /* ---------- Reserva ---------- */
  const form = document.querySelector('#booking');
  const preview = document.querySelector('#booking-preview');
  const send = document.querySelector('#booking-send');
  const buildBooking = () => {
    const nome = form.elements.nome.value.trim();
    const pessoas = form.elements.pessoas.value || '?';
    const dia = form.elements.dia.value;
    const unidade = form.elements.unidade.value;
    const quando = dia ? new Date(`${dia}T12:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }) : 'um dia a combinar';
    const text = `Olá! ${nome ? `Sou ${nome} e gostaria` : 'Gostaria'} de pedir uma reserva para ${pessoas} ${pessoas === '1' ? 'pessoa' : 'pessoas'} em ${quando}${unidade ? `, na unidade ${unidade}` : ''}. Vocês confirmam a disponibilidade?`;
    preview.textContent = `“${text}”`;
    send.href = `https://wa.me/5585981774418?text=${encodeURIComponent(text)}`;
  };
  form.addEventListener('input', buildBooking);
  form.addEventListener('submit', event => event.preventDefault());
  buildBooking();

  /* ---------- Unidades ---------- */
  const units = {
    maracanau: {
      name: 'Maracanaú', address: 'R. 49, 37, Jereissati II, Maracanaú <em class="tag-confirm">confirmar</em>',
      focus: 'Almoço da casa, pratos executivos e massas no cardápio publicado.',
      order: 'https://maracanaunobre.menudino.com/', whatsapp: 'https://wa.me/5585988885464'
    },
    maranguape: {
      name: 'Maranguape', address: 'Endereço a confirmar com a casa',
      focus: 'Pizzas, combos, hambúrguer artesanal, pastéis e massas no cardápio publicado.',
      order: 'https://nobremaranguape.menudino.com/', whatsapp: 'https://wa.me/558533412675'
    }
  };
  const card = document.querySelector('.unit-card');
  const switches = [...document.querySelectorAll('[data-unit]')];
  const pickUnit = button => {
    const unit = units[button.dataset.unit];
    switches.forEach(item => { item.setAttribute('aria-checked', String(item === button)); item.tabIndex = item === button ? 0 : -1; });
    card.querySelector('[data-unit-name]').textContent = unit.name;
    card.querySelector('[data-unit-address]').innerHTML = unit.address;
    card.querySelector('[data-unit-focus]').textContent = unit.focus;
    card.querySelector('[data-unit-order]').href = unit.order;
    card.querySelector('[data-unit-whatsapp]').href = unit.whatsapp;
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  };
  switches.forEach((button, index) => {
    button.addEventListener('click', () => pickUnit(button));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const nextButton = switches[(index + 1) % switches.length];
      pickUnit(nextButton); nextButton.focus();
    });
  });
  switches[1].tabIndex = -1;

  /* ---------- GSAP: pizza em fatias, sol, entradas ---------- */
  const startMotion = () => {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero h1', { y: 40, opacity: 0, duration: 1.4, ease: 'power3.out' });
    gsap.from('.hero-actions, .hero-place', { y: 20, opacity: 0, duration: 1.1, delay: .3, stagger: .1, ease: 'power3.out' });

    // Sol percorre o arco e escurece.
    const path = document.querySelector('.arc-path');
    const sun = document.querySelector('.arc-sun');
    const length = path.getTotalLength();
    ScrollTrigger.create({
      trigger: '.dusk', start: 'top bottom', end: 'bottom top', scrub: true,
      onUpdate: self => {
        const p = path.getPointAtLength(self.progress * length);
        sun.setAttribute('cx', p.x); sun.setAttribute('cy', p.y);
        sun.style.fill = `color-mix(in oklch, var(--gold) ${(100 - self.progress * 100).toFixed(0)}%, var(--wine))`;
      }
    });

    // Pizza: a mesma foto cortada em 8 fatias que se juntam com a rolagem.
    const fig = document.querySelector('[data-wedges]');
    const img = fig.querySelector('img');
    const cx = +fig.dataset.cx * 100; const cy = +fig.dataset.cy * 100;
    const rx = +fig.dataset.rx * 100; const ry = +fig.dataset.ry * 100;
    const wedges = [];
    for (let i = 0; i < 8; i += 1) {
      const a0 = (i / 8) * Math.PI * 2; const a1 = ((i + 1) / 8) * Math.PI * 2;
      const pts = [`${cx}% ${cy}%`];
      for (let k = 0; k <= 6; k += 1) {
        const a = a0 + (a1 - a0) * (k / 6);
        pts.push(`${(cx + Math.cos(a) * rx * 1.04).toFixed(2)}% ${(cy + Math.sin(a) * ry * 1.06).toFixed(2)}%`);
      }
      const wedge = document.createElement('div');
      wedge.className = 'wedge';
      wedge.setAttribute('aria-hidden', 'true');
      wedge.style.setProperty('--img', `url("${img.currentSrc || img.getAttribute('src')}")`);
      wedge.style.clipPath = `polygon(${pts.join(',')})`;
      wedge.dataset.angle = String((a0 + a1) / 2);
      fig.append(wedge);
      wedges.push(wedge);
    }
    fig.classList.add('cut');
    const spread = (el, amount) => {
      const a = +el.dataset.angle;
      return { xPercent: Math.cos(a) * amount, yPercent: Math.sin(a) * amount * 1.4, rotate: Math.cos(a * 3) * amount * .5 };
    };

    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      const section = document.querySelector('.pizza');
      section.classList.add('is-pinned');
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .8 } });
      wedges.forEach((w, i) => tl.fromTo(w, { ...spread(w, 16), opacity: .4 }, { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1, ease: 'power2.out', duration: 1 }, i * .06));
      tl.fromTo('.pizza-copy', { opacity: .4, y: 30 }, { opacity: 1, y: 0, duration: .5 }, 0);
      ScrollTrigger.refresh();
      return () => section.classList.remove('is-pinned');
    });
    mm.add('(max-width: 960px)', () => {
      wedges.forEach(w => gsap.fromTo(w, { ...spread(w, 12) }, {
        xPercent: 0, yPercent: 0, rotate: 0, ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top 95%', end: 'center 55%', scrub: .6 }
      }));
    });

    gsap.fromTo('.lunch-photo img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.lunch', start: 'top bottom', end: 'center center', scrub: .8 } });
    gsap.fromTo('.pasta-photo', { rotate: -25, scale: .85 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.pasta', start: 'top bottom', end: 'center center', scrub: .8 } });
    gsap.fromTo('.booking-photo img', { scale: 1.2, yPercent: -6 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.booking', start: 'top bottom', end: 'center center', scrub: .8 } });
    gsap.from('.menu-list li', { x: -24, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.menu-list', start: 'top 85%' } });
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  };
  if (document.readyState === 'complete') startMotion(); else addEventListener('load', startMotion, { once: true });
})();
