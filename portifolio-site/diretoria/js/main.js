/* =========================================================================
   DIRETORIA BARBER — animações
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

/* "Movimento reduzido" não é "tela parada": quem liga isso quer menos
   agitação, não um site morto. A regra da casa é cortar o que se repete
   sozinho pra sempre e o que persegue o ponteiro — nunca congelar tudo.
   Atenção: o PC do usuário reporta reduce (animações do Windows desligadas),
   então é ESTE o caminho que ele vê. Testar sempre nos dois. */
const suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- INTRO
   A logo é uma COROA sobre um BIGODE. A coroa se desenha traço a traço; o
   bigode é preenchido (em contorno vira rabisco, mesma lição do LS) e por
   isso entra por escala. */

document.querySelectorAll('#logo-intro .tr').forEach(p => {
  const tam = p.getTotalLength();
  gsap.set(p, { strokeDasharray: tam, strokeDashoffset: tam });
});
gsap.set('#logo-intro .bigode', { scale: 0, transformOrigin: '130px 106px' });

gsap.timeline()
  .to('#logo-intro .tr', { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut', stagger: .3 })
  .to('#logo-intro .bigode', { scale: 1, duration: .55, ease: 'back.out(1.6)' }, '-=.3')
  .to('#logo-intro .marca-nome', { opacity: 1, duration: .45 }, '-=.2')
  .to('#logo-intro .marca-sub', { opacity: 1, duration: .45 }, '-=.25')
  .to('.intro-marca', { scale: .95, duration: .45, ease: 'power2.inOut' }, '+=.35')
  .to('#intro', { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '-=.2')
  .set('#intro', { display: 'none' })
  .to('#nav', { y: 0, duration: .6, ease: 'power3.out' }, '-=.35')
  .from('.hero-titulo .linha > span', {
    yPercent: 115, duration: 1, ease: 'power4.out', stagger: .1,
  }, '-=.45')
  .from('#inicio .etiqueta', { opacity: 0, y: 12, duration: .6 }, '-=.7')
  .from('.hero-texto, .hero-acoes, .hero-dados', {
    opacity: 0, y: 22, duration: .7, stagger: .1,
  }, '-=.55')
  .from('.rolar', { opacity: 0, duration: .6 }, '-=.3');

/* -------------------------------------------- O GLOBO DO POSTE NO HERO
   Só transform, sem repintar nada: o efeito mais barato que ainda responde a
   quem está olhando. Fica de pé no movimento reduzido porque ele não se mexe
   sozinho — só acompanha o ponteiro. */

(function globoDoPoste() {
  const globo = document.getElementById('globo');
  const palco = document.getElementById('inicio');
  if (!globo || !palco) return;

  let alvoX = window.innerWidth * .7, alvoY = window.innerHeight * .46;
  let x = alvoX, y = alvoY, raf = null;

  function passo() {
    // atraso proposital: a luz de um globo pendurado não teleporta
    x += (alvoX - x) * .09;
    y += (alvoY - y) * .09;
    globo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (Math.abs(alvoX - x) > .5 || Math.abs(alvoY - y) > .5) {
      raf = requestAnimationFrame(passo);
    } else {
      raf = null;
    }
  }

  palco.addEventListener('pointermove', e => {
    const r = palco.getBoundingClientRect();
    alvoX = e.clientX - r.left;
    alvoY = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(passo);
  });
})();

/* ------------------------------------------------- REVELAÇÕES DE SEÇÃO */

gsap.utils.toArray('.titulo-secao').forEach(tit => {
  gsap.from(tit, {
    opacity: 0, y: 46, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: tit, start: 'top 86%' },
  });
});

gsap.utils.toArray('[data-item]').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0, x: -18, duration: .6, ease: 'power3.out',
    delay: (i % 6) * .07,
    scrollTrigger: { trigger: item, start: 'top 94%' },
  });
});

gsap.from('.placa', {
  opacity: 0, y: 40, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.placa', start: 'top 86%' },
});

gsap.from('.contato-caixa', {
  opacity: 0, scale: .96, duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.contato-caixa', start: 'top 86%' },
});

/* --------------------------------------------------- TRILHO HORIZONTAL */

