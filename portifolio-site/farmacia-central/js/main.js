(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuBtn = document.querySelector('.menu-btn'); const menu = document.querySelector('#menu');
  menuBtn?.addEventListener('click', () => { const open=menu.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',String(open)); menuBtn.innerHTML=`<i class="ph ph-${open?'x':'list'}"></i>`; });
  menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>menu.classList.remove('open')));

  const stores=[...document.querySelectorAll('.store')]; const copy=document.querySelector('#selected-copy'); const contact=document.querySelector('#store-contact');
  function selectStore(store){stores.forEach(item=>item.classList.toggle('active',item===store));const unit=store.dataset.unit;const phone=store.dataset.phone;copy.textContent=`Unidade ${unit} selecionada. Envie o que procura para a equipe confirmar estoque, valor e entrega.`;contact.href=`https://wa.me/${phone}?text=${encodeURIComponent('Olá! Gostaria de consultar um produto e saber sobre entrega.')}`;}
  stores.forEach(store=>{store.querySelector('button').addEventListener('click',()=>selectStore(store));store.addEventListener('click',event=>{if(event.target.closest('button'))return;selectStore(store)});});

  document.querySelectorAll('.care-card').forEach(card=>{const activate=()=>{document.querySelectorAll('.care-card').forEach(item=>item.classList.remove('active'));card.classList.add('active')};card.addEventListener('click',activate);card.addEventListener('focus',activate);});
  if(!window.gsap||reduce)return;gsap.registerPlugin(ScrollTrigger);
  gsap.timeline().from('.hero-copy > *',{y:38,opacity:0,duration:.85,stagger:.09,ease:'power3.out'}).from('.hero-media',{clipPath:'inset(18% 0 0 22%)',scale:.94,duration:1.25,ease:'power3.out'},0);
  gsap.to('.hero-media > img',{scale:1.08,yPercent:6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.to('.care-ring',{rotate:150,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.to('.care-photo img',{yPercent:-11,ease:'none',scrollTrigger:{trigger:'.care-stage',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.utils.toArray('.care-card').forEach((card,index)=>{if(index===3)return;gsap.to(card,{scale:.94-(index*.012),opacity:.62,ease:'none',scrollTrigger:{trigger:document.querySelectorAll('.care-card')[index+1],start:'top bottom',end:'top top',scrub:true}})});
  gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:60,opacity:0,duration:1,scrollTrigger:{trigger:el,start:'top 84%'}}));
  gsap.to('.cross-3d',{rotateZ:120,rotateX:78,ease:'none',scrollTrigger:{trigger:'.service',start:'top bottom',end:'bottom top',scrub:1}});
  ScrollTrigger.create({start:40,onUpdate:self=>document.querySelector('#nav').classList.toggle('scrolled',self.scroll()>40)});addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
})();
