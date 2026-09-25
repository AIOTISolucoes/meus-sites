# Site do Butterfly Dreams Salon — PRONTO em 31/jul/2026

Feito a partir de `portifolio-site/_modelo/`. Testado no desktop, no celular
(390px) e em movimento reduzido. Console limpo. **Não commitado e não publicado.**

## Dados usados (conferidos no Instagram)

| item | valor |
|---|---|
| Instagram | @butterfly_dreamssalon (1.923 seguidores) |
| Nome | Butterfly Dreams Salon |
| Bio | "🎨 Colorimetria \| ✂️ Corte \| 💆‍♀️ Alisamentos — Especialista em revelar sua melhor versão" |
| **Endereço** | **Rua Getúlio Vargas, 1010 — Fortaleza-CE** (publicado na bio) |
| WhatsApp | wa.me/message/34GOBJWBTFBIG1 (link curto da bio) |
| Destaques | Produção, Cortes, Chocolates, Correção, Repost |
| Logo | círculo preto com borboleta dourada |

Este é o **primeiro cliente com endereço publicado** — por isso o site mostra o
endereço e tem botão "ver no mapa", coisa que os outros não podem ter.
Continua **sem preço e sem horário de funcionamento**, porque isso ela não publica.

## A seção-assinatura: "Dá pra chegar no loiro que eu quero?"

A pergunta que mais chega num salão de cor. A resposta não é sim/não: é a
**escala de níveis 1 a 10** que todo colorista usa. A visitante escolhe onde o
cabelo dela está hoje e onde quer chegar, e o site mostra:

- quantos **níveis de clareamento** são,
- qual **fundo de clareamento** aparece no caminho (o pigmento quente que surge
  ao clarear e precisa ser neutralizado),
- e um veredito honesto: salto de 5+ níveis é "projeto de cor, em várias
  sessões", não promessa de resultado no mesmo dia.

Isso faz duas coisas de uma vez: responde a dúvida real e prova que quem atende
domina a técnica. **Confirmar com ela** se concorda com os textos dos vereditos
— é o conteúdo mais técnico de todos os sites que fizemos.

## Sobre a paleta (preto + dourado, igual à Panificadora Félix)

A logo dela É preta com borboleta dourada, então não dava pra trocar a marca.
O que separa os dois sites é a **superfície**: o do Félix é escuro, este é
**claro** (marfim com preto e fio de ouro), o dourado aqui é mais pálido
(champagne) e o destaque dos títulos **não é itálico** — é a Marcellus em
degradê dourado. Se ainda achar parecido, o caminho é escurecer mais o Félix ou
clarear mais este.

## O agente (`butterfly_dreams` no agents.yaml)

Testado com 5 perguntas-armadilha: recusa preço, **não promete que dá pra ficar
loira**, não diz quantas sessões nem quanto tempo, não confirma dia/horário —
e informa o endereço (que é público). Pede foto do cabelo atual, que é a
prática real do salão.

⚠️ **O chat só funciona depois do push do `agents.yaml`.**

## Pendências

1. Mostrar pra ela e confirmar os textos da escala.
2. Vídeo demo (`vendas/gravar-video-interativo.py`, trocar as constantes).
3. Mensagem de abordagem.
