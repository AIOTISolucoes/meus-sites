# Retomada - Restaurante Morada Nova

## Atualização de UI premium - 16/09/2026

- Text Roll Navigation e Scroll Progress do Skiper UI adaptados para JavaScript puro, com atribuição no rodapé.
- Nova seção com a mesma imagem em camadas, baseada no comportamento público `repetition-hover` do OriginKit.
- Novo arquivo: `js/premium-ui.js`.

Demo criada em 16/09/2026. Não publicada e não enviada ao negócio.

- Site: `index.html`, `css/style.css`, `js/main.js` e `js/chat.js`.
- Vídeo: `vendas/video-morada-nova.mp4` — 24,8s, 1440×900, 25 fps.
- O chat do vídeo respondeu pela instância local. Publicar o agente `morada_nova`
  antes de apresentar o link hospedado, pois a instância pública ainda não o conhece.
- Agente: `morada_nova` em `agents.yaml`.
- Assinatura: cardápio horizontal com scroll scrub e pré-pedido funcional.
- Pedido: gera mensagem com itens, quantidades e observação no WhatsApp público.
- Conteúdo: dados da reportagem Sabores da Cidade de 20/08/2026.
- Confirmar antes de publicar: identidade, logo, fotos, cardápio completo,
  preços, disponibilidade, entrega, taxas, pagamentos, endereço e horário.

Teste automatizado: desktop 1440x900, mobile 390x844, movimento reduzido,
menu, carrinho, total, overflow e erros JavaScript.
