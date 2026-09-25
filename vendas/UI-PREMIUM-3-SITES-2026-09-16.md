# Integração visual: OriginKit + Skiper UI

Registro da evolução aplicada em 16/09/2026 aos conceitos da Ótica Vizzio Fashion, Restaurante Morada Nova e Louro Caipira.

## O que entrou nos três sites

- Navegação com rolagem de letras, adaptada em JavaScript puro a partir do componente gratuito **Text Roll Navigation (skiper58)** do Skiper UI.
- Indicador circular e arrastável de progresso, adaptado em JavaScript puro a partir do componente gratuito **Scroll Progress 001 (skiper89)** do Skiper UI.
- Atribuição visível ao Skiper UI no rodapé, conforme a licença gratuita publicada pelo projeto.
- Comportamento reduzido para pessoas que usam `prefers-reduced-motion`.
- Validação em 1440 × 900, iPhone 390 × 844 e modo de movimento reduzido.

## Direção OriginKit aplicada

Os projetos atuais são HTML/CSS/GSAP sem etapa de build. O código oficial do OriginKit é entregue para React, Vite, Next.js ou Framer e exige autenticação para copiar ou instalar. Por isso, nenhum componente oficial foi alegado como instalado. Foram criadas implementações próprias para a arquitetura atual, usando apenas os comportamentos e opções publicados no catálogo:

- **Vizzio Fashion:** lupa responsiva sobre as imagens da coleção, seguindo a proposta pública de `image-magnifier`.
- **Morada Nova:** três cópias da mesma fotografia em uma cascata de recortes e profundidade, seguindo a proposta pública de `repetition-hover`.
- **Louro Caipira:** accordion de imagens e deck 3D refinados na direção de `spotlight-frames`, com inclinação por ponteiro e scrub no scroll.

## Arquivos principais

- `portifolio-site/otica-vizzio-fashion/js/premium-ui.js`
- `portifolio-site/restaurante-morada-nova/js/premium-ui.js`
- `portifolio-site/louro-caipira/js/premium-ui.js`
- `tests/test_three_local_sites.py`
- `gravar-videos-prospectos.py`, roteiro reproduzível de gravação.

## Vídeos gravados

- `video-vizzio-fashion.mp4` — 25,6s, 1440×900, 25 fps.
- `video-morada-nova.mp4` — 24,8s, 1440×900, 25 fps.
- `video-louro-caipira.mp4` — 26,5s, 1440×900, 25 fps.

Os três vídeos mostram desktop, interação principal, composição mobile em
390 px e uma resposta real do agente. A conversa foi gravada na instância local,
porque a configuração dos três agentes ainda não foi publicada no Streamlit.

## Próxima decisão opcional

Se for necessário usar os arquivos oficiais do OriginKit em vez das implementações nativas, será preciso autenticar uma conta no OriginKit e migrar cada site para Vite + React ou Next.js. Essa migração adiciona uma etapa de build e não foi feita nesta rodada para manter cada demonstração simples de publicar como site estático.
