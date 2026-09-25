(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forceMotion = new URLSearchParams(location.search).get('motion') === '1';
  const finePointer = matchMedia('(pointer: fine)').matches;
  const columns = 4;
  const rows = 3;

  document.querySelectorAll('[data-living-grid]').forEach(grid => {
    const source = grid.dataset.livingGrid;
    const variant = grid.dataset.variant || 'pulse';
    const fragment = document.createDocumentFragment();

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column;
        const cell = document.createElement('span');
        const image = document.createElement('img');
        cell.className = 'living-cell';
        cell.dataset.column = String(column);
        cell.dataset.row = String(row);
        image.className = 'living-cell-media';
        image.src = source;
        image.alt = '';
        image.decoding = 'async';
        image.draggable = false;
        image.style.left = `${column * -100}%`;
        image.style.top = `${row * -100}%`;
        const dx = ((index % 3) - 1) * (5 + (index % 4));
        const dy = (((index + 1) % 3) - 1) * (4 + (index % 5));
        image.style.setProperty('--dx', `${dx}px`);
        image.style.setProperty('--dy', `${dy}px`);
        image.style.setProperty('--dx-start', `${dx * -.55}px`);
        image.style.setProperty('--dy-start', `${dy * -.45}px`);
        image.style.setProperty('--dx-tide-start', `${dx * -.45}px`);
        image.style.setProperty('--dy-tide-start', `${dy * -.25}px`);
        image.style.setProperty('--dx-mid', `${dx * .2}px`);
        image.style.setProperty('--dy-end', `${dy * -.55}px`);
        image.style.setProperty('--dx-half', `${dx * -.5}px`);
        image.style.setProperty('--dy-half', `${dy * -.35}px`);
        image.style.setProperty('--duration', `${8.5 + (index % 5) * 1.15}s`);
        image.style.setProperty('--delay', `${index * -.47}s`);
        image.style.setProperty('--origin-x', `${column * 13}%`);
        image.style.setProperty('--origin-y', `${row * 17}%`);
        cell.append(image);
        fragment.append(cell);
      }
    }
    grid.append(fragment);

    const hero = grid.closest('.hero, .hero-media');
    let motionEnabled = forceMotion || !reduce;
    let reset = () => {};
    const toggle = document.createElement('button');
    const renderToggle = () => {
      grid.classList.toggle('motion-enabled', motionEnabled);
      grid.classList.toggle('motion-paused', !motionEnabled);
      toggle.setAttribute('aria-pressed', String(motionEnabled));
      toggle.setAttribute('aria-label', motionEnabled ? 'Pausar animação do fundo' : 'Ativar animação do fundo');
      toggle.innerHTML = `<i class="ph ${motionEnabled ? 'ph-pause' : 'ph-play'}" aria-hidden="true"></i><span>${motionEnabled ? 'Pausar fundo' : 'Ativar fundo'}</span>`;
    };
    toggle.type = 'button';
    toggle.className = 'motion-toggle';
    toggle.addEventListener('click', () => {
      motionEnabled = !motionEnabled;
      if (!motionEnabled) reset();
      renderToggle();
    });
    hero.append(toggle);
    renderToggle();

    if (!window.gsap) return;
    const cells = [...grid.querySelectorAll('.living-cell')];
    const movers = cells.map(cell => ({
      x: gsap.quickTo(cell, 'x', { duration: .72, ease: 'power3.out' }),
      y: gsap.quickTo(cell, 'y', { duration: .72, ease: 'power3.out' }),
      rx: gsap.quickTo(cell, 'rotationX', { duration: .9, ease: 'power3.out' }),
      ry: gsap.quickTo(cell, 'rotationY', { duration: .9, ease: 'power3.out' }),
    }));

    reset = () => movers.forEach(move => { move.x(0); move.y(0); move.rx(0); move.ry(0); });
    if (finePointer) {
      hero.addEventListener('pointermove', event => {
        if (!motionEnabled) return;
        const bounds = hero.getBoundingClientRect();
        const px = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        const py = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
        cells.forEach((cell, index) => {
          const column = Number(cell.dataset.column);
          const row = Number(cell.dataset.row);
          const cx = ((column + .5) / columns) * 2 - 1;
          const cy = ((row + .5) / rows) * 2 - 1;
          const distance = Math.min(1.5, Math.hypot(px - cx, py - cy));
          const depth = 3 + ((index * 7) % 5) * 1.5;
          let x = px * depth;
          let y = py * depth;
          if (variant === 'pulse') {
            const attraction = Math.max(0, 1 - distance) * 8;
            x += (px - cx) * attraction;
            y += (py - cy) * attraction;
          } else if (variant === 'tide') {
            const refraction = Math.max(0, 1.2 - distance) * 5;
            x += (cx - px) * refraction;
            y += (cy - py) * refraction * .55;
          }
          movers[index].x(x);
          movers[index].y(y);
          movers[index].rx(py * -1.8);
          movers[index].ry(px * 1.8);
        });
      });
      hero.addEventListener('pointerleave', reset);
    }

    hero.addEventListener('pointerdown', event => {
      if (!motionEnabled || event.target.closest('a, button')) return;
      const bounds = hero.getBoundingClientRect();
      const column = Math.min(columns - 1, Math.max(0, Math.floor((event.clientX - bounds.left) / bounds.width * columns)));
      const row = Math.min(rows - 1, Math.max(0, Math.floor((event.clientY - bounds.top) / bounds.height * rows)));
      const selected = cells[row * columns + column];
      gsap.fromTo(selected, { scale: 1 }, { scale: 1.075, duration: .26, repeat: 1, yoyo: true, ease: 'power2.out' });
    });
  });
})();
