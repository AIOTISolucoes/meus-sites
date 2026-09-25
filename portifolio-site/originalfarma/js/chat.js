/* Assistente virtual (agente "originalfarma" do agents.yaml, servido pelo app Streamlit).
   IDs #ai-btn, #ai-box, #ai-close são usados pelos testes e pelo roteiro de vídeo. */
(() => {
  const config = {
    agent: 'originalfarma',
    color: 'f2d56b',
    title: 'Assistente Originalfarma',
    label: 'Perguntar',
    fallbackHref: 'https://wa.me/5585985101245',
    fallbackText: 'Prefere o WhatsApp da farmácia?'
  };
  const local = ['127.0.0.1', 'localhost'].includes(location.hostname);
  const app = local ? 'http://127.0.0.1:8512/' : 'https://agentes-s68ksrzb97z5q4qqp7f8nq.streamlit.app/';

  const style = document.createElement('style');
  style.textContent = `
  #ai-btn{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:60;display:inline-flex;align-items:center;gap:.5rem;min-height:52px;padding:0 1.15rem 0 .95rem;border:0;border-radius:14px;background:oklch(0.37 0.075 262);color:#fff;font:700 1rem/1 "Lexend",system-ui,sans-serif;box-shadow:0 14px 34px -10px oklch(0.28 0.06 262 / .6);cursor:pointer;transition:transform .45s cubic-bezier(.22,1,.36,1)}
  #ai-btn:hover{transform:translateY(-2px)}
  #ai-btn i{font-size:1.45rem;color:#${config.color}}
  #ai-btn:focus-visible,#ai-close:focus-visible,#ai-fallback:focus-visible{outline:3px solid #${config.color};outline-offset:3px}
  #ai-box{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(max(16px,env(safe-area-inset-bottom)) + 64px);z-index:60;width:min(390px,calc(100vw - 32px));height:min(580px,calc(100dvh - 120px));display:none;grid-template-rows:52px 1fr auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 30px 70px -20px oklch(0.28 0.06 262 / .55);border:1px solid oklch(0.37 0.075 262)}
  #ai-box.open{display:grid;animation:ai-in .45s cubic-bezier(.22,1,.36,1)}
  @keyframes ai-in{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
  #ai-head{display:flex;align-items:center;justify-content:space-between;padding-left:16px;background:oklch(0.28 0.06 262);color:#fff;font:700 .98rem/1.2 "Lexend",system-ui,sans-serif}
  #ai-close{width:52px;height:52px;border:0;background:none;color:#fff;font-size:1.4rem;cursor:pointer}
  #ai-box iframe{width:100%;height:100%;border:0;background:#fff}
  #ai-status{display:grid;place-items:center;padding:24px;text-align:center;color:oklch(0.42 0.035 262);font:400 .95rem/1.5 "Lexend",system-ui,sans-serif}
  #ai-fallback{display:block;padding:12px;text-align:center;background:oklch(0.91 0.095 96);color:oklch(0.28 0.06 262);font:700 .9rem/1.2 "Lexend",system-ui,sans-serif;text-decoration:none}
  @media(max-width:480px){#ai-box{left:8px;right:8px;width:auto;height:min(560px,calc(100dvh - 96px))}}
  @media(prefers-reduced-motion:reduce){#ai-box.open{animation:none}#ai-btn{transition:none}}`;
  document.head.append(style);

  const btn = document.createElement('button');
  btn.id = 'ai-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ai-box');
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
      if (frame.hidden) status().textContent = 'O assistente está demorando para abrir. Você pode falar com a farmácia pelo WhatsApp, no link abaixo.';
    }, 15000);
    frame.addEventListener('load', () => { clearTimeout(timer); frame.hidden = false; status()?.remove(); });
    box.insertBefore(frame, box.querySelector('#ai-fallback'));
  };
  const setOpen = open => {
    if (open) load();
    box.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
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
