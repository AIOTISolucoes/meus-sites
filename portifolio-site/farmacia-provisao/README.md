# Farmácia Provisão — conceito de site

**Status:** site pronto, vídeo pronto, revisão pendente com o negócio. **Não publicado, não
enviado à farmácia.**

## Conceito visual

**Gaveteiro de balcão.** A farmácia de bairro organiza tudo em gavetas com
etiqueta; o site usa essa imagem como interface.

- **Hero:** a mesma foto cortada em faixas horizontais que respiram devagar,
  se afastam no scroll como gavetas abrindo e reagem ao cursor (a faixa mais
  próxima “sai” um pouco, como a mão no puxador). Botão para pausar.
- **Interação-assinatura:** “Do que você precisa hoje?” é um gaveteiro em
  CSS 3D. Abrir uma gaveta preenche o **cupom** ao lado, que monta a
  mensagem para a loja (WhatsApp ou ligação).
- **Scroll scrub:** a fita do cupom desenrola conforme a rolagem em “Como
  funciona” (três passos reais do fluxo).
- **Paleta:** azul-petróleo profundo (marca), coral (cor humana), branco puxado
  para o petróleo. Não reaproveita o eucalipto da Farmácia Central.
- **Tipografia:** Familjen Grotesk (títulos, com cara de etiqueta) + Atkinson
  Hyperlegible (texto, pensada para leitura fácil, útil para público idoso).
- **Movimento:** suave e organizado; ease-out exponencial, sem bounce. Com
  `prefers-reduced-motion`, as faixas ficam paradas e as gavetas abrem sem 3D
  exagerado.

## Dados

| Dado | Situação |
|---|---|
| Nome, endereço (R. Cap. Valdemar de Lima, 86, Centro) | Provável: Waze + pin no Google Maps |
| Telefone (85) 98183-3811 | Provável. **Não confirmado como WhatsApp**: o site mostra “Demo: confirmar” |
| Instagram @farmaciasprovisao | Provável; bio não lida (login obrigatório) |
| Horário, entrega, unidades, serviços | Não localizados; o site diz “confirmar com a loja” |

Fontes: [`vendas/pesquisa-proximos-5-2026-09-25.md`](../../vendas/pesquisa-proximos-5-2026-09-25.md).

## Imagens

Geradas com GPT Images para a demonstração (originais em
`vendas/assets-proximos-sites/`), convertidas para WebP. São conceituais e
estão rotuladas no rodapé. A foto do hero foi espelhada para deixar o balcão do lado oposto ao texto.

## Dependências externas

- Google Fonts: Familjen Grotesk, Atkinson Hyperlegible.
- Phosphor Icons 2.1.1 (jsDelivr).
- GSAP 3.12.5 + ScrollTrigger (jsDelivr). Opcional: sem ele o site funciona
  completo, só sem as animações de scroll.

## Como executar e testar

```bash
python -m http.server 8765 --bind 127.0.0.1        # na raiz do repositório
# http://127.0.0.1:8765/portifolio-site/farmacia-provisao/
python tests/test_new_sites_2026_09.py provisao
```

O teste cobre 10 viewports (320 a 1920 px) com e sem movimento reduzido:
overflow, H1, imagens, menu, teclado, gaveteiro + cupom + link do WhatsApp,
abertura/fechamento do chat com Escape e foco, e funcionamento sem GSAP.

## Vídeos

- Horizontal 1440×900: `vendas/video-farmacia-provisao.mp4` (`python vendas/gravar-videos-prospectos.py --only …`).
- Reels 1080×1920, 30 fps: `vendas/reels/reels-farmacia-provisao.mp4` (`python vendas/gravar-reels.py --only …`).
- Ambos exigem o site servido na porta 8602 e o app de agentes na 8512 com a
  chave do Groq; o gravador recusa vídeo sem resposta do agente.

## Agente

`farmacia_provisao` em `agents.yaml`. Organiza a consulta (produto,
quantidade, retirada ou entrega), nunca orienta remédio/dose, manda
emergências para o 192 e fecha com `📋 RESUMO DA CONSULTA`.

`js/chat.js` usa o app local (`http://127.0.0.1:8512`) quando o site roda em
localhost e o app publicado no Streamlit nos demais casos. **O agente novo só
responde no app publicado depois que o `agents.yaml` for publicado lá.**

## Pendências com a farmácia

Confirmar: se o número recebe WhatsApp, horário, se faz entrega, se há mais de
uma unidade, serviços oferecidos, logo oficial, fotos reais e autorização para
usar a marca.
