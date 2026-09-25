/* Free interaction patterns adapted for vanilla HTML from Skiper UI:
   Text Roll Navigation (skiper58) and Scroll Progress 001 (skiper89).
   https://skiper-ui.com/ — attribution required by the free license. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navLinks = document.querySelectorAll('.nav nav > a:not(.nav-cta)');

  navLinks.forEach(link => {
    const label = link.textContent.trim();
    link.setAttribute('aria-label', label);
    link.textContent = '';
    const roll = document.createElement('span');
    roll.className = 'text-roll';
    roll.setAttribute('aria-hidden', 'true');
    [...label].forEach((character, index) => {
      const letter = document.createElement('span');
      letter.className = 'roll-char';
      letter.style.setProperty('--i', index);
      const glyph = character === ' ' ? '\u00a0' : character;
      letter.innerHTML = `<span class="roll-char-track"><span>${glyph}</span><span>${glyph}</span></span>`;
      roll.append(letter);
    });
    link.append(roll);
  });

  const orbit = document.querySelector('.scroll-orbit');
  if (!orbit) return;
  const value = orbit.querySelector('.scroll-orbit-value');
  const label = orbit.querySelector('span');
  const update = progress => {
    const percent = Math.round(progress * 100);
    value.style.strokeDashoffset = String(100 - percent);
    label.textContent = `${percent}%`;
  };

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => update(self.progress) });
  }

  let startY = 0;
  let dragged = false;
  orbit.addEventListener('pointerdown', event => {
    startY = event.clientY;
    dragged = false;
    orbit.setPointerCapture(event.pointerId);
  });
  orbit.addEventListener('pointermove', event => {
    if (!orbit.hasPointerCapture(event.pointerId)) return;
    if (Math.abs(event.clientY - startY) > 7) dragged = true;
    if (!dragged) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = Math.min(1, Math.max(0, event.clientY / innerHeight));
    scrollTo({ top: max * ratio, behavior: 'auto' });
  });
  orbit.addEventListener('pointerup', event => {
    if (orbit.hasPointerCapture(event.pointerId)) orbit.releasePointerCapture(event.pointerId);
    if (!dragged) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
