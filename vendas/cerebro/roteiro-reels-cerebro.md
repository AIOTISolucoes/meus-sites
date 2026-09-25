# Reels: "cérebro de IA" no Obsidian

**Quatro B-rolls prontos**, todos mudos, 900x1600 (9:16 nativo). Você grava a sua
voz por cima e corta o seu rosto no começo e no fim.

| Arquivo | Dura | O que mostra | Gravador |
|---|---|---|---|
| `vendas/cerebro/video-cerebro.mp4` | 12,7s | o cérebro: zoom-out, hubs acendendo, nota abrindo | `vendas/cerebro/gravar-cerebro.py` |
| `vendas/cerebro/video-tutorial-obsidian.mp4` | 14,2s | onde baixa: obsidian.md → botão → plataformas → GitHub | `vendas/cerebro/gravar-tutorial-obsidian.py` |
| `vendas/cerebro/video-ia-obsidian.mp4` | 20,9s | a IA: loja de plugins → Smart Connections → Instalar → Ativar → o painel achando notas parecidas | `vendas/cerebro/gravar-ia-obsidian.py` |
| `vendas/cerebro/video-briefing.mp4` | 5,6s | o Claude lendo o cofre e devolvendo o briefing de abordagem inteiro | `vendas/cerebro/gravar-briefing.py` |

---

## Corte de 40s (o que você pediu)

Os dois B-rolls tocam quase inteiros e sobra o seu rosto nas pontas. Não precisa
cortar nada de dentro deles.

| Tempo | O quê |
|---|---|
| 0:00–0:05 | **rosto** — quem você é, em uma frase, e o gancho |
| 0:05–0:18 | **B-roll 1** (`video-cerebro.mp4`) — o cérebro |
| 0:18–0:32 | **B-roll 2** (`video-tutorial-obsidian.mp4`) — como baixa |
| 0:32–0:40 | **rosto** — fechamento + CTA |

### 0:18–0:32 · COMO BAIXA — narração colada nos beats do B-roll 2

O vídeo já está no ritmo certo; é só falar por cima. Os tempos são dentro do
B-roll, não do Reels.

- **0,0–3,0s** (o site, ponteiro indo no botão) → *"Baixar é de graça. Entra em
  obsidian.md."*
- **3,0–6,8s** (a página de download; o clique cai em ~5,9s) → *"Aperta no botão
  grande. Ele já reconhece o teu sistema — não tem que escolher nada."*
- **6,8–11,5s** (a lista de plataformas) → *"E tem pra tudo: Windows, Mac, Linux,
  iPhone e Android. Tudo grátis, sem conta, sem cartão."*
- **11,5–14,2s** (o GitHub) → *"O instalador vem do repositório oficial deles no
  GitHub. Não é gambiarra."*

Os dois cortes secos (3,04s e 11,52s) são os pontos de respiro: se precisar
encurtar o Reels, é ali que dá pra cortar sem estragar movimento nenhum.

---

## A parte de IA — B-roll 3 (`video-ia-obsidian.mp4`, 20,9s)

Este **não cabe** nos 40s junto com os outros dois. Use de um destes jeitos:

- **como Reels próprio** ("como botar IA no teu Obsidian"), que é o uso natural;
- **ou entra no lugar do B-roll 2**, se o vídeo for sobre IA e não sobre o app;
- **ou entra só o pedaço final** (a partir de 17,1s, o painel achando as notas
  parecidas) como prova de 3s dentro do vídeo do cérebro.

### Narração colada nos beats

- **0,0–2,4s** (Configurações → Plugins não oficiais) → *"Abre as configurações,
  vai em plugins não oficiais e clica em Procurar."*
- **2,4–8,5s** (a loja com 6.738 plugins) → *"Isso aqui é a loja. É tudo de
  graça."*
- **8,5–12,5s** (busca "smart connections") → *"Procura por Smart Connections.
  1,1 milhão de downloads."*
- **12,5–17,1s** (Instalar → Ativar) → *"Instalar, ativar, acabou. Repara na
  descrição: modelo local, zero configuração, **sem chave de API**. Não paga
  nada e teus dados não saem do teu PC."*
- **17,1s–fim** (o painel) → *"E é isso que ele faz: eu abro a nota das
  barbearias e ele me mostra sozinho todas as barbearias que eu **não tinha
  linkado**. Ele leu e entendeu."*

⚠️ O único corte seco é em **17,1s** (a troca da janela da loja pra janela do
Obsidian). É o ponto pra cortar se precisar encurtar.

⚠️ **Smart Connections e não Copilot** (os dois estão instalados no cofre). O
Copilot exige chave de API paga na tela; o Smart Connections roda um modelo
local. Numa gravação, chave de API é dado que vaza.

---

## O briefing no terminal — B-roll 4 (`video-briefing.mp4`, 5,6s)

