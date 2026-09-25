/* =========================================================================
   WIDGET DE CHAT DE IA — botão flutuante + caixinha com o agente

   Este arquivo era colado inteiro dentro do index.html de cada site (5 cópias
   das mesmas ~60 linhas). Agora é um arquivo só: pra um cliente novo, mexer
   apenas no bloco AJUSTE AQUI e mais nada.

   Ele NÃO pode virar um arquivo compartilhado entre os sites (tipo
   ../_comum/chat.js): cada site é publicado sozinho, com o conteúdo da pasta
   na raiz do próprio repo, então o caminho pra fora quebraria no ar.
   O reuso acontece na hora de copiar a pasta-modelo.
   ========================================================================= */

(function () {
  /* ----------------------------------------------------- AJUSTE AQUI ----- */

  const AGENTE = 'fisioclin';          // nome da chave no agents.yaml
  const COR = '7a4a34';                // terracota da logo, SEM o # (vai na URL)
  const TITULO = 'Atendimento Fisioclin';        // title do iframe (acessibilidade)
  const CHAMADA = 'Dúvida de qual especialidade?';   // balãozinho que aparece sozinho
  const COR_TEXTO = '#fdf8f4';         // texto sobre a cor da marca
  const COR_CLARA = '#a5735a';         // 2º tom do gradiente do botão

  /* ----------------------------------------------------------------------- */

  const APP = 'https://agentes-s68ksrzb97z5q4qqp7f8nq.streamlit.app/';
  const url = `${APP}?agente=${AGENTE}&embed=true&cor=${COR}`;
  const WHATSAPP = 'https://wa.me/5585994118007';

  const css = document.createElement('style');
  css.textContent = `
    #sb-chat-btn{position:fixed;right:20px;bottom:20px;width:62px;height:62px;border-radius:50%;
      border:0;cursor:pointer;background:linear-gradient(140deg,#${COR},${COR_CLARA});
      color:${COR_TEXTO};font-size:26px;line-height:1;z-index:960;
      box-shadow:0 14px 34px rgba(70,40,25,.34);transition:transform .25s ease}
    #sb-chat-btn:hover{transform:scale(1.08) rotate(-6deg)}
    #sb-chat-btn::after{content:'';position:absolute;inset:-6px;border-radius:50%;
      border:2px solid rgba(122,74,52,.45);animation:sb-pulso 2.4s ease-out infinite}
    @keyframes sb-pulso{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.35);opacity:0}}
    #sb-chat-balao{position:fixed;right:94px;bottom:32px;background:#fff;color:#2b1f1a;
      font-family:inherit;font-size:.9rem;padding:10px 16px;border-radius:999px;
      box-shadow:0 10px 28px rgba(70,40,25,.18);z-index:959;opacity:0;transform:translateY(6px);
      transition:.4s ease;pointer-events:none;white-space:nowrap}
    #sb-chat-balao.mostra{opacity:1;transform:translateY(0)}
    #sb-chat-box{position:fixed;right:20px;bottom:94px;width:380px;height:560px;
      max-height:calc(100vh - 114px);max-height:calc(100dvh - 114px);
      border:2px solid #${COR};border-radius:14px;overflow:hidden;background:#fff;
      box-shadow:0 24px 60px rgba(70,40,25,.28);z-index:960;display:none}
    #sb-chat-box.aberto{display:grid;grid-template-rows:auto minmax(0,1fr) auto}
    #sb-chat-cabecalho{display:flex;align-items:center;justify-content:space-between;
      gap:8px;padding:4px 8px 4px 16px;background:#${COR};color:${COR_TEXTO};font-size:.9rem}
    #sb-chat-fechar{border:0;background:transparent;color:inherit;font-size:1.4rem;
      min-width:44px;min-height:44px;cursor:pointer}
    #sb-chat-box iframe{width:100%;height:100%;min-height:0;border:0;display:block}
    #sb-chat-alternativa{display:block;padding:12px 16px;font-size:.85rem;
      line-height:1.4;text-align:center;color:#${COR};background:#f7f4ef;text-decoration:underline}
    #sb-chat-btn:focus-visible,#sb-chat-alternativa:focus-visible{outline:3px solid #${COR};outline-offset:3px}
    #sb-chat-fechar:focus-visible{outline:2px solid ${COR_TEXTO};outline-offset:-4px}
    @media (max-width:480px){#sb-chat-box{right:8px;left:8px;width:auto;height:72vh}
      #sb-chat-balao{display:none}}
    @media (prefers-reduced-motion: reduce){#sb-chat-btn::after{animation:none;opacity:.5}
      #sb-chat-btn,#sb-chat-balao{transition:none}#sb-chat-btn:hover{transform:none}}
  `;
  document.head.appendChild(css);

  const balao = document.createElement('div');
  balao.id = 'sb-chat-balao';
  balao.textContent = CHAMADA;

  const btn = document.createElement('button');
  btn.id = 'sb-chat-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Abrir atendimento');
  btn.setAttribute('aria-controls', 'sb-chat-box');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.textContent = '💬';

  const box = document.createElement('div');
  box.id = 'sb-chat-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-labelledby', 'sb-chat-titulo');
  box.hidden = true;

  const cabecalho = document.createElement('div');
  cabecalho.id = 'sb-chat-cabecalho';
  const titulo = document.createElement('strong');
  titulo.id = 'sb-chat-titulo';
  titulo.textContent = TITULO;
  const fechar = document.createElement('button');
  fechar.id = 'sb-chat-fechar';
  fechar.type = 'button';
  fechar.textContent = '×';
  fechar.setAttribute('aria-label', 'Fechar atendimento');
  cabecalho.append(titulo, fechar);

  // O contato fica disponível mesmo se o serviço externo do chat não carregar.
  const alternativa = document.createElement('a');
  alternativa.id = 'sb-chat-alternativa';
  alternativa.href = WHATSAPP;
  alternativa.target = '_blank';
  alternativa.rel = 'noopener';
  alternativa.textContent = 'Falar com a recepção pelo WhatsApp ↗';
  box.append(cabecalho, alternativa);
  let carregado = false;

  function alternar(aberto) {
    // o iframe só nasce no primeiro clique: carregar o app do Streamlit junto
    // com a página atrasaria o site inteiro por algo que a maioria não abre
    if (aberto && !carregado) {
      const frame = document.createElement('iframe');
      frame.src = url;
      frame.title = TITULO;
      box.insertBefore(frame, alternativa);
      carregado = true;
    }
    box.hidden = !aberto;
    box.classList.toggle('aberto', aberto);
    balao.classList.remove('mostra');
    btn.textContent = aberto ? '✕' : '💬';
    btn.setAttribute('aria-expanded', String(aberto));
    btn.setAttribute('aria-label', aberto ? 'Fechar atendimento' : 'Abrir atendimento');
    if (aberto) fechar.focus();
    else btn.focus();
  }

  btn.addEventListener('click', () => alternar(box.hidden));
  fechar.addEventListener('click', () => alternar(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !box.hidden) {
      event.preventDefault();
      alternar(false);
    }
  });

  document.body.appendChild(box);
  document.body.appendChild(balao);
  document.body.appendChild(btn);

  setTimeout(() => { if (!box.classList.contains('aberto')) balao.classList.add('mostra'); }, 4500);
  setTimeout(() => balao.classList.remove('mostra'), 14000);
})();
