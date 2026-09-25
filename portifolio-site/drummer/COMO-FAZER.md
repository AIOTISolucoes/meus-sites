# Como fazer um site de cliente

Passo a passo do que já deu certo em 5 sites (Colmeia, Sabtec, Félix, Estúdio E
Conceito, Claudia). **Começar copiando esta pasta:**

```
portifolio-site/_modelo/  ->  portifolio-site/<cliente>/
```

Depois é procurar `[[ ]]` no `index.html`, trocar os tokens do `:root` no
`css/estilo.css` e configurar o topo do `js/chat.js`. O esqueleto (nav, hero,
cards, trilho, contato, rodapé, responsivo, movimento reduzido) já está pronto.

---

## 1. Pesquisa — antes de escrever uma linha

Tudo sai do Instagram do cliente. O que buscar:

- **Nome, bio e a lista de serviços** que ele mesmo escreveu.
- **WhatsApp** (quase sempre no link da bio).
- **Cidade e horário** — só se ele publicar. Ver regra abaixo.
- **A logo**: baixar a foto de perfil e **medir a cor no pixel**. Ela vem em
  150×150, então **redesenhar em SVG** — é isso que permite a intro se
  desenhando e a logo na nav.
- **Fotos**: as melhores do feed. Costumam ser print ou frame de reel (640px,
  fundo doméstico, às vezes com marca d'água). Cortar em 3:4 e tratar todas com
  o mesmo filtro pra ficarem uniformes.
- **O que ele mais posta** costuma ser o carro-chefe, mesmo que não esteja
  escrito na bio (na Claudia era ventosaterapia). Vale destacar — mas
  **avisar que é dedução e confirmar antes de publicar**.

> Se a qualidade das fotos for ruim, **não usar foto grande no hero**: entram
> pequenas no trilho, com o véu na cor da marca. E pedir fotos novas pro cliente
> (celular mesmo, luz de janela, fundo limpo) é o maior ganho possível no site.

## 2. A regra que não se quebra: não inventar

**Preço, horário de funcionamento e endereço só entram no site se o cliente
publicou.** Não estimar, não deduzir do DDD, não escrever "atendemos de segunda
a sexta" porque parece razoável. O que não se sabe vira "combinado pelo
WhatsApp".

Isso vale igual pro agente de IA (seção 5) e pros números do hero: sem dado
real, cortar o bloco. Inventar "+500 clientes satisfeitos" é o que faz o site
parecer golpe — e queima o cliente, que é quem responde por aquilo.

## 3. A seção-assinatura — o coração do trabalho

Todo site tem UM momento que nenhum outro tem. É o que separa o trabalho de um
template e é o que aparece no vídeo de venda.

Já feitos:

| cliente | assinatura |
|---|---|
| Estúdio E Conceito | fios de cabelo com física de cordinha que desviam do ponteiro |
| Claudia | mapa do corpo clicável ("onde dói?") + ondas que afundam sob o dedo |
| Sabtec | intro da logo se desenhando + tesoura que corta a página no scroll |
| Colmeia | abelha voando com o scroll |

Como achar a do próximo: pegar o **gesto central do trabalho** (cortar, pressionar,
assar, entregar) e transformar em algo que reage a quem está olhando. Se não
reage, é enfeite, não assinatura.

## 4. Estrutura padrão

Intro → nav → hero → cards de serviço → **seção-assinatura** → galeria em trilho
→ contato → rodapé → widget de chat. Não precisa ser exatamente isso; precisa
ter a assinatura e o caminho pro WhatsApp sempre à mão.

**Paletas e fontes já usadas** estão listadas no topo do `css/estilo.css`.
Não repetir: dois clientes com a mesma cara estragam os dois no portfólio.

## 5. O agente de IA (`agents.yaml`, na raiz do projeto)

Copiar o bloco de um agente existente (`claudia_massoterapia` é o mais completo)
e adaptar. O que todo agente de cliente precisa ter:

- **Nunca informa preço** (a não ser que o cliente tenha tabela real e pública —
  só o Félix tem, com os kits de festa).
- **Nunca confirma horário nem diz se atende em determinado dia.** Ele não
  conhece a agenda. Anota a preferência; quem confirma é o cliente.
- **Nunca dá parecer técnico** sobre o corpo, o cabelo, a obra, o equipamento.
- Perguntas objetivas: **máx. 2 frases, UMA pergunta por vez, com opções
  curtas**, e proibido parafrasear o que a pessoa acabou de dizer.
- Termina com o bloco `📋 RESUMO DO AGENDAMENTO` (o app.py detecta por regex,
  monta o card verde e dispara o lead pro Telegram/planilha).

**Testar o agente sem subir o Streamlit** — script de ~25 linhas que lê o
`agents.yaml`, pega a chave em `.streamlit/secrets.toml` com `tomllib` e chama
`core.agent.responder` com um histórico falso. Roda 4 perguntas-armadilha em
~15s (preço · parecer técnico · horário/endereço · caso delicado do ramo).
**Fazer isso sempre**: na Claudia o agente passou em 3 e falhou na 4ª,
respondendo "Sim, atendemos sábado" — confirmando uma agenda que não conhece.

⚠️ O chat do site só funciona **depois do push do `agents.yaml`**, porque o
widget aponta pro app no Streamlit Cloud. Sem push, a caixinha abre e não
responde.

## 6. Testes que não dá pra pular

1. **Desktop** (1440×900) e **celular** (390×844) — a nav e o trilho horizontal
   são onde mais quebra.
2. **Movimento reduzido.** O PC do usuário tem as animações do Windows
   desligadas, então é ESTE o caminho que ele vê. No agent-browser:
   `agent-browser set media light reduced-motion`.
3. **Console limpo**: `agent-browser errors`.
4. Clicar em tudo que é interativo. Sério.

## 7. Publicar

Cada site vai pro ar **sozinho**, com o conteúdo da pasta na raiz de um repo
próprio (é assim que Colmeia e Sabtec estão no GitHub Pages). Por isso **nada
neste modelo aponta pra fora da pasta**: um `../_comum/chat.js` compartilhado
quebraria no ar. O reuso é na cópia, não em runtime.

Fluxo: copiar a pasta pro repo clonado no scratchpad → commit → push. A
credencial do git no Windows é do usuário **Gyshro**.

---

## Armadilhas que já custaram tempo

**Canvas animado**
- Passo de tempo fixo com acumulador, senão a física anda junto com a taxa de
  quadros (dobra a velocidade em tela de 120Hz).
- Guarda `Number.isFinite(agora)` na primeira chamada: sem ela `acumulado` vira
  `NaN`, a física nunca roda e a tela fica **pintada porém congelada** — parece
  tudo normal, e o bug leva horas.
- **A amplitude que aparece é ~força/constante-da-mola.** Um "sopro" de 0,004
  com mola 0,006 dá 0,67px: invisível. Fazer a conta antes de caçar bug.
- Agrupar os `stroke()` por cor+espessura (um por elemento derruba o quadro).
  Nada de `createLinearGradient` por elemento: corta o FPS pela metade.
- Pausar com `IntersectionObserver` fora da tela e no `visibilitychange`.
- Vigia de FPS que reduz a densidade sozinho em aparelho fraco.
- Medir FPS em headless **engana** (rasteriza por software): o número confiável
  é o tempo dentro do callback do `requestAnimationFrame`.

**Scroll e layout**
- `scroll-snap-type` engole o `padding` lateral do container — compensar com
  `scroll-padding-inline`.
- ScrollTrigger dentro de trilho horizontal precisa de `containerAnimation`,
  senão o painel nunca "entra na tela".
- `offsetTop` de seção com `pin` não serve pra rolar até ela (o pin-spacer
  muda tudo). Usar `getBoundingClientRect().top + window.scrollY`.

**agent-browser**
- **Flag ANTES do caminho**: `screenshot --full x.png`. Ao contrário, cria um
  arquivo lixo com o nome da flag.
- `reload` **restaura o scroll anterior** — teste de "mudou algum pixel?" dá
  falso negativo se a seção estiver fora da tela (o canvas pausa de propósito).
  `window.scrollTo(0,0)` antes de medir.
- Pra congelar uma animação e conferir: `gsap.globalTimeline.pause(1.95)`.
- Elemento dentro de iframe não aparece em `find placeholder`; usar `snapshot -i`
  e clicar pelo `@eN`.