O plano de 5 segundos: o comando sendo digitado, as leituras do cofre passando,
e a rolagem pelo briefing inteiro até "A primeira ação, agora".

É o B-roll de **fechamento**: os outros três mostram a ferramenta, este mostra o
resultado. Cabe inteiro em cima da sua frase final.

> "E aí eu peço o briefing, e ele lê o cofre inteiro e me diz exatamente quem
> abordar, que dia, que horas e com que mensagem."

### ⚠️ Este é o único B-roll com moldura recriada

O **texto do briefing é real** — sai de `O gargalo`, `As 7 barbearias`,
`Melhor horário pra abordar`, `Mensagem de abordagem` e `Preço`. A **janela do
terminal é desenhada** (`vendas/cerebro/briefing-terminal.html`), não é captura de tela
do CLI rodando.

Por quê: o monitor deste PC é 1280x720 e uma janela vertical de 900x1600 não cabe
nele — captura de janela (`ffmpeg gdigrab`) só pega o que está visível. Não dá pra
gravar um terminal 9:16 de verdade aqui.

**Se alguém perguntar, é isso que você responde:** o briefing é real, saiu do
cofre; a moldura foi montada porque a tela não comporta o formato vertical.
Se um dia tiver monitor maior, dá pra gravar o terminal de verdade e trocar.

Pra mudar o texto, mexe só no `<pre id="saida">` do HTML — cada linha é uma
linha do terminal:

```
python vendas/cerebro/gravar-briefing.py frames-briefing
ffmpeg -y -f concat -safe 0 -i frames-briefing/lista.txt -fps_mode cfr -r 25 \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-briefing.mp4
```

⚠️ **O último beat (GitHub) é cortável.** Se o público não souber o que é GitHub,
corta os últimos ~3s e o vídeo fecha na lista de plataformas. Pra já gravar sem
ele: `python vendas/cerebro/gravar-tutorial-obsidian.py frames-tutorial --sem-github`.

⚠️ **O download em si não aparece na tela.** A captura pega só a página, não a
barra de download do Chrome. Quem conta que baixou é a sua voz.

---

## Versão longa (alvo: 50-55s)

### 0:00–0:04 · GANCHO — seu rosto
> "Tu tá querendo um cérebro de IA pra organizar todos os teus projetos e não
> faz a mínima ideia de como configurar?"

Corta seco. Sem "fala galera", sem apresentação. O gancho é a pergunta.

### 0:04–0:09 · A REVELAÇÃO — B-roll, o zoom-out
Entra o vídeo do zero. A câmera afasta e o cérebro inteiro aparece.

> "Isso aqui é o meu. Sessenta e nove notas, quatrocentas e setenta conexões.
> Cada bolinha é uma coisa que eu faço."

⚠️ Deixa o zoom-out respirar. É o momento mais forte do vídeo, não corta em cima.

### 0:09–0:16 · O QUE TEM DENTRO — B-roll, os hubs acendendo
Cada cor é um assunto. Fala por cima enquanto os nós acendem:

> "Laranja é cliente. Azul é a parte técnica. Verde é venda. Roxo é vaga de
> emprego. E quando eu passo o mouse num, ele mostra tudo que depende dele."

### 0:16–0:21 · A PROVA — B-roll, a nota abrindo
Abre a nota "As 7 barbearias", com a tabela.

> "E não é enfeite, não. Clica e tem conteúdo de verdade dentro."

### 0:21–0:45 · O PASSO A PASSO
Quatro passos. Um card na tela por passo.

**1. Baixa o Obsidian.** `obsidian.md`, de graça, Windows/Mac/Linux/celular.

**2. Cria um cofre.** É só uma pasta no teu PC.
> ⭐ **A dica que ninguém dá:** cria essa pasta **dentro do OneDrive ou do
> Google Drive**. Aí ela faz backup e sincroniza com o celular sozinha, e tu
> não paga o plano de sync deles.

**3. Escreve e linka.** Digita `[[` e o nome de outra nota.
> **A regra de ouro: não organize em pasta. Linke.** Pasta te obriga a decidir
> onde a coisa mora. Link deixa a coisa morar em vários lugares.

**4. `Ctrl + G`.** É o atalho que abre o grafo. É aqui que vira cérebro.

**Bônus — a parte de IA:** plugin **Smart Connections**.
> "Ele lê tudo e te mostra notas parecidas que tu **nem linkou**. Roda no teu
> PC, offline, sem pagar API nenhuma."

### 0:45–0:55 · FECHAMENTO — seu rosto
> "Levei três semanas pra descobrir isso na marra. Tu faz em vinte minutos."

**CTA:** "Comenta CÉREBRO que eu mando o passo a passo escrito."

---

## ⚠️ Antes de gravar

