(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('#menu');
  menuBtn.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); menuBtn.innerHTML = `<i class="ph ph-${open ? 'x' : 'list'}"></i>`; });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }));
  const form = document.querySelector('#finder-form'); const face = document.querySelector('#face'); const result = document.querySelector('#finder-result'); const contact = document.querySelector('#finder-contact');
  let faceType = '', vibe = '';
  const suggestions = {
    'oval-leve':['Leve e translúcida','Linhas finas preservam a versatilidade do rosto oval.'], 'oval-marcante':['Geometria em destaque','Um desenho angular cria contraste sem pesar.'], 'oval-classico':['Metal de traço limpo','Proporção equilibrada e desenho atemporal.'],
    'round-leve':['Retângulo delicado','Linhas um pouco mais retas criam definição com leveza.'], 'round-marcante':['Angular expressiva','Cantos definidos ajudam a criar contraste visual.'], 'round-classico':['Quadrada essencial','Uma forma clássica com altura moderada.'],
    'angular-leve':['Curvas transparentes','Contornos suaves equilibram linhas mais marcadas.'], 'angular-marcante':['Volume escultórico','Uma armação ampla assume a geometria como identidade.'], 'angular-classico':['Aro arredondado','Curvas simples criam um contraponto atemporal.']
  };
  function update(){ face.className = `face ${faceType} ${vibe === 'leve' ? 'light' : vibe === 'classico' ? 'classic' : ''}`; if(!faceType || !vibe) return; const item=suggestions[`${faceType}-${vibe}`]; result.innerHTML=`<small>Sua direção de estilo</small><strong>${item[0]}</strong><p>${item[1]}</p>`; contact.classList.remove('disabled'); contact.href=`https://www.instagram.com/otica_vizziofashion/`; }
  form.querySelectorAll('[data-face]').forEach(btn => btn.addEventListener('click',()=>{ form.querySelectorAll('[data-face]').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); faceType=btn.dataset.face; update(); }));
  form.querySelectorAll('[data-vibe]').forEach(btn => btn.addEventListener('click',()=>{ form.querySelectorAll('[data-vibe]').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); vibe=btn.dataset.vibe; update(); }));

  // OriginKit's public Image Magnifier behaviour, rebuilt for this no-build site.
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    document.querySelectorAll('[data-magnify]').forEach(media => {
      const image = media.querySelector('img');
      const lens = document.createElement('span');
      lens.className = 'image-lens';
      lens.setAttribute('aria-hidden', 'true');
      lens.style.backgroundImage = `url("${image.getAttribute('src')}")`;
      media.append(lens);
      media.addEventListener('pointerenter', () => media.classList.add('is-magnifying'));
      media.addEventListener('pointerleave', () => media.classList.remove('is-magnifying'));
      media.addEventListener('pointermove', event => {
        const bounds = media.getBoundingClientRect();
        const x = Math.min(bounds.width, Math.max(0, event.clientX - bounds.left));
        const y = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));
        lens.style.left = `${x}px`;
        lens.style.top = `${y}px`;
        lens.style.backgroundSize = '240% 240%';
        lens.style.backgroundPosition = `${x / bounds.width * 100}% ${y / bounds.height * 100}%`;
      });
    });
  }
  if (!window.gsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline().from('.hero-copy>*',{y:42,opacity:0,duration:.9,stagger:.1,ease:'power3.out'}).from('.hero-photo',{scale:1.1,duration:1.5,ease:'power3.out'},0);
  gsap.to('.hero-photo',{scale:1.08,yPercent:6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.to('.lens-a',{rotate:70,xPercent:-15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
  gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:65,opacity:0,duration:1,scrollTrigger:{trigger:el,start:'top 82%'}}));
  gsap.utils.toArray('.frame-card').forEach((card,i)=>gsap.from(card,{scale:.86,opacity:.35,rotateX:8,duration:1,scrollTrigger:{trigger:card,start:'top 90%',end:'top 35%',scrub:.8}}));
  gsap.to('.orbital',{rotate:180,ease:'none',scrollTrigger:{trigger:'.location',start:'top bottom',end:'bottom top',scrub:1}});
  ScrollTrigger.create({start:40,onUpdate:self=>document.querySelector('#nav').classList.toggle('scrolled',self.scroll()>40)});
  addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
})();