const trilho = document.querySelector('.trilho-interno');
if (trilho && window.innerWidth > 760) {
  const percurso = () => trilho.scrollWidth - window.innerWidth;

  gsap.to(trilho, {
    x: () => -percurso(),
    ease: 'none',
    scrollTrigger: {
      trigger: trilho.closest('section'),
      start: 'top top',
      end: () => '+=' + percurso(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray('.painel-foto').forEach(foto => {
    gsap.from(foto, {
      y: 60, opacity: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: {
        trigger: foto,
        // sem isto o ScrollTrigger mede a foto pela rolagem VERTICAL e ela
        // nunca "entra na tela" — o painel fica invisível pra sempre
        containerAnimation: gsap.getTweensOf(trilho)[0],
        start: 'left 92%',
      },
    });
  });
}

/* nav ganha sombra ao sair do topo */
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: self => {
    gsap.to('#nav', {
      boxShadow: self.progress > 0 ? '0 10px 26px rgba(22,17,12,.18)' : 'none',
      duration: .3,
    });
  },
});

// fontes e imagens mudam a altura da página depois que os gatilhos já foram
// medidos; sem este refresh os ScrollTrigger disparam no lugar errado
window.addEventListener('load', () => ScrollTrigger.refresh());


/* =========================================================================
   SEÇÃO-ASSINATURA — A SEMANA

   O que a Diretoria tem que as outras duas barbearias do lote não têm: ela
   abre DOMINGO de manhã. E fecha para o almoço, o que ninguém avisa e é o
   que faz a pessoa bater na porta fechada.

   Então a assinatura é a semana inteira desenhada, com a linha da hora que se
   arrasta. O intervalo aparece como um buraco de verdade no meio da semana.

   ⚠️ FONTE DO HORÁRIO: a BIO do Instagram deles, que diz
   "Seg a Sab- 08:30 à 12hrs - 14:30 à 19hrs / Dom das 08:30 à 12hrs".
   A página de agendamento mostra 08:30–19:00 corrido, SEM o intervalo — é
   quase certo que o sistema deles só guarda a faixa externa. Escolhemos a
   bio por ser o que o dono escreveu com todas as letras. Se ele confirmar
   que não fecha para o almoço, mexer AQUI e no agente `diretoria_barber`.
   ========================================================================= */

(function aSemana() {
  const quadro = document.getElementById('semana-quadro');
  if (!quadro) return;

  const H0 = 8, H1 = 20;            // o eixo do desenho vai das 8h às 20h
  const MANHA = [8.5, 12];
  const TARDE = [14.5, 19];

  const DIAS = [
    { nome: 'Dom', longo: 'domingo',  blocos: [MANHA] },
    { nome: 'Seg', longo: 'segunda',  blocos: [MANHA, TARDE] },
    { nome: 'Ter', longo: 'terça',    blocos: [MANHA, TARDE] },
    { nome: 'Qua', longo: 'quarta',   blocos: [MANHA, TARDE] },
    { nome: 'Qui', longo: 'quinta',   blocos: [MANHA, TARDE] },
    { nome: 'Sex', longo: 'sexta',    blocos: [MANHA, TARDE] },
    { nome: 'Sáb', longo: 'sábado',   blocos: [MANHA, TARDE] },
  ];

  const elLinhas = document.getElementById('semana-linhas');
  const elHoras = document.getElementById('semana-horas');
  const elAgulha = document.getElementById('semana-agulha');
  const elHora = document.getElementById('semana-hora');
  const elFrase = document.getElementById('semana-frase');

  const pct = h => ((h - H0) / (H1 - H0)) * 100;

  // ---- monta as 7 linhas
  const linhas = DIAS.map(dia => {
    const el = document.createElement('div');
    el.className = 'dia';

    const nome = document.createElement('span');
    nome.className = 'dia-nome';
    nome.textContent = dia.nome;

    const trilhoDia = document.createElement('div');
    trilhoDia.className = 'dia-trilho';
    const blocos = dia.blocos.map(([a, b]) => {
      const bl = document.createElement('div');
      bl.className = 'dia-bloco';
      bl.style.left = pct(a) + '%';
      bl.style.width = (pct(b) - pct(a)) + '%';
      trilhoDia.appendChild(bl);
      return bl;
    });

    const estado = document.createElement('span');
    estado.className = 'dia-estado';

    el.append(nome, trilhoDia, estado);
    elLinhas.appendChild(el);
    return { dia, el, trilhoDia, blocos, estado };
  });

  // ---- as marcas de hora
  for (let h = H0; h <= H1; h += 2) {
    const s = document.createElement('span');
    s.textContent = h + 'h';
    s.style.left = pct(h) + '%';
    elHoras.appendChild(s);
  }

  const formata = h => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return hh + ':' + String(mm).padStart(2, '0');
  };

  function frase(abertos, hora) {
    if (abertos.length === 7) return 'Aberta nos sete dias da semana.';
    if (abertos.length === 6 && !abertos.includes('domingo'))
      return 'De segunda a sábado. No domingo eles só abrem de manhã.';
    if (abertos.length === 0) {
      if (hora >= MANHA[1] && hora < TARDE[0])
        return 'Intervalo do almoço — não tem ninguém atendendo.';
      if (hora < MANHA[0]) return 'Ainda não abriram: o primeiro horário é 8:30.';
      return 'Já fecharam. O último horário é às 19h.';
    }
    return 'Aberta só em: ' + abertos.join(', ') + '.';
  }

  let hora = 9;

  /* a agulha anda sobre o TRILHO, não sobre o quadro inteiro: as colunas do
     nome e do estado ocupam largura, e uma conta em % do quadro sairia
     deslocada. Por isso a posição vai em pixels medidos. */
  function moverAgulha() {
    const rq = quadro.getBoundingClientRect();
    const rt = linhas[0].trilhoDia.getBoundingClientRect();
    elAgulha.style.left = (rt.left - rq.left) + rt.width * (pct(hora) / 100) + 'px';
  }

  function aplicar(h) {
    hora = Math.max(H0, Math.min(H1, h));
    moverAgulha();
    elHora.textContent = formata(hora);

    const abertos = [];
    linhas.forEach(l => {
      let dentro = null;
      l.dia.blocos.forEach((faixa, i) => {
        const ok = hora >= faixa[0] && hora < faixa[1];
        l.blocos[i].classList.toggle('ativo', ok);
        if (ok) dentro = faixa;
      });
      l.el.classList.toggle('aberto', !!dentro);
      l.estado.textContent = dentro ? 'aberto' : 'fechado';
      if (dentro) abertos.push(l.dia.longo);
    });

    const texto = frase(abertos, hora);
    elFrase.textContent = texto;
    quadro.setAttribute('aria-valuenow', hora.toFixed(2));
    quadro.setAttribute('aria-valuetext', `${formata(hora)} — ${texto}`);
  }

  /* ---- arrastar ----
     a agulha tem que andar sobre o TRILHO, não sobre o quadro inteiro: as
     colunas do nome e do estado ocupam largura e a conta sairia deslocada */
  function horaDoEvento(e) {
    const r = linhas[0].trilhoDia.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width;
    return H0 + t * (H1 - H0);
  }

  let arrastando = false;
  quadro.addEventListener('pointerdown', e => {
    arrastando = true;
    quadro.setPointerCapture(e.pointerId);
    aplicar(horaDoEvento(e));
  });
  quadro.addEventListener('pointermove', e => { if (arrastando) aplicar(horaDoEvento(e)); });
  quadro.addEventListener('pointerup', e => { arrastando = false; quadro.releasePointerCapture(e.pointerId); });
  quadro.addEventListener('pointercancel', () => { arrastando = false; });

  quadro.addEventListener('keydown', e => {
    const passo = e.shiftKey ? 1 : 0.25;
    let v = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = hora + passo;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = hora - passo;
    else if (e.key === 'Home') v = H0;
    else if (e.key === 'End') v = H1;
    if (v === null) return;
    e.preventDefault();
    aplicar(v);
  });

  let temporizador = null;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(moverAgulha, 150);
  });
  window.addEventListener('load', moverAgulha);

  aplicar(9);
})();
