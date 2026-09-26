(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('force-motion');
  const whatsapp = '5585989379116';

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
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 50);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Contador do hero: um d20 que não para de rolar ---------- */
  const heroRoll = document.querySelector('[data-hero-roll]');
  if (heroRoll && !reduce) {
    let timer = 0;
    const tick = () => {
      let flicks = 0;
      const flick = setInterval(() => {
        heroRoll.textContent = 1 + Math.floor(Math.random() * 20);
        flicks += 1;
        if (flicks > 7) { clearInterval(flick); heroRoll.textContent = 1 + Math.floor(Math.random() * 20); }
      }, 55);
      timer = setTimeout(tick, 2600);
    };
    new IntersectionObserver(([entry]) => {
      clearTimeout(timer);
      if (entry.isIntersecting) timer = setTimeout(tick, 1200);
    }).observe(heroRoll);
  }

  /* ---------- Resultado do dado ---------- */
  const cards = [...document.querySelectorAll('.card')];
  const classes = cards.map(card => {
    const [from, to] = card.dataset.faces.split(/[–-]/).map(Number);
    return { name: card.dataset.class, desc: card.dataset.desc, from, to };
  });
  const out = {
    box: document.querySelector('.roll-result'),
    number: document.querySelector('[data-result-number]'),
    name: document.querySelector('[data-result-class]'),
    desc: document.querySelector('[data-result-desc]'),
    actions: document.querySelector('[data-result-actions]'),
    whatsapp: document.querySelector('[data-result-whatsapp]')
  };
  const photoBox = document.querySelector('[data-result-photo]');
  const photoImg = document.createElement('img');
  photoImg.width = 700; photoImg.height = 700; photoImg.alt = ''; photoImg.hidden = true;
  const photos = cards.filter(card => card.dataset.photo).map(card => card.dataset.photo);
  const guildPhoto = 'assets/cardapio/guilda.webp';
  photos.concat(guildPhoto).forEach(src => { const pre = new Image(); pre.src = src; });
  const setPhoto = (src, note = '') => {
    photoImg.hidden = !src;
    if (src) { if (!photoImg.isConnected) photoBox.append(photoImg); photoImg.src = src; photoImg.alt = note ? '' : 'Foto do lanche sorteado, do cardápio oficial'; }
    photoBox.dataset.note = src ? '' : note;
    photoBox.setAttribute('aria-hidden', String(!src));
  };
  let shuffleTimer = 0;
  const startShuffle = () => {
    if (reduce) return;
    photoBox.classList.add('shuffling'); photoBox.classList.remove('landed');
    let i = Math.floor(Math.random() * photos.length);
    // Roleta que desacelera: começa rápida e vai ficando mais lenta até o dado parar.
    let delay = 110;
    const next = () => {
      i = (i + 1) % photos.length; setPhoto(photos[i]);
      delay = Math.min(delay * 1.22, 420);
      shuffleTimer = setTimeout(next, delay);
    };
    shuffleTimer = setTimeout(next, delay);
  };
  const stopShuffle = () => { clearTimeout(shuffleTimer); photoBox.classList.remove('shuffling'); };

  const showResult = n => {
    let name; let desc; let order; let photo = ''; let note = '';
    if (n === 20) {
      name = 'Acerto crítico!';
      desc = 'A mesa ganhou motivo para pedir a Entrada da Guilda: as porções da casa numa tábua só.';
      order = 'uma Entrada da Guilda';
      photo = guildPhoto;
    } else if (n === 1) {
      name = 'Falha crítica.';
      desc = 'Ninguém viu. Role de novo ou escolha direto no cardápio.';
      order = null;
      note = 'Rola de novo!';
    } else {
      const hit = classes.find(item => n >= item.from && n <= item.to);
      name = hit.name;
      desc = `${hit.desc}. Pão brioche e blend bovino de 120 g.`;
      order = `${hit.name === 'Bruxa' ? 'uma' : 'um'} ${hit.name}`;
      photo = cards.find(card => card.dataset.class === hit.name)?.dataset.photo || '';
      note = `${hit.name}: foto no pedido oficial`;
    }
    stopShuffle();
    setPhoto(photo, note);
    photoBox.classList.remove('landed'); void photoBox.offsetWidth; photoBox.classList.add('landed');
    out.number.textContent = n;
    out.name.textContent = name;
    out.desc.textContent = desc;
    out.actions.hidden = !order;
    if (order) {
      out.whatsapp.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Boa noite! Rolei ${n} no dado do site e eu gostaria de ${order}, por favor!`)}`;
      out.whatsapp.innerHTML = `<i class="ph-bold ph-whatsapp-logo" aria-hidden="true"></i> Pedir ${order}`;
    }
    out.box.classList.remove('pop'); void out.box.offsetWidth; out.box.classList.add('pop');
    cards.forEach(card => card.classList.toggle('rolled', card.dataset.class === name));
  };
  const randomFace = () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return 1 + (buf[0] % 20);
  };
  // O dado 3D (js/die.js, Three.js) registra window.D20Die. Sem WebGL, o botão
  // continua funcionando e só o número aparece.
  setPhoto('', '?');
  window.D20 = { showResult, randomFace };
  const rollButton = document.querySelector('[data-roll]');
  const roll = () => {
    // window.D20.nextRoll permite fixar a face em gravações de demonstração.
    const n = window.D20.nextRoll || randomFace();
    window.D20.nextRoll = 0;
    if (window.D20Die?.ready) {
      rollButton.disabled = true;
      startShuffle();
      window.D20Die.roll(n).then(() => { showResult(n); rollButton.disabled = false; });
    } else {
      showResult(n);
    }
  };
  rollButton.addEventListener('click', roll);
  document.querySelector('[data-die-scene]').addEventListener('click', () => { if (!rollButton.disabled) roll(); });

  /* ---------- Abas do cardápio (padrão ARIA com setas) ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab, focus = true) => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab, false));
    tab.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (step) { event.preventDefault(); selectTab(tabs[(index + step + tabs.length) % tabs.length]); }
      if (event.key === 'Home') { event.preventDefault(); selectTab(tabs[0]); }
      if (event.key === 'End') { event.preventDefault(); selectTab(tabs[tabs.length - 1]); }
    });
  });

  /* ---------- Forja: a mesma foto fatiada nas camadas reais ---------- */
  const forge = document.querySelector('[data-forge]');
  const cuts = [0, .25, .326, .433, .541, .667, .79, 1];
  const img = forge.querySelector('img');
  const slices = cuts.slice(0, -1).map((top, i) => {
    const height = cuts[i + 1] - top;
    const slice = document.createElement('div');
    slice.className = 'slice';
    slice.setAttribute('aria-hidden', 'true');
    slice.style.cssText = `top:${top * 100}%;height:${height * 100 + .15}%;` +
      `background-image:url("${img.currentSrc || img.getAttribute('src')}");` +
      `background-size:100% ${100 / height}%;background-position:50% ${height === 1 ? 0 : (top / (1 - height)) * 100}%`;
    forge.append(slice);
    return slice;
  });
  forge.classList.add('sliced');

  /* ---------- GSAP ---------- */
  const startMotion = () => {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const mid = (slices.length - 1) / 2;

    gsap.from('.hero h1', { y: 60, opacity: 0, duration: .9, ease: 'power4.out' });
    gsap.from('.hero-actions > *', { y: 24, opacity: 0, duration: .6, stagger: .08, delay: .3, ease: 'power3.out' });
    gsap.fromTo('.hero-img', { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out' });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      // Forja fixada: camadas começam espalhadas e se juntam com a rolagem.
      const section = document.querySelector('.forge');
      section.classList.add('is-pinned');
      gsap.fromTo(slices, {
        yPercent: i => (i - mid) * 55, xPercent: i => (i % 2 ? 4 : -4), rotate: i => (i - mid) * 1.4
      }, {
        yPercent: i => (i - mid) * -12, xPercent: 0, rotate: 0, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .5 }
      });
      gsap.from('.forge h2', {
        opacity: .2, x: -30, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '30% top', scrub: .5 }
      });

      // Cardápio: trilho horizontal preso durante a leitura dos hambúrgueres.
      const track = document.querySelector('.cards');
      const panel = document.querySelector('#panel-burgers');
      const distance = () => Math.max(0, track.scrollWidth - panel.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: { trigger: '.menu', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: .6, invalidateOnRefresh: true }
      });
      ScrollTrigger.refresh();
      return () => { section.classList.remove('is-pinned'); tween.scrollTrigger?.kill(); };
    });
    mm.add('(max-width: 960px)', () => {
      gsap.fromTo(slices, { yPercent: i => (i - mid) * 30 }, {
        yPercent: i => (i - mid) * -10, ease: 'none',
        scrollTrigger: { trigger: forge, start: 'top 90%', end: 'bottom 40%', scrub: .5 }
      });
    });

    gsap.fromTo('.guild img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.guild', start: 'top bottom', end: 'bottom top', scrub: .6 } });
    gsap.from('.portal', { y: 40, opacity: 0, rotate: i => (i % 2 ? 2 : -2), duration: .6, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.portals', start: 'top 85%' } });
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
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
