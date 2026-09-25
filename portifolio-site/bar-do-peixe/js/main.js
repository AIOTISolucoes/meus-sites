(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('#menu');
  menuBtn?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = `<i class="ph ph-${open ? 'x' : 'list'}"></i>`;
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.classList.remove('open')));

  const panels = [...document.querySelectorAll('.food-panel')];
  const activate = panel => { panels.forEach(item => item.classList.toggle('active', item === panel)); };
  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => activate(panel));
    panel.addEventListener('focus', () => activate(panel));
    panel.addEventListener('click', () => activate(panel));
    panel.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(panel); } });
  });

  const choice = document.querySelector('#order-choice');
  const note = document.querySelector('#order-note');
  const send = document.querySelector('#order-send');
  document.querySelectorAll('[data-dish]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-dish]').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
    const dish = button.dataset.dish;
    choice.textContent = dish;
    note.textContent = 'A casa confirma opções, quantidade, acompanhamentos e valor.';
    send.classList.remove('disabled');
    send.href = `https://wa.me/5585988541960?text=${encodeURIComponent(`Olá! Vi o site e gostaria de saber mais sobre: ${dish}.`)}`;
  }));

  if (!window.gsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline().from('.hero-copy > *', { y: 42, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' }).from('.hero-photo', { scale: 1.12, duration: 1.5, ease: 'power3.out' }, 0);
  gsap.to('.hero-photo', { scale: 1.09, yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('.hero-plate', { rotateZ: 95, xPercent: -20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
  gsap.fromTo('.story-media', { scale: .84, opacity: .45 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top 85%', end: 'top 18%', scrub: 1 } });
  gsap.to('.story-media img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.utils.toArray('.reveal').forEach(el => gsap.from(el, { y: 64, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 84%' } }));
  gsap.to('.fish-orbit', { rotateY: 180, rotateZ: 35, ease: 'none', scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  ScrollTrigger.create({ start: 40, onUpdate: self => document.querySelector('#nav').classList.toggle('scrolled', self.scroll() > 40) });
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
