# Roteiro: "monta um cérebro de IA pro teu negócio" (tutorial)

Vídeo **diferente** do Reels de `roteiro-reels-cerebro.md`. Aquele mostra o
cérebro pronto; este ensina a montar do zero. Os B-rolls são os mesmos.

**Alvo:** 60-70s. Tem versão curta de 40s no fim do arquivo.

---

## ⚠️ Uma correção antes de gravar

Você escreveu *"contexto infinito"*. **Não fala isso.** Contexto infinito não
existe, e é o tipo de frase que alguém que entende do assunto usa pra te
desacreditar nos comentários — justo você, que está vendendo IA.

O que é verdade, e é mais forte:

> **A IA não fica com memória infinita. Ela para de precisar de memória.**
> Em vez de você reexplicar tudo toda conversa, ela abre só a nota que interessa.

É por isso que economiza token: ela lê 2 notas de 30 linhas em vez de você colar
20 páginas de contexto. E é por isso que ela não esquece: o que sabe está em
disco, não na conversa.

---

## Estrutura

### 0:00–0:08 · GANCHO — seu rosto
> "Eu montei um cérebro de IA pro meu trabalho. É uma pasta no meu PC que a IA lê
> inteira. Hoje ela sabe dos meus clientes, dos meus preços e do que eu tenho que
> fazer amanhã — e eu não expliquei nada disso pra ela hoje."

Corta seco. Sem "fala galera".

### 0:08–0:16 · A PROMESSA — B-roll `video-cerebro.mp4` (o zoom-out)
> "Isso aqui é o meu. Serve pro teu negócio, pros teus projetos, pra tua empresa.
> E dá pra montar em vinte minutos."

⚠️ Deixa o zoom-out respirar. É a imagem mais forte que você tem.

### 0:16–0:24 · POR QUE FUNCIONA — B-roll `video-cerebro.mp4` (os hubs acendendo)
> "E não é que a IA fica com memória infinita, isso não existe. É que ela para de
> precisar: em vez de eu reexplicar tudo toda vez, ela abre só a nota que
> interessa. Gasta menos token e não esquece."

### 0:24–0:34 · PASSO 1: BAIXAR — B-roll `video-tutorial-obsidian.mp4`
> "Primeiro: obsidian.md. Aperta em baixar e escolhe teu aparelho — Windows, Mac,
> Linux, celular. De graça, sem conta, sem cartão."

### 0:34–0:48 · PASSO 2: O COFRE — B-roll `video-criar-cofre.mp4` (14,7s)
> "Abre o programa e cria um cofre novo. Cofre é só uma pasta, não tem mistério.
> Dá um nome e escolhe onde ela vai ficar salva."

⭐ **A dica que ninguém dá** (fala por cima, é o momento de maior valor):
> "Cria essa pasta **dentro do OneDrive ou do Google Drive**. Aí ela faz backup e
> sincroniza com o teu celular sozinha, e tu não paga o plano de sync deles."

⚠️ **No vídeo aparece um aviso e você TEM que explicar.** Quando a pasta é dentro
do OneDrive, o Obsidian mostra: *"Conflito no serviço de sincronização de
arquivos detectado"*. Se você não falar nada, o espectador se assusta bem no
momento da sua melhor dica. A frase pra falar por cima:

> "Vai aparecer esse aviso aí. Ele só vale se tu usar o **Obsidian Sync**, que é
> o plano pago deles, junto com o OneDrive. Como a graça aqui é justamente não
> pagar, pode seguir tranquilo."

### 0:48–1:10 · PASSO 3 e 4: BOTAR A IA — B-roll `video-ia-na-pasta.mp4` (14,9s)
> "Agora o pulo do gato. Abre a tua IA **dentro dessa pasta**. Eu uso o Claude no
> terminal: abro o terminal na pasta do cofre e chamo ele ali dentro. Repara que
> ele mostra o caminho — ele tá dentro do cérebro."
>
> "E aí tu não organiza nada na mão. Pede: 'monta a estrutura de pastas e notas
> do meu cérebro pro meu negócio'. Ele monta tudo: negócio, clientes, vendas,
> marketing, entrega, operação, conhecimento, projetos, recursos e arquivo."