1. **Movimento reduzido.** Este PC reporta `prefers-reduced-motion: reduce` e
   isso já capou animação de vídeo antes. O script da gravação já força
   `no-preference`, mas **se você gravar a tela por fora, confere**.
   Ver a nota `Movimento reduzido` no cofre.

2. **Não abre estas notas na câmera:**
   - `Ah Imobiliária` — WhatsApp real do seu pai na tela
   - `Maxwell Gomes` — seu telefone e e-mail
   A nota `As 7 barbearias` (a que o vídeo abre) é segura: só nome de cliente.

3. **Nomes de cliente aparecem no grafo** e isso foi decisão sua. É prova
   social boa: mostra carteira real, não demo.

## Se quiser regravar os B-rolls

### O do "onde baixa" (só precisa de internet)

```
python vendas/cerebro/gravar-tutorial-obsidian.py frames-tutorial
ffmpeg -y -f concat -safe 0 -i frames-tutorial/lista.txt -fps_mode cfr -r 25 \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-tutorial-obsidian.mp4
```

O clique de download é real, mas o arquivo é **cancelado** na hora: são ~300 MB
que não iam aparecer no vídeo de qualquer jeito.

### O da IA (Smart Connections)

```
# 1. subir o Obsidian com a porta de debug (igual ao do cérebro)
& "$env:LOCALAPPDATA\Programs\Obsidian\Obsidian.exe" --remote-debugging-port=9222 "obsidian://open?vault=cerebro"

# 2. gravar
python vendas/cerebro/gravar-ia-obsidian.py frames-ia
ffmpeg -y -f concat -safe 0 -i frames-ia/lista.txt -fps_mode cfr -r 25 \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-ia-obsidian.mp4
```

⚠️ **O script desinstala o Smart Connections e o reinstala na frente da câmera**
— é o único jeito de a tela mostrar o botão "Instalar" em vez de "Desinstalar".
O índice de embeddings fica em `cerebro/.smart-env/` e **não** é apagado, então o
painel do final volta a ter conteúdo em poucos segundos. No fim da gravação o
plugin fica instalado e ligado.

⚠️ A janela principal fica em 900x1600 (maior que o monitor). Pra voltar ao
normal é só maximizar.

### O do cérebro

```
# 1. subir o Obsidian com a porta de debug
& "$env:LOCALAPPDATA\Programs\Obsidian\Obsidian.exe" --remote-debugging-port=9222 "obsidian://open?vault=cerebro"

# 2. gravar os frames
python vendas/cerebro/gravar-cerebro.py frames-cerebro

# 3. montar o mp4
ffmpeg -y -f concat -safe 0 -i frames-cerebro/lista.txt -fps_mode cfr -r 25 \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p vendas/cerebro/video-cerebro.mp4
```

Pra trocar quais notas acendem, mexe na lista `passeio` dentro do script.

## Cinco coisas que eu descobri gravando (e custaram tempo)

1. **O Obsidian só desenha o NOME da nota a partir de zoom ~5x.** Com o grafo
   inteiro na tela não existe rótulo, e não dá pra forçar (`textAlpha` volta
   a zero no frame seguinte). A saída foi o **hover**: no hover ele desenha o
   nome em qualquer zoom, e ainda acende as conexões. Por isso o vídeo é um
   passeio de hover, e não um zoom lento.

2. **A janela foi posta em 900x1600, maior que o monitor (1280x720).** Funciona
   porque o CDP captura a superfície de renderização, não o que cabe na tela.
   É assim que sai 9:16 nativo num monitor deitado.

3. **Em 900px de largura o obsidian.md cai no layout de celular** e o botão
   grande troca de nome: no desktop é "Download Obsidian", no vertical é
   "Download for Windows". A primeira gravação morreu nisso. Se um dia o site
   mudar de novo, o erro vai ser `Locator.wait_for: Timeout` — é só ajustar o
   seletor no `gravar-tutorial-obsidian.py`.

4. **No Obsidian 1.13 a gravação envolve TRÊS janelas**, não uma: a principal, a
   de Configurações e a da loja de plugins — cada uma um alvo CDP separado. E as
   duas últimas são `about:blank`, então só dá pra diferenciar uma da outra pelo
   DOM (`.mod-settings` vs `.mod-community-plugin`). Pior: `window.app` só
   existe na janela principal. Comando vai por uma, clique vai na outra.

5. **Reinstalar um plugin que já está carregado deixa ele zumbi**: ele aparece
   como ativo, mas o painel abre dizendo "o plugin que criou este painel não
   existe mais". A cura é recarregar o app (`app:reload`) depois de desinstalar
   — aí a instalação filmada acontece numa sessão limpa. O `gravar-ia-obsidian.py`
   já faz isso sozinho, antes de a câmera rodar.
