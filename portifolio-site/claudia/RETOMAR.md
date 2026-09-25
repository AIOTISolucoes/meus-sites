# Site da Claudia Andrade (massoterapeuta) — PRONTO em 31/jul/2026

O site está escrito e testado (desktop + celular + movimento reduzido).
**Continua sem commitar e sem publicar**, igual aos outros sites de cliente.

## Antes de mostrar pra ela, confirmar 2 coisas

1. **Ventosaterapia** entrou como 4º serviço e aparece o site inteiro. Ela mostra
   isso em quase todos os reels, mas **não está escrito na bio** — é dedução
   minha. Se ela não quiser divulgar, é só tirar os 4 blocos que citam ventosa.
2. **Não tem cidade, endereço, horário nem preço em lugar nenhum** — porque nada
   disso existe no perfil dela. O site manda tudo pro WhatsApp e diz "o endereço
   eu passo na confirmação". Se ela quiser aparecer "Fortaleza", é 1 minuto de
   ajuste (o DDD 85 sugere, mas eu não inventei).

## Dados usados (conferidos no Instagram)

| item | valor |
|---|---|
| Instagram | @_massoterapeuta.claudia (313 seguidores) |
| Nome | Claudia Andrade |
| Bio | "Massoterapia: Alívia as dores, stress e desconfortos musculares" |
| Serviços na bio | relaxante · esportiva · terapêutica |
| WhatsApp | 55 85 98580-2528 (todos os botões do site) |
| Azul da marca | #1F4E96 (medido no pixel da foto de perfil) |

## O que o site tem

- `index.html` + `css/estilo.css?v=2` + `js/main.js?v=2` (GSAP por CDN, sem build).
- **Intro**: a logo dela (onda aberta + rosto de perfil) redesenhada em SVG, se
  desenhando traço a traço.
- **Hero "ondas de alívio"**: curvas de nível em canvas que **afundam sob o
  ponteiro/dedo e voltam devagar** — é a metáfora da pressão que alivia.
- **"Onde dói?"**: mapa do corpo clicável (cabeça · pescoço/ombros ·
  costas/lombar · pernas). É a seção-assinatura. O destaque é recortado pela
  silhueta, então a marcação segue o contorno do corpo.
- **Como é a sessão**: 5 passos com a linha de progresso guiada pelo scroll.
- **Galeria**: as 5 fotos dela em trilho horizontal (scrub no desktop, arrasto no
  celular), pequenas e com véu azul — porque são frames de reel de 640px.
- **"Respire"**: círculo que guia 3 respirações (4s inspira / 2s segura / 6s solta).
- **Chat de IA** no canto (agente `claudia_massoterapia`).

## Fotos

As 5 de `assets/` são frames de reel (640px, fundo doméstico, uma com marca do
TikTok), já cortadas em 3:4 e tratadas. **Se ela mandar fotos melhores — celular
mesmo, luz de janela, fundo limpo — o site sobe de nível na hora**, é só trocar
os arquivos mantendo os nomes.

## O agente de IA (agents.yaml)

`claudia_massoterapia` — agenda e qualifica. Testado com 4 perguntas-armadilha:
recusa preço, não confirma dia da agenda, não informa endereço, não dá parecer
clínico e pede liberação médica em caso de gravidez/lesão/dor persistente.

⚠️ **O chat só funciona depois que o `agents.yaml` for pushado** (o widget aponta
pro app no Streamlit Cloud). Sem o push, a caixinha abre e não responde.
