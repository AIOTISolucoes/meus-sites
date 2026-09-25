/* Assistente virtual (agente "nobre_restaurante" do agents.yaml, servido pelo app Streamlit).
   IDs #ai-btn, #ai-box, #ai-close são usados pelos testes e pelo roteiro de vídeo. */
(() => {
  const config = {
    agent: 'nobre_restaurante',
    color: 'c9a45c',
    title: 'Assistente Nobre',
    label: 'O que pedir hoje?',
    fallbackHref: 'https://linktr.ee/nobrepizzariaeresto',
    fallbackText: 'Ver todos os canais oficiais da Nobre'
  };
  const local = ['127.0.0.1', 'localhost'].includes(location.hostname);
  const app = local ? 'http://127.0.0.1:8512/' : 'https://agentes-s68ksrzb97z5q4qqp7f8nq.streamlit.app/';

  const style = document.createElement('style');
  style.textContent = `
  #ai-btn{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:60;display:inline-flex;align-items:center;gap:.5rem;min-height:52px;padding:0 1.15rem 0 .95rem;border:0;border-radius:999px;background:oklch(0.36 0.12 22);color:oklch(0.95 0.02 85);font:700 1rem/1 "Albert Sans",system-ui,sans-serif;box-shadow:0 14px 34px -10px oklch(0 0 0 / .5);cursor:pointer;transition:transform .45s cubic-bezier(.22,1,.36,1)}
  #ai-btn:hover{transform:translateY(-2px)}
  #ai-btn i{font-size:1.45rem;color:oklch(0.76 0.1 82)}
  #ai-btn:focus-visible,#ai-close:focus-visible,#ai-fallback:focus-visible{outline:3px solid #${config.color};outline-offset:3px}
  #ai-box{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(max(16px,env(safe-area-inset-bottom)) + 64px);z-index:60;width:min(390px,calc(100vw - 32px));height:min(580px,calc(100dvh - 120px));display:none;grid-template-rows:52px 1fr auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 30px 70px -20px oklch(0 0 0 / .55);border:1px solid oklch(0.36 0.12 22)}
  #ai-box.open{display:grid;animation:ai-in .45s cubic-bezier(.22,1,.36,1)}
  @keyframes ai-in{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
  #ai-head{display:flex;align-items:center;justify-content:space-between;padding-left:16px;background:oklch(0.27 0.09 20);color:oklch(0.95 0.02 85);font:700 .98rem/1.2 "Albert Sans",system-ui,sans-serif}
  #ai-close{width:52px;height:52px;border:0;background:none;color:#fff;font-size:1.4rem;cursor:pointer}
  #ai-box iframe{width:100%;height:100%;border:0;background:#fff}
  #ai-status{display:grid;place-items:center;padding:24px;text-align:center;color:oklch(0.35 0.03 30);font:400 .95rem/1.5 "Albert Sans",system-ui,sans-serif}
  #ai-fallback{display:block;padding:12px;text-align:center;background:oklch(0.76 0.1 82);color:oklch(0.22 0.03 30);font:700 .9rem/1.2 "Albert Sans",system-ui,sans-serif;text-decoration:none}
  @media(max-width:480px){#ai-btn{width:56px;height:56px;min-height:56px;padding:0;justify-content:center}#ai-btn span{display:none}#ai-box{left:8px;right:8px;width:auto;height:min(560px,calc(100dvh - 96px))}}
  @media(prefers-reduced-motion:reduce){:root:not(.force-motion) #ai-box.open{animation:none}:root:not(.force-motion) #ai-btn{transition:none}}`;
  document.head.append(style);

  const btn = document.createElement('button');
  btn.id = 'ai-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ai-box');
  btn.setAttribute('aria-label', config.label);
  btn.innerHTML = `<i class="ph ph-chat-circle-text" aria-hidden="true"></i><span>${config.label}</span>`;

  const box = document.createElement('div');
  box.id = 'ai-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', config.title);
  box.innerHTML = `<div id="ai-head"><span>${config.title}</span><button id="ai-close" type="button" aria-label="Fechar assistente">&times;</button></div>` +
    `<div id="ai-status" role="status">Carregando o assistente…</div>` +
    `<a id="ai-fallback" href="${config.fallbackHref}" target="_blank" rel="noopener">${config.fallbackText}</a>`;

  let frame = null;
  const status = () => box.querySelector('#ai-status');
  const load = () => {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.title = config.title;
    frame.src = `${app}?agente=${config.agent}&embed=true&cor=${config.color}`;
    frame.hidden = true;
    const timer = setTimeout(() => {
      if (frame.hidden) status().textContent = 'O assistente está demorando para abrir. Você pode ver os canais oficiais da Nobre no link abaixo.';
    }, 15000);
    frame.addEventListener('load', () => { clearTimeout(timer); frame.hidden = false; status()?.remove(); });
    box.insertBefore(frame, box.querySelector('#ai-fallback'));
  };
  const setOpen = open => {
    if (open) load();
    box.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar assistente' : config.label);
    btn.innerHTML = open
      ? '<i class="ph ph-x" aria-hidden="true"></i><span>Fechar</span>'
      : `<i class="ph ph-chat-circle-text" aria-hidden="true"></i><span>${config.label}</span>`;
    if (open) box.querySelector('#ai-close').focus();
  };
  btn.addEventListener('click', () => setOpen(!box.classList.contains('open')));
  box.querySelector('#ai-close').addEventListener('click', () => { setOpen(false); btn.focus(); });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && box.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
  document.body.append(box, btn);
})();
