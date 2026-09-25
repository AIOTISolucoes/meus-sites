# Elo Barbearia — o que foi feito e o que falta

Cliente: **@elobarbearia** · Rua Maria Tomásia, 597 — Loja 06, Aldeota,
Fortaleza (CE). Site feito em 12/ago/2026, vídeo em 13/ago.

É a **5ª barbearia** do portfólio. A casa se apresenta como **especialista em
imagem masculina** — visagismo, estilo e boas conversas — e é isso que o site
inteiro persegue.

---

## ✅ Pronto

- **Site completo** em `index.html` + `css/estilo.css?v=2` + `js/main.js`.
- **Agente `elo_barbearia`** no `agents.yaml` da raiz.
- **Vídeo de venda**: `vendas/video-elo.mp4` — 46,8s, 1440×900.
  Script em `vendas/gravar-video-elo.py`.

## ⚠️ O chat do site NÃO funciona até o push

O `js/chat.js` aponta pro app no Streamlit Cloud e o agente `elo_barbearia` só
existe no `agents.yaml` local. **Enquanto o `agents.yaml` não for pushado, a
caixinha abre e não responde.** O push é você quem roda
(`git push origin main`).

Depois do deploy, testar no ar:
`?agente=elo_barbearia&embed=true&cor=2b3726`

---

## O que a Elo publica — e é raro

**Ela publica o horário e o endereço completo**, o que na carteira de
barbearias só acontece aqui e na Gentleman. Por isso o site tem a seção
"Fica na Aldeota" com rua, número, loja e a tabela de horários:

| | |
|---|---|
| Segunda a sexta | **10h às 20h** |
| Sábado | **9h às 19h** |
| Domingo | **não publicado** |

⚠️ **"Domingo: não publicado" está escrito assim no site, de propósito.** A
bio deles cala sobre domingo, e a linha honesta vale mais que um chute — é
inclusive um dos melhores momentos do vídeo.

**Serviços** (todos confirmados no perfil): corte · barba · **visagismo** ·
**dia de noivo** · **manicure**. Dá pra agendar também pelo app AppBarber.

WhatsApp: **(85) 9 9736-0006**.

## 🔴 O que falta descobrir com o cliente

1. **Nenhum preço é público.** Nem bio, nem post, nem o link de agendamento
   (que exige conta). O site não mostra valor nenhum e o agente se recusa a
   estimar. Com uma tabela, entram os cartões de serviço com preço.
2. **Quantas pessoas o "dia de noivo" atende e o que inclui.** É destaque fixo
   do perfil deles, mas ninguém escreveu a regra.
3. **Nome dos barbeiros.** A foto da equipe na porta tem 4 pessoas e nenhuma
   está identificada.
4. **Se a manicure é da casa ou de uma parceira.** Tem destaque próprio no
   Instagram, mas não diz.

## A seção-assinatura: qual é o formato do seu rosto

Cinco formatos (oval, redondo, quadrado, alongado, triangular). Ao escolher,
**o contorno E o cabelo são redesenhados em SVG** — não é troca de imagem, são
paths diferentes por formato — e a leitura ao lado explica o que aquele rosto
costuma pedir e o que costuma atrapalhar.

É visagismo de verdade virado interface: responde a dúvida real de quem nunca
entendeu o que a palavra significa **e prova competência da casa** antes de
qualquer conversa.

⚠️ **O site NUNCA diz qual é o rosto da pessoa.** Quem escolhe é ela, e o texto
fecha dizendo que quem decide olhando é o barbeiro, na cadeira. O agente tem a
mesma regra, e ela é rígida: nem se a pessoa mandar foto.

## Identidade

- **Paleta**: verde `#2b3726` (a **parede do salão** deles) + creme `#efeae0`
  + preto `#14150f`. Verde-acento `#a8bd95` é o que vira letra sobre escuro.
- ⚠️ A parede verde é a marca visual do lugar — foi de lá que a cor saiu, não
  da logo (que é preto e branco). **Se um dia parecer parente de outro site,
  mexer no creme, nunca no verde.**
- **Fontes**: Syne + Rubik. Nenhuma das duas foi usada em outro site do
  portfólio. As outras barbearias são condensadas/pesadas (Oswald, Anton,
  Bevan) ou didone (Prata, na Gentleman): a Syne é geométrica e larga, e essa
  diferença é proposital.
- **A logo foi reconstruída por tracing** (`../_modelo/ferramentas/vetorizar2.py`), porque
  o Instagram só entrega foto de perfil em 150×150. ⚠️ O selo da Elo é **uma
  mancha cheia com vazados**: tem que viver num `path` só com
  `fill-rule="evenodd"` — separar em grupos faz os vazados sumirem.

## Sobre as fotos

6 fotos do feed, cortadas em 3:4 e uniformizadas (`../_modelo/ferramentas/tratar.py`).
A melhor é a **equipe na porta**, que aparece no hero e na seção "Fica na
Aldeota" — é a única em que dá pra ver a fachada com o letreiro.

Como sempre nesta carteira: **tudo é frame de reel**. Pedir fotos limpas do
interior é o maior ganho possível.