⚠️ **Fala do pedido de permissão**, que aparece no vídeo: *"Do you want to
proceed?"*. É ponto a favor, não contra:
> "E repara: ele **pergunta antes** de mexer. Não sai fazendo nada sozinho."

**A regra de ouro, se der tempo:** *"não organiza em pasta, linka."* Pasta te
obriga a decidir onde a coisa mora; link deixa a coisa morar em vários lugares.

### 1:10–1:18 · BÔNUS: A BUSCA SEMÂNTICA — B-roll `video-ia-obsidian.mp4`
> "E tem um plugin, o Smart Connections, que lê tudo e te mostra notas parecidas
> que tu nem linkou. Roda no teu PC, sem chave de API, sem pagar nada."

Se quiser cortar tempo, entra só o trecho final desse B-roll (a partir de 17,1s).

### 1:18–1:28 · O RESULTADO — B-roll `video-briefing.mp4`
> "E aí, depois de algumas semanas alimentando, eu peço o briefing. Ele lê o cofre
> inteiro e me diz quem abordar, que dia, que horas e com qual mensagem."

### 1:28–1:35 · FECHAMENTO — seu rosto
> "Levei três semanas pra descobrir isso na marra. Tu faz em vinte minutos."

**CTA:** "Comenta CÉREBRO que eu mando o passo a passo escrito."

---

## Como esses dois B-rolls foram gravados

São **captura de tela real**, não recriação. O CDP (que dirige o Obsidian nos
outros vídeos) não alcança nem o seletor de cofre nem o seletor de pasta do
Windows, então esses dois foram feitos por outro caminho:

- **mouse e teclado de verdade**, por P/Invoke (`user32.dll`), com movimento em
  curva pro ponteiro não parecer robô;
- **captura só do retângulo da janela** (`ffmpeg gdigrab` com `-offset_x/-offset_y`),
  nunca a tela inteira;
- a janela é **presa** numa posição fixa (`MoveWindow`) pra o recorte não
  escorregar, inclusive o diálogo nativo de pasta, que nasce em 0,0 e é puxado
  pra dentro do quadro;
- na edição, o 16:9 entra **dentro** do quadro 9:16 com fundo escuro em cima e
  embaixo. Não dá pra gravar vertical nativo: o monitor é 1280x720 e uma janela
  9:16 não cabe nele.

Os scripts ficaram no scratchpad da sessão (`tomada-cofre.ps1`, `tomada-ia.ps1`,
`entrada.ps1`, `janelas.ps1`). Se for regravar, o caminho está documentado aqui.

### ⚠️ Privacidade: o que quase entrou no vídeo

1. **Discord com DMs abertas.** Gravação de tela inteira captura nome, foto e
   mensagem de quem falou com você. Por isso a captura é recortada na janela.
   Se **você** for gravar, fecha o Discord antes.
2. **O VS Code apareceu por ~2s** no `video-criar-cofre.mp4` bruto: no instante
   em que o cofre abre, a janela troca de lugar e o que está atrás aparece. Esse
   trecho foi cortado. Se regravar, confere esse ponto.

### ⚠️ Estado que sobrou na máquina

- Existe um cofre novo em **`OneDrive\meu-cerebro`**, com a estrutura de 12
  pastas que a IA criou e um `Home.md`. Ele é de verdade e está bom — dá pra
  usar como teu cérebro do negócio, ou apagar. Sua escolha.
- Ele **não** está registrado na lista de cofres do Obsidian (voltei a lista pro
  original). Pra abrir: Obsidian → "Abrir pasta como um cofre" → aponta pra ele.

---

## Corte de 40s (se quiser a versão curta)

Corta os passos 3 e 4 e o bônus. Fica:

| Tempo | O quê |
|---|---|
| 0:00–0:06 | rosto: o gancho |
| 0:06–0:14 | `video-cerebro.mp4`: o cérebro |
| 0:14–0:22 | a correção do "não é memória infinita" |
| 0:22–0:30 | `video-tutorial-obsidian.mp4`: onde baixa |
| 0:30–0:36 | `video-criar-cofre.mp4`: criar o cofre + a dica do OneDrive |
| 0:36–0:40 | rosto: fechamento + CTA |

A parte de conectar a IA vira **o segundo vídeo** — é o assunto mais forte e
merece um Reels só dele.
