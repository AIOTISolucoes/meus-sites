/* =========================================================
   FÉLIX: intro desenhada + animações de traço
   ========================================================= */
gsap.registerPlugin(ScrollTrigger);

function prepararTraco(el) {
  const len = el.getTotalLength();
  el.style.strokeDasharray = len;
  el.style.strokeDashoffset = len;
  return len;
}

/* ===== INTRO: trigo e pão nascem traço por traço ===== */
const trigo1 = document.getElementById("i-trigo1");
const trigo2 = document.getElementById("i-trigo2");
const trigo3 = document.getElementById("i-trigo3");
const pao = document.getElementById("i-pao");
const corte1 = document.getElementById("i-corte1");
const corte2 = document.getElementById("i-corte2");
const corte3 = document.getElementById("i-corte3");

[trigo1, trigo2, trigo3, pao, corte1, corte2, corte3].forEach(prepararTraco);
gsap.set("#i-texto", { opacity: 0, y: 8 });
gsap.set("#i-sub", { opacity: 0, y: 8 });

const intro = gsap.timeline();
intro
  .to(trigo1, { strokeDashoffset: 0, duration: .6, ease: "power2.inOut" }, .3)
  .to([trigo2, trigo3], { strokeDashoffset: 0, duration: .5, ease: "power2.inOut", stagger: .1 }, "-=.3")
  .to(pao, { strokeDashoffset: 0, duration: .9, ease: "power2.inOut" }, "-=.15")
  .to([corte1, corte2, corte3], { strokeDashoffset: 0, duration: .4, ease: "power2.out", stagger: .08 }, "-=.4")
  .to("#i-texto", { opacity: 1, y: 0, duration: .45 }, "-=.1")
  .to("#i-sub", { opacity: 1, y: 0, duration: .4 }, "-=.2")
  .to(".intro-logo", { scale: .92, duration: .5, ease: "power2.inOut" }, "+=.45")
  .to("#intro", { yPercent: -100, duration: .75, ease: "power4.inOut" }, "-=.15")
  .set("#intro", { display: "none" });

/* ===== entrada do hero ===== */
gsap.timeline({ defaults: { ease: "power3.out" } })
  .from(".nav", { y: -70, opacity: 0, duration: .6 }, 3.35)
  .from(".selo", { opacity: 0, x: -24, duration: .45 }, 3.5)
  .from(".hero-titulo .palavra", { opacity: 0, y: 44, stagger: .08, duration: .55 }, 3.6)
  .from([".hero-sub", ".hero-cta", ".provas"], { opacity: 0, y: 26, stagger: .12, duration: .5 }, 4.05)
  .from(".hero-visual .foto-emoldurada", { opacity: 0, scale: .6, y: 60, duration: .65, ease: "back.out(1.7)", clearProps: "opacity" }, 3.8)
  .from(".hero-visual .icone-flutua", { scale: 0, stagger: .1, duration: .4, ease: "back.out(3)" }, 4.2)
  .add(() => {
    const risco = document.querySelector(".risco path");
    prepararTraco(risco);
    gsap.to(risco, { strokeDashoffset: 0, duration: .7, ease: "power2.inOut" });
  }, 4.15);

/* ícones flutuantes do hero balançam */
document.querySelectorAll(".icone-flutua").forEach((icone, i) => {
  gsap.to(icone, { y: "+=14", rotate: `+=${i % 2 ? 3 : -3}`, duration: 2.6 + i * .4, ease: "sine.inOut", yoyo: true, repeat: -1 });
});
gsap.to(".foto-hero", { y: "+=10", rotate: "+=1.5", duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });

/* ===== ícones do cardápio se desenham ao entrar na tela ===== */
document.querySelectorAll(".serv-icone").forEach((icone) => {
  const shapes = icone.querySelectorAll("path, rect, circle");
  shapes.forEach(prepararTraco);
  ScrollTrigger.create({
    trigger: icone,
    start: "top 88%",
    once: true,
    onEnter: () => gsap.to(shapes, {
      strokeDashoffset: 0, duration: 1.1, stagger: .18, ease: "power2.inOut",
    }),
  });
});

/* ===== ponto de divisória escorrega no scroll ===== */
const pontinho = document.querySelector(".pontinho");
if (pontinho) {
  gsap.to(pontinho, {
    left: "92%", rotate: 360,
    ease: "none",
    scrollTrigger: { trigger: ".linha-divisoria", start: "top 95%", end: "top 25%", scrub: 1 },
  });
}

/* ===== blocos entram ao rolar ===== */
gsap.utils.toArray(".titulo").forEach((t) => {
  gsap.from(t, {
    opacity: 0, y: 40, duration: .6, ease: "power3.out",
    scrollTrigger: { trigger: t, start: "top 86%" },
  });
});
ScrollTrigger.batch(".serv, .kit-card", {
  start: "top 90%", once: true,
  onEnter: (els) => gsap.from(els, {
    opacity: 0, y: 40, stagger: .09, duration: .55, ease: "power2.out",
    clearProps: "opacity,transform",
  }),
});
gsap.from(".prato-caixa", {
  opacity: 0, scale: .92, duration: .7, ease: "back.out(1.6)",
  scrollTrigger: { trigger: ".prato-dia", start: "top 78%" },
});
gsap.from(".foto-galeria", {
  opacity: 0, x: -60, rotate: -8, duration: .8, ease: "power3.out",
  scrollTrigger: { trigger: ".galeria", start: "top 72%" },
});
gsap.from(".galeria-lista li", {
  opacity: 0, x: 40, stagger: .1, duration: .5,
  scrollTrigger: { trigger: ".galeria-lista", start: "top 86%" },
});
gsap.from(".sobre-selo img", {
  opacity: 0, scale: .8, rotate: 8, duration: .8, ease: "back.out(1.6)",
  scrollTrigger: { trigger: ".sobre", start: "top 72%" },
});
gsap.from(".sobre-lista li", {
  opacity: 0, x: 40, stagger: .1, duration: .5,
  scrollTrigger: { trigger: ".sobre-lista", start: "top 86%" },
});
gsap.from(".convite-caixa", {
  opacity: 0, scale: .9, duration: .7, ease: "back.out(1.6)",
  scrollTrigger: { trigger: ".convite", start: "top 78%" },
});
