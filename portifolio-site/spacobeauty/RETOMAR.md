# Site do Spaço Beauty — PRONTO em 31/jul/2026

Feito a partir de `portifolio-site/_modelo/`. Testado no desktop, no celular
(390px) e em movimento reduzido. Console limpo. **Não commitado e não publicado**,
igual aos outros sites de cliente.

## ⚠️ 3 coisas pra confirmar com elas antes de mostrar

1. **Não existe WhatsApp em lugar nenhum.** Procurei nos três perfis
   (@spacobeautynk, @natasha.osantos, @kellincernek_): não tem número nem link
   na bio. Por isso **todos os botões do site vão pro Direct do Instagram**
   (`ig.me/m/spacobeautynk`). Assim que você conseguir o número, é trocar
   `https://ig.me/m/spacobeautynk` por `https://wa.me/55XXXXXXXXXXX` no
   `index.html` — são 6 lugares, um "localizar e substituir" resolve.
2. **Não sei quem faz o quê.** A Kellin se apresenta como *Nail Designer* na
   própria bio (isso está no site). A Natasha não diz a especialidade em lugar
   nenhum, então o card dela ficou só com o nome — **de propósito, pra não
   inventar**. Me diga quem cuida dos cílios e eu completo.
3. **Só existe 1 foto de cílios no feed**, e cílios é o primeiro serviço da bio.
   O resto é unha (que está ótimo). Pedir 3 ou 4 fotos de olhos prontos é o
   maior ganho possível aqui — é só jogar em `assets/` com o nome `cilios.jpg`.

## Dados usados (conferidos no Instagram)

| item | valor |
|---|---|
| Instagram | @spacobeautynk (714 seguidores) |
| Nome | Spaço Beauty |
| Bio | "Lash • Nails • Brows / Sua melhor versão começa aqui" |
| Cidade | **Balneário Camboriú - SC** (publicada na bio) |
| Profissionais | Natasha Santos (@natasha.osantos) e Kellin Cernek (@kellincernek_) |
| Técnicas de cílios | Fox Eyes, Egípcio 5D, Volume Brasileiro, Fios marrom, Lash lifting (dos destaques) |
| Cores da logo | traço **#422307**, fundo **#e4ddcd** (medidas no pixel) |

O slogan do hero ("Sua melhor versão começa aqui") é a frase dela, tirada da bio.
O "NK" do @ são as iniciais das duas — o monograma da intro é isso.

**Sem preço, sem horário de funcionamento e sem endereço**, porque nada disso
está publicado. O site manda tudo pro Direct e diz que o endereço vai na
confirmação.

## O que o site tem

- `index.html` + `css/estilo.css?v=1` + `js/main.js?v=1` + `js/chat.js?v=1`.
- Paleta café + creme + nude, tipografia **Bodoni Moda** (a serifada de revista
  de moda) com **Karla**.
- **Intro**: o monograma NK se desenhando traço a traço.
- **Hero**: fios de cílio flutuando no ar, que se afastam do ponteiro — extensão
  é feita fio a fio, então o fundo é literalmente isso.
- **"Qual olhar é o seu?"** — a seção-assinatura. Um olho desenhado em SVG onde
  cada técnica **redesenha os fios de verdade**: o Fox Eyes puxa o comprimento
  pro canto de fora, o Egípcio 5D enche, o Lash lifting encurta e enrola. O olho
  pisca ao trocar (o piscar esconde a troca) e a íris acompanha o ponteiro.
- Galeria em trilho horizontal com 7 trabalhos · "Quem faz" com as duas ·
  contato · chat de IA.

## O agente (`spaco_beauty` no agents.yaml)

Testado com 5 perguntas-armadilha. Recusa preço, não confirma dia de agenda,
não passa endereço, não dá parecer sobre alergia e **não diz quanto tempo a
extensão dura** — nesta última ele falhou no 1º teste (inventou "de 4 a 6
semanas") e a regra foi apertada.

⚠️ **O chat só funciona depois do push do `agents.yaml`.**
