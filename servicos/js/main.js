/* =========================================================
   Monta a página a partir do dados.js e cuida das interações.
   Nenhum texto de venda mora aqui.
   ========================================================= */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const raiz = document.documentElement;
  const fino = matchMedia("(pointer: fine)").matches;

  /* ---------- movimento ---------- ==========================
     O Windows tem uma opção de "reduzir movimento" que deixa
     prefers-reduced-motion em "reduce". Respeitar isso é certo,
     mas congelar a página inteira sem saída não é: quem quiser
     ver o movimento liga no botão, e a escolha fica salva.
     ========================================================= */
  const btMov = $("#mov");
  // Padrão LIGADO, de propósito. O respeito ao "reduzir movimento" do
  // sistema virou o botão: quem precisa desliga em um clique e a escolha
  // fica salva. Deixar o padrão no sistema entregava a página inteira
  // parada pra quem tem a opção ligada, sem nem saber que havia movimento.
  let mov = (localStorage.getItem("mov") ?? "on") === "on";

  function aplicarMov() {
    raiz.dataset.mov = mov ? "on" : "off";
    btMov.setAttribute("aria-pressed", String(mov));
    $(".mov-txt", btMov).textContent = mov ? "movimento" : "sem movimento";
  }
  btMov.addEventListener("click", () => {
    mov = !mov;
    localStorage.setItem("mov", mov ? "on" : "off");
    aplicarMov();
    if (mov) tocarVideos();
  });
  aplicarMov();

  /* ---------- WhatsApp ---------- */
  const zap = (texto) =>
    `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(texto)}`;

  const ligarZap = (el) => {
    el.href = zap(el.dataset.zap || "Oi!");
    el.target = "_blank";
    el.rel = "noopener";
  };
  $$("[data-zap]").forEach(ligarZap);

  /* ---------- Instagram ---------- */
  if (CONTATO.instagram) {
    const url = `https://instagram.com/${CONTATO.instagram}`;
    const bt = $("#bt-insta"), pe = $("#rodape-insta");
    bt.href = url; $("span", bt).textContent = `@${CONTATO.instagram}`;
    pe.href = url; pe.textContent = `@${CONTATO.instagram}`;
  } else {
    $("#bt-insta").remove(); $("#rodape-insta").remove();
  }

  const ico = (id, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"/></svg>`;

  /* ---------- cardápio (menu + painel) ---------- */
  const menuCard = $("#cardapio-menu");
  const telaCard = $("#cardapio-tela");

  menuCard.insertAdjacentHTML("afterbegin", SERVICOS.map((s, i) => `
    <button class="item" role="tab" type="button" id="aba-${s.id}"
            aria-controls="painel" aria-selected="${i === 0}"
            tabindex="${i === 0 ? 0 : -1}"
            data-id="${s.id}" style="--cor: var(--${s.cor})">
      ${ico(s.icone, "item-ico")}
      <span class="item-nome">${esc(s.nome)}</span>
      <span class="item-preco">${esc(s.preco)}</span>
    </button>`).join(""));

  const abas = $$(".item", menuCard);
  const marca = $(".cardapio-marca", menuCard);

  function pintarPainel(s) {
    telaCard.style.setProperty("--cor", `var(--${s.cor})`);
    telaCard.innerHTML = `
      <div class="painel" id="painel" role="tabpanel" aria-labelledby="aba-${s.id}">
        <div class="painel-cab">
          ${ico(s.icone, "painel-ico")}
          <div>
            <h3>${esc(s.nome)}</h3>
            <p class="painel-frase">${esc(s.frase)}</p>
          </div>
          ${s.adicional ? `<span class="painel-selo">adicional</span>` : ""}
          ${s.aplicacao ? `<span class="painel-selo">aplicação</span>` : ""}
        </div>
        <p class="painel-resumo">${esc(s.resumo)}</p>
        <ul class="painel-itens">
          ${s.itens.map((i, n) => `<li style="--n:${n}">${esc(i)}</li>`).join("")}
        </ul>
        <div class="painel-pe">
          <p class="painel-preco">${esc(s.preco)}${s.selo ? `<span>${esc(s.selo)}</span>` : ""}</p>
          <p class="painel-nota">${esc(s.nota)}</p>
        </div>
        <div class="painel-bts">
          <a class="bt bt-cheio" href="#pedido" data-pega="${s.id}">Pedir este</a>
          <a class="bt bt-vazio" data-zap="Oi! Queria falar sobre: ${s.nome}.">Tirar dúvida</a>
        </div>
      </div>`;
    $$("[data-zap]", telaCard).forEach(ligarZap);
    $$("[data-pega]", telaCard).forEach((a) => a.addEventListener("click", () => {
      const alvo = $(`input[name="servico"][value="${a.dataset.pega}"]`);
      if (alvo) { alvo.checked = true; atualizar(); }
    }));
  }

  // a marca corre até a aba ativa; serve na coluna (desktop) e na fila (celular)
  function moverMarca(aba) {
    marca.style.setProperty("--x", `${aba.offsetLeft}px`);
    marca.style.setProperty("--y", `${aba.offsetTop}px`);
    marca.style.setProperty("--w", `${aba.offsetWidth}px`);
    marca.style.setProperty("--h", `${aba.offsetHeight}px`);
    marca.style.setProperty("--cor", getComputedStyle(aba).getPropertyValue("--cor"));
  }

  function escolher(id, focar) {
    const s = SERVICOS.find((x) => x.id === id);
    abas.forEach((a) => {
      const meu = a.dataset.id === id;
      a.setAttribute("aria-selected", String(meu));
      a.tabIndex = meu ? 0 : -1;
      if (meu) { moverMarca(a); if (focar) a.focus(); }
    });
    pintarPainel(s);
  }

  abas.forEach((a) => a.addEventListener("click", () => escolher(a.dataset.id)));

  // setas do teclado andam pelo menu, como manda um tablist
  menuCard.addEventListener("keydown", (ev) => {
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
    if (!passo) return;
    ev.preventDefault();
    const i = abas.findIndex((a) => a.getAttribute("aria-selected") === "true");
    escolher(abas[(i + passo + abas.length) % abas.length].dataset.id, true);
  });

  escolher(SERVICOS[0].id);
  addEventListener("resize", () => {
    const viva = abas.find((a) => a.getAttribute("aria-selected") === "true");
    if (viva) moverMarca(viva);
  });

  /* ---------- trabalhos em vídeo ---------- */
  $("#obras").innerHTML = TRABALHOS.map((t) => `
    <figure class="obra" data-obra="${t.video}">
      <button class="obra-tela" type="button"
              aria-expanded="false" aria-label="Ver por inteiro: ${esc(t.ramo)}">
        <video src="assets/video/${t.video}-loop.mp4"
               poster="assets/video/${t.video}-capa.jpg"
               muted loop playsinline preload="none"
               width="720" height="422"></video>
        <span class="obra-abrir">ver por inteiro</span>
      </button>
      <figcaption class="obra-pe">
        <p class="obra-ramo">${esc(t.ramo)}</p>
        <p class="obra-nota">${esc(t.nota)}</p>
      </figcaption>
    </figure>`).join("");

  const obras = $$(".obra");

  // o loop só baixa e roda quando o card aparece; fora da tela, pausa
  function tocarVideos() {
    obras.forEach((o) => {
      const v = $("video", o);
      const naTela = o.getBoundingClientRect().top < innerHeight && o.getBoundingClientRect().bottom > 0;
      if (naTela) { v.preload = "auto"; v.play().catch(() => {}); }
    });
  }
  const olhoVideo = new IntersectionObserver((es) => {
    es.forEach((e) => {
      const v = $("video", e.target);
      if (e.target.classList.contains("aberta")) return;   // aberto manda no play
      if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.3 });
  obras.forEach((o) => olhoVideo.observe(o));

  obras.forEach((obra) => {
    const bt = $(".obra-tela", obra);
    const v = $("video", obra);
    const selo = $(".obra-abrir", obra);
    const nome = obra.dataset.obra;

    bt.addEventListener("click", () => {
      const abrindo = !obra.classList.contains("aberta");

      // só um aberto por vez
      obras.forEach((o) => {
        if (o === obra) return;
        o.classList.remove("aberta");
        const ov = $("video", o), ob = $(".obra-tela", o);
        ob.setAttribute("aria-expanded", "false");
        $(".obra-abrir", o).textContent = "ver por inteiro";
        ov.controls = false; ov.muted = true; ov.loop = true;
        if (ov.dataset.curto) { ov.src = ov.dataset.curto; delete ov.dataset.curto; }
        ov.play().catch(() => {});
      });

      obra.classList.toggle("aberta", abrindo);
      bt.setAttribute("aria-expanded", String(abrindo));

      if (abrindo) {
        v.dataset.curto = v.getAttribute("src");
        v.src = `assets/video/${nome}-full.mp4`;
        v.controls = true; v.loop = false;
        selo.textContent = "fechar";
        obra.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        v.src = v.dataset.curto; delete v.dataset.curto;
        v.controls = false; v.loop = true; v.muted = true;
        selo.textContent = "ver por inteiro";
      }
      v.play().catch(() => {});
    });
  });

  /* ---------- sistemas ---------- */
  $("#sist").innerHTML = SISTEMAS.map((s) => `
    <li>
      ${ico(s.icone, "sist-ico")}
      <div>
        <span class="sist-nome">${esc(s.nome)}</span>
        <span class="sist-quem">${esc(s.quem)}</span>
      </div>
      <p class="sist-oq">${esc(s.o_que)}</p>
    </li>`).join("");

  /* ---------- passos ---------- */
  $("#passos").innerHTML = PASSOS.map((p) => `
    <li>${ico(p.icone, "passo-ico")}<h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></li>`).join("");

  /* ---------- dúvidas ---------- */
  $("#lista-duvidas").innerHTML = PERGUNTAS.map((q) => `
    <div><dt>${esc(q.p)}</dt><dd>${esc(q.r)}</dd></div>`).join("");

  /* ---------- montador ---------- */
  const EXTRAS = [
    {
      id: "bot", nome: "Atendente de IA", valor: 70, preco: "+ R$ 70",
      desc: "Uma vez só. Sem mensalidade, sem renovação."
    },
    {
      id: "dominio", nome: "Domínio próprio", valor: 0, preco: "pago ao registrador",
      desc: "Cerca de R$ 40 por ano, direto no registrador. Não passa por mim."
    }
  ];

  const PEDIVEIS = SERVICOS.filter((s) => s.id !== "bot");

  $("#esc-servico").innerHTML = PEDIVEIS.map((s, i) => `
    <label class="esc" style="--cor: var(--${s.cor})">
      <input type="radio" name="servico" value="${s.id}" ${i === 0 ? "checked" : ""} />
      <span>
        <span class="esc-nome">${esc(s.nome)}</span>
        <span class="esc-preco">${esc(s.preco)}</span>
        <span class="esc-desc">${esc(s.frase)}</span>
      </span>
    </label>`).join("");

  $("#esc-extras").innerHTML = EXTRAS.map((e) => `
    <label class="esc">
      <input type="checkbox" name="extra" value="${e.id}" ${e.id === "bot" ? "checked" : ""} />
      <span>
        <span class="esc-nome">${esc(e.nome)}</span>
        <span class="esc-preco">${esc(e.preco)}</span>
        <span class="esc-desc">${esc(e.desc)}</span>
      </span>
    </label>`).join("");

  const btFechar = $("#bt-fechar");

  const ler = () => ({
    servico: SERVICOS.find((s) => s.id === $('input[name="servico"]:checked').value),
    extras: $$('input[name="extra"]:checked').map((c) => EXTRAS.find((e) => e.id === c.value)),
    negocio: $("#in-negocio").value.trim(),
    insta: $("#in-insta").value.trim(),
    obs: $("#in-obs").value.trim()
  });

  // só a landing tem piso publicado; o resto é sob consulta de verdade
  const estimar = (p) => {
    const soma = p.extras.reduce((t, e) => t + e.valor, 0);
    if (p.servico.id === "landing") return `a partir de R$ ${400 + soma}`;
    return soma ? `sob consulta + R$ ${soma}` : "sob consulta";
  };

  const texto = (p, fechando) => {
    const l = [fechando ? "Oi! Quero fechar um pedido pelo site:" : "Oi! Montei um pedido no site:", ""];
    l.push(`Serviço: ${p.servico.nome}`);
    p.extras.forEach((e) => l.push(`Adicional: ${e.nome} (${e.preco})`));
    l.push(`Estimativa da página: ${estimar(p)}`);
    if (p.negocio) l.push(`Negócio: ${p.negocio}`);
    if (p.insta) l.push(`Instagram: ${p.insta}`);
    if (p.obs) l.push("", `Preciso resolver: ${p.obs}`);
    return l.join("\n");
  };

  function atualizar() {
    const p = ler();
    $("#conta-linhas").innerHTML = [
      `<li><span>${esc(p.servico.nome)}</span><span>${esc(p.servico.preco)}</span></li>`,
      ...p.extras.map((e) => `<li><span>${esc(e.nome)}</span><span>${e.valor ? "R$ " + e.valor : "à parte"}</span></li>`)
    ].join("");
    $("#conta-total").textContent = estimar(p);
    $("#conta-aviso").textContent = p.servico.id === "landing"
      ? "R$ 400 é o piso. O valor fechado depende do tamanho da página, e eu digo antes de você pagar."
      : "Sem piso publicado porque varia demais. Fechamos o valor depois que eu entender o projeto.";

    const link = PAGAMENTO[p.servico.id];
    btFechar.textContent = link ? "Pagar agora" : "Quero fechar agora";
    btFechar.dataset.link = link || "";
  }

  $("#pedido").addEventListener("input", atualizar);
  atualizar();

  $("#bt-zap").addEventListener("click", () =>
    open(zap(texto(ler(), false)), "_blank", "noopener"));

  btFechar.addEventListener("click", () => {
    // sem link de pagamento configurado, o botão vira intenção de fechar
    const link = btFechar.dataset.link;
    open(link || zap(texto(ler(), true)), "_blank", "noopener");
  });

  $$("[data-pega]").forEach((a) => a.addEventListener("click", () => {
    const alvo = $(`input[name="servico"][value="${a.dataset.pega}"]`);
    if (alvo) { alvo.checked = true; atualizar(); }
  }));

  /* ---------- topo ---------- */
  const topo = $("#topo"), menu = $("#menu"), hamb = $("#hamb"), fixo = $(".zap-fixo");

  hamb.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    hamb.setAttribute("aria-expanded", String(aberto));
  });
  $$(".menu a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("aberto");
    hamb.setAttribute("aria-expanded", "false");
  }));

  addEventListener("scroll", () => {
    topo.classList.toggle("fixa", scrollY > 8);
    fixo.classList.toggle("ver", scrollY > innerHeight * 0.9);
  }, { passive: true });

  const olhoSecao = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      $$(".menu a").forEach((a) =>
        a.classList.toggle("aqui", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => olhoSecao.observe(s));

  /* ---------- a abertura digita ---------- ==================
     Roda mesmo com movimento desligado: trocar palavra é
     mudança de texto, não coisa se mexendo na tela. Sem
     movimento, ela só troca mais rápido e o cursor para de
     piscar (isso o CSS resolve).
     ========================================================= */
  const alvoDigita = $("#digita");
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  (async () => {
    let i = 1;   // a primeira palavra já está escrita no HTML
    for (;;) {
      const palavra = DIGITA[i % DIGITA.length];
      // ritmo de gente digitando, não de máquina: a tecla cai em ~135ms,
      // apagar é mais rápido que escrever, e a frase pronta fica um tempo
      // parada pra dar pra ler.
      const apagar = mov ? 78 : 20, bater = mov ? 135 : 26;
      for (let n = alvoDigita.textContent.length; n > 0; n--) {
        alvoDigita.textContent = alvoDigita.textContent.slice(0, n - 1);
        await espera(apagar + Math.random() * 26);
      }
      await espera(420);
      for (let n = 1; n <= palavra.length; n++) {
        alvoDigita.textContent = palavra.slice(0, n);
        await espera(bater + Math.random() * 55);
      }
      await espera(mov ? 2600 : 3000);
      i++;
    }
  })();

  /* ---------- cascata dos cards (a lista, não a página toda) ---------- */
  const olhoCard = new IntersectionObserver((es, obs) => {
    es.forEach((e) => {
      if (!e.isIntersecting || !mov) return;
      e.target.classList.add("entra");
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$(".obra, .passos li").forEach((c) => olhoCard.observe(c));

  if (!fino) return;   // o resto é ponteiro; no toque não existe

  /* ---------- brilho que segue o ponteiro nos cards ---------- */
  $$(".cardapio, .obra").forEach((c) => c.addEventListener("pointermove", (ev) => {
    if (!mov) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${((ev.clientX - r.left) / r.width) * 100}%`);
    c.style.setProperty("--my", `${((ev.clientY - r.top) / r.height) * 100}%`);
  }));

  /* ---------- pilha 3D acompanha o ponteiro ---------- */
  const palco = $(".pilha-palco");
  if (palco) {
    const pilha = $("#pilha");
    let parado;
    pilha.addEventListener("pointermove", (ev) => {
      if (!mov) return;
      const r = pilha.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      palco.style.setProperty("--ry", `${-17 + x * 14}deg`);
      palco.style.setProperty("--rx", `${6 - y * 10}deg`);
      clearTimeout(parado);
    });
    pilha.addEventListener("pointerleave", () => {
      parado = setTimeout(() => {
        palco.style.removeProperty("--ry");
        palco.style.removeProperty("--rx");
      }, 120);
    });
  }
})();
