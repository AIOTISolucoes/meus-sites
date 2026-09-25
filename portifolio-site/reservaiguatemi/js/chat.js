/* =========================================================================
   WIDGET DE CHAT DE IA — botão flutuante + caixinha com o agente

   Cópia do _modelo com o bloco AJUSTE AQUI trocado para a Reserva Iguatemi.
   Não pode virar arquivo compartilhado entre os sites: cada um é publicado
   sozinho, com o conteúdo da pasta na raiz do próprio repo.
   ========================================================================= */

(function () {
  /* ----------------------------------------------------- AJUSTE AQUI ----- */

  const AGENTE = 'reserva_iguatemi';   // nome da chave no agents.yaml
  const COR = '9f092c';                // vermelho do letreiro, SEM o # (vai na URL)
  const TITULO = 'Atendimento Reserva Iguatemi Bosque';
  const CHAMADA = 'Procurando alguma peça? Fala comigo';
  const COR_TEXTO = '#fdf3ee';
  const COR_CLARA = '#d34a3a';

  /* ----------------------------------------------------------------------- */

  const APP = 'https://agentes-s68ksrzb97z5q4qqp7f8nq.streamlit.app/';
  const url = `${APP}?agente=${AGENTE}&embed=true&cor=${COR}`;

  const css = document.createElement('style');
  css.textContent = `
    #sb-chat-btn{position:fixed;right:20px;bottom:20px;width:62px;height:62px;border-radius:50%;
      border:0;cursor:pointer;background:linear-gradient(140deg,#${COR},${COR_CLARA});
      color:${COR_TEXTO};font-size:26px;line-height:1;z-index:960;
      box-shadow:0 14px 34px rgba(60,10,20,.36);transition:transform .25s ease}
    #sb-chat-btn:hover{transform:scale(1.08) rotate(-6deg)}
    #sb-chat-btn::after{content:'';position:absolute;inset:-6px;border-radius:50%;
      border:2px solid rgba(159,9,44,.45);animation:sb-pulso 2.4s ease-out infinite}
    @keyframes sb-pulso{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.35);opacity:0}}
    #sb-chat-balao{position:fixed;right:94px;bottom:32px;background:#fff;color:#241d19;
      font-family:inherit;font-size:.9rem;padding:10px 16px;border-radius:6px;
      box-shadow:0 10px 28px rgba(60,10,20,.18);z-index:959;opacity:0;transform:translateY(6px);
      transition:.4s ease;pointer-events:none;white-space:nowrap}
    #sb-chat-balao.mostra{opacity:1;transform:translateY(0)}
    #sb-chat-box{position:fixed;right:20px;bottom:94px;width:380px;height:560px;
      border:2px solid #${COR};border-radius:8px;overflow:hidden;background:#fff;
      box-shadow:0 24px 60px rgba(60,10,20,.3);z-index:960;display:none}
    #sb-chat-box.aberto{display:block}
    #sb-chat-box iframe{width:100%;height:100%;border:0;display:block}
    @media (max-width:480px){#sb-chat-box{right:8px;left:8px;width:auto;height:72vh}
      #sb-chat-balao{display:none}}
    @media (prefers-reduced-motion: reduce){#sb-chat-btn::after{animation:none;opacity:.5}}
  `;
  document.head.appendChild(css);

  const balao = document.createElement('div');
  balao.id = 'sb-chat-balao';
  balao.textContent = CHAMADA;

  const btn = document.createElement('button');
  btn.id = 'sb-chat-btn';
  btn.setAttribute('aria-label', 'Abrir atendimento');
  btn.textContent = '💬';

  const box = document.createElement('div');
  box.id = 'sb-chat-box';
  let carregado = false;

  btn.addEventListener('click', () => {
    // o iframe só nasce no primeiro clique: carregar o app do Streamlit junto
    // com a página atrasaria o site inteiro por algo que a maioria não abre
    if (!carregado) {
      const frame = document.createElement('iframe');
      frame.src = url;
      frame.title = TITULO;
      box.appendChild(frame);
      carregado = true;
    }
    box.classList.toggle('aberto');
    balao.classList.remove('mostra');
    btn.textContent = box.classList.contains('aberto') ? '✕' : '💬';
  });

  document.body.appendChild(box);
  document.body.appendChild(balao);
  document.body.appendChild(btn);

  setTimeout(() => { if (!box.classList.contains('aberto')) balao.classList.add('mostra'); }, 4500);
  setTimeout(() => balao.classList.remove('mostra'), 14000);
})();
