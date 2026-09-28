# D20 Hamburgueria — conceito de site

**Status:** site pronto, vídeo pronto, revisão pendente com o negócio. **Não publicado, não enviado à
hamburgueria.**

## Conceito visual

**Taverna de RPG com chapa quente.** A pesquisa mostrou que a marca é temática
de RPG (D20 é o dado de 20 faces; os hambúrgueres são classes: Caçador,
Bárbaro, Bruxa, Guerreiro, Monge, Alquimista, Mímico, Explorador, Berserker;
“Entrada da Guilda”). Por isso a sugestão inicial de estética automotiva foi
descartada.

- **Interação-assinatura:** um d20 em **Three.js** (WebGL), com números nas
  faces, luz quente e sombra na mesa. “Rolar o d20” sorteia 1–20
  (`crypto.getRandomValues`), o dado quica e para com a face sorteada virada
  para a câmera. Cada faixa de faces leva a uma classe; 20 é acerto crítico
  (Entrada da Guilda), 1 é falha crítica. O resultado gera a mensagem de
  WhatsApp no mesmo formato que a casa já usa no Airgo.
- **Scroll scrub:** a foto das camadas é fatiada nos vãos reais entre pão,
  molho, bacon, cheddar, carne, cebola e pão (cortes medidos na imagem). As
  fatias começam espalhadas e se juntam conforme a rolagem (seção fixada no
  desktop). O cardápio de hambúrgueres corre na horizontal, preso à rolagem;
  no celular vira carrossel com *snap*.
- **Paleta:** tinta de madeira escura + ocre de ficha de personagem (drench
  nas seções de jogo) + tomate só no destaque do mês. Evita o preto/vermelho/
  fogo genérico de hamburgueria.
- **Tipografia:** Grenze Gotisch (títulos e nomes das classes) + Chivo.
- **Movimento:** rápido e com peso (dado batendo na mesa, botões que afundam);
  contador d20 no hero que “rola” sozinho. Com movimento reduzido, o dado
  vai direto para a face e nada fica girando.

## Dados (fontes oficiais da casa, consultadas em 25/09/2026)

Airgo (links oficiais), site de pedidos Saipos, iFood e 99Food. Endereço
(Rua Maria Fernandes de Sousa, 58, Eusébio; bairro divergente: Coité no iFood, Guariba numa arte da casa), WhatsApp
(85) 98937-9116, Instagram @d20burger e cardápio: **confirmados**.
Horário: “abre às 18h” (provável); dias a confirmar.

**Preços e descrições da plataforma não foram copiados.** O site lista nomes
e ingredientes (fatos) com texto próprio e manda o preço para o pedido
oficial. Aviso de alergia: a equipe confirma ingredientes.

## Imagens

- **Fotos reais do cardápio oficial** (Saipos da D20, baixadas em 25/09/2026)
  em `assets/cardapio/`: Caçador, Bárbaro, Bruxa, Guerreiro, Monge,
  Alquimista, Mímico, Entrada da Guilda e Combo D20. Aparecem nos cards do
  cardápio, na lista de entradas, no combo e no resultado do dado (enquanto o
  d20 gira, as fotos passam rápido e param no lanche sorteado). Berserker e
  Explorador não têm foto no cardápio online: o site mostra um aviso, não uma
  foto inventada. A arte “Dupla de dois” é um panfleto com preço e ficou de
  fora. **Pedir autorização da casa para usar as fotos** antes de publicar.
- **Conceituais (GPT Images):** `hero.webp`, `camadas.webp`, `guilda.webp`
  (tábua da seção “Para dividir”). O `combo.webp` gerado foi removido.
- A foto do Alquimista traz o endereço com o bairro **Guariba**; o iFood diz
  **Coité**. O site mostra só “Eusébio” até a casa confirmar.

## Dependências externas

Google Fonts (Grenze Gotisch, Chivo), Phosphor Icons bold, GSAP 3.12.5 +
ScrollTrigger, Three.js 0.169.0 (módulo ES via jsDelivr). Sem WebGL, aparece
um d20 em SVG e o sorteio continua funcionando. Sem GSAP, as seções ficam
estáticas e legíveis.

## Executar e testar

```bash
python -m http.server 8765 --bind 127.0.0.1
python tests/test_new_sites_2026_09.py d20
```

## Vídeos

- Horizontal 1440×900: `vendas/video-d20-hamburgueria.mp4` (`python vendas/gravar-horizontal-hd.py --classic --only …`).
- **Horizontal Full HD 1920×1080 (recomendado):** `vendas/hd/hd-d20-hamburgueria.mp4` (`python vendas/gravar-horizontal-hd.py --only …`).
- Reels 1080×1920, 30 fps: `vendas/reels/reels-d20-hamburgueria.mp4` (`python vendas/gravar-reels.py --only …`).
- Ambos exigem o site servido na porta 8602 e o app de agentes na 8512 com a
  chave do Groq; o gravador recusa vídeo sem resposta do agente.

## Agente

`d20_hamburgueria` em `agents.yaml` (“Taverneiro D20”): indica até duas
opções por preferência, nunca informa preço/prazo, não garante nada sobre
alergia e encaminha ao pedido oficial com `📋 RESUMO DO PEDIDO`.

## Pendências com a casa

Autorização para usar marca e nomes, fotos reais dos lanches, dias e horário,
se o Explorador tem descrição, se a casa quer o site como vitrine ligada ao
Saipos (recomendado) e se usa pixel/UTM nos links.
