(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('force-motion');
  const whatsapp = '5585985101245';

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

  /* ---------- Atalhos ---------- */
  const tags = [...document.querySelectorAll('.tag')];
  const ticketText = document.querySelector('#ticket-text');
  const ticketSend = document.querySelector('#ticket-send');
  tags.forEach(tag => {
    tag.setAttribute('aria-pressed', 'false');
    tag.addEventListener('click', () => {
      tags.forEach(item => item.setAttribute('aria-pressed', String(item === tag)));
      const need = tag.dataset.need;
      const text = need === 'falar com o farmacêutico'
        ? 'Oi! Vi o site da Originalfarma e queria falar com o farmacêutico. Pode me ajudar?'
        : `Oi! Vi o site da Originalfarma e procuro ${need}. Vocês podem conferir se tem na unidade mais perto de mim?`;
      ticketText.textContent = `“${text}”`;
      ticketSend.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
      ticketSend.setAttribute('aria-disabled', 'false');
    });
  });

  /* ---------- Lembrete de reposição ---------- */
  const form = document.querySelector('#calendar');
  const daysBox = form.querySelector('[data-days]');
  const summary = form.querySelector('[data-cal-summary]');
  const icsButton = form.querySelector('[data-ics]');
  const calWhats = form.querySelector('[data-cal-whatsapp]');
  const today = new Date();
  const monthLabel = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  form.querySelector('[data-month]').textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  let chosen = 0;
  const buttons = [];
  for (let d = 1; d <= 31; d += 1) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'day'; b.textContent = d;
    b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
    b.setAttribute('aria-label', `Dia ${d}`);
    b.tabIndex = d === 1 ? 0 : -1;
    b.addEventListener('click', () => choose(d));
    b.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = Math.min(31, Math.max(1, d + step));
      choose(next); buttons[next - 1].focus();
    });
    daysBox.append(b); buttons.push(b);
  }
  // Dia do lembrete: dois dias antes. Regra mensal que funciona em qualquer mês.
  const reminderRule = day => {
    const r = day - 2;
    if (r <= 0) return { byMonthDay: r - 1, label: r === 0 ? 'no último dia do mês anterior' : 'no penúltimo dia do mês anterior', show: 0 };
    if (r > 28) return { byMonthDay: 28, label: 'no dia 28', show: 28 };
    return { byMonthDay: r, label: `no dia ${r}`, show: r };
  };
  const label = () => form.elements.label.value.trim() || 'remédio de uso contínuo';
  const choose = day => {
    chosen = day;
    const rule = reminderRule(day);
    buttons.forEach((b, i) => {
      b.setAttribute('aria-checked', String(i + 1 === day));
      b.tabIndex = i + 1 === day ? 0 : -1;
      b.classList.toggle('alert', rule.show === i + 1);
    });
    summary.textContent = `Acaba dia ${day}. Lembrete todo mês ${rule.label}.`;
    icsButton.disabled = false;
    const text = `Oi! Meu ${label()} costuma acabar por volta do dia ${day}. Vocês podem conferir se tem para eu passar aí antes?`;
    calWhats.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    calWhats.setAttribute('aria-disabled', 'false');
  };
  form.elements.label.addEventListener('input', () => { if (chosen) choose(chosen); });
  form.addEventListener('submit', event => event.preventDefault());

  const esc = s => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  const ymd = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  icsButton.addEventListener('click', () => {
    if (!chosen) return;
    const rule = reminderRule(chosen);
    // Primeira data: próxima ocorrência do dia do lembrete.
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayIn = (y, m) => (rule.byMonthDay > 0 ? rule.byMonthDay : new Date(y, m + 1, 0).getDate() + 1 + rule.byMonthDay);
    first.setDate(dayIn(first.getFullYear(), first.getMonth()));
    if (first < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      first.setMonth(first.getMonth() + 1, 1);
      first.setDate(dayIn(first.getFullYear(), first.getMonth()));
    }
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Originalfarma conceito//PT-BR', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${stamp}-${chosen}@originalfarma-conceito`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(first)}`,
      `RRULE:FREQ=MONTHLY;BYMONTHDAY=${rule.byMonthDay}`,
      `SUMMARY:${esc(`Repor ${label()}`)}`,
      `DESCRIPTION:${esc(`Costuma acabar por volta do dia ${chosen}. Originalfarma: WhatsApp (85) 98510-1245. Dúvidas sobre o remédio: fale com o farmacêutico.`)}`,
      'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Repor ${label()}`)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'lembrete-originalfarma.ics';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    summary.textContent = `Lembrete salvo. Abra o arquivo para adicionar ao calendário do celular.`;
  });

  /* ---------- GSAP ---------- */
  const startMotion = () => {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero h1, .hero-lead, .hero-actions, .note-hand', { y: 26, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out' });
    gsap.from('.sticky', { y: -40, rotate: 12, opacity: 0, duration: .9, stagger: .15, delay: .4, ease: 'power3.out' });
    gsap.fromTo('.hero-photo img', { clipPath: 'inset(8% 8% 8% 8% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'power3.out' });
    gsap.from('.tag', { y: 20, opacity: 0, rotate: i => (i % 2 ? 3 : -3), duration: .6, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.tags', start: 'top 85%' } });
    gsap.from('.day', { scale: .6, opacity: 0, duration: .4, stagger: { each: .012, grid: [5, 7], from: 'start' }, ease: 'power2.out', scrollTrigger: { trigger: '.calendar', start: 'top 80%' } });

    // Folhinha: no desktop, as páginas se destacam uma a uma com a rolagem.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      const section = document.querySelector('.almanac');
      const pad = section.querySelector('[data-pad]');
      const pages = [...pad.children];
      section.classList.add('is-pinned');
      pad.classList.add('stacked');
      pages.forEach((page, i) => { page.style.zIndex = String(pages.length - i); });
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      pages.slice(0, -1).forEach((page, i) => {
        tl.to(page, { rotateX: 105, y: -30, opacity: 0, duration: 1, ease: 'power1.in' }, i * 1.1);
      });
      ScrollTrigger.refresh();
      return () => {
        section.classList.remove('is-pinned'); pad.classList.remove('stacked');
        pages.forEach(page => { page.style.zIndex = ''; gsap.set(page, { clearProps: 'all' }); });
      };
    });
    mm.add('(max-width: 960px)', () => {
      gsap.utils.toArray('.page').forEach(page => gsap.from(page, { rotateX: -60, opacity: 0, transformOrigin: '50% 0', duration: .7, ease: 'power3.out', scrollTrigger: { trigger: page, start: 'top 88%' } }));
    });
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
