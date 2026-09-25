# Kit do "cérebro de IA" (Obsidian)

Tudo que é desse assunto mora aqui. Antes estava solto em `vendas/`, misturado
com os ~40 vídeos de cliente, e achar o B-roll certo na hora de editar era
caçar nome por nome numa lista alfabética.

## Os vídeos, na ordem em que entram no vídeo tutorial

| # | Arquivo | Dura | O que mostra |
|---|---|---|---|
| 1 | `video-cerebro.mp4` | 12,7s | o cérebro: zoom-out, hubs acendendo, nota abrindo |
| 2 | `video-tutorial-obsidian.mp4` | 14,2s | onde baixa: obsidian.md → botão → plataformas → GitHub |
| 3 | `video-criar-cofre.mp4` | 14,7s | **criar e configurar o cofre**, incluindo escolher a pasta |
| 4 | `video-ia-na-pasta.mp4` | 14,9s | **abrir o Claude no terminal dentro da pasta** e mandar ele montar a estrutura |
| 5 | `video-ia-obsidian.mp4` | 20,9s | instalar o plugin Smart Connections |
| 6 | `video-briefing.mp4` | 5,6s | **o briefing saindo pronto** — é o vídeo de fechamento |

Todos são **mudos** e **900x1600** (9:16 nativo). A voz é gravada por cima.

Os três em negrito são os que costumam ser procurados: o do briefing fecha o
vídeo, e os dois do meio (3 e 4) são o miolo do tutorial.

## Os roteiros

| Arquivo | Do que trata |
|---|---|
| `roteiro-video-montar-cerebro.md` | **tutorial**: ensina a montar do zero. Alvo 60-70s. É o roteiro principal. |
| `roteiro-reels-cerebro.md` | **Reels curto**: mostra o cérebro já pronto. Alvo 40-55s. |

Os dois usam os mesmos B-rolls. A narração colada nos tempos de cada beat, os
pontos de corte seco medidos e as armadilhas de gravação estão dentro deles —
ler antes de mexer em qualquer gravador.

## Os gravadores

Cada B-roll tem o seu script ao lado, e todos são reexecutáveis:

| Script | Gera |
|---|---|
| `gravar-cerebro.py` | `video-cerebro.mp4` |
| `gravar-tutorial-obsidian.py` | `video-tutorial-obsidian.mp4` |
| `gravar-ia-obsidian.py` | `video-ia-obsidian.mp4` |
| `gravar-briefing.py` | `video-briefing.mp4` (lê `briefing-terminal.html`, que está aqui do lado) |

Os comandos completos de regravação estão em `roteiro-reels-cerebro.md`.

⚠️ **`video-criar-cofre.mp4` e `video-ia-na-pasta.mp4` não têm script aqui.**
Eles foram feitos por captura de tela real (mouse e teclado por P/Invoke +
`ffmpeg gdigrab` recortado na janela), porque o CDP não alcança nem o seletor de
cofre nem o diálogo de pasta do Windows. Os scripts daquela sessão ficaram no
scratchpad e se perderam; o caminho está descrito em
`roteiro-video-montar-cerebro.md`, na seção "Como esses dois B-rolls foram
gravados".

## O que falta

Só a parte humana: ele gravar o próprio rosto e a voz (gancho no começo,
fechamento no fim) e montar. Nenhum B-roll está pendente.
