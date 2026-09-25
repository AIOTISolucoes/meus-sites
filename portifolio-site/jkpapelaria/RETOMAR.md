# JK Papelaria Personalizada — o que foi feito e o que falta

9º site de cliente. Feito em 02/ago/2026, a partir de `portifolio-site/_modelo/`.
Pasta untracked, como todos os sites de cliente. O agente `jk_papelaria` está no
`agents.yaml` (esse sim vai pro repo).

## A cliente

- Instagram: **@jk_mimospersonalizados** · **4.524 seguidores**
- Bio: "Papelaria Personalizada para todos os momentos"
- **Itaitinga / Fortaleza — CE** (a cidade é publicada; rua e número, não)
- **WhatsApp: 5585997703618** (link da bio)
- A logo traz o lema **"Personalizando seu sonho"**
- Envio para todo o Brasil

### O que ela vende (tudo tirado do feed e dos destaques)

Mimos impressos para recortar e montar · topos de bolo · sacolinhas e mini kits ·
lembrancinhas · cards de agradecimento 7 × 10 cm · impressão de fotos em polaroid ·
canecas personalizadas · impressão em geral.

### Dados técnicos reais usados no site

- **Papel offset 180 g** (post dos mimos impressos)
- **Até 5 dias úteis** de produção (mesmo post)
- Artes prontas personalizadas **com nome e idade**

## ⚠️ DECISÕES QUE PRECISAM DA CONFIRMAÇÃO DELA

1. **Os preços entraram, cada um com a DATA em que foi anunciado** (decisão sua
   em 02/ago). Todos os valores dela vêm rotulados como promoção, e promoção
   vence — a data é o que separa "promoção divulgada em julho" de "tabela de
   preço", e é ela que protege a cliente se o valor mudar. Seção `#promocoes`:
   - 50 mimos + 50 apliques por **R$ 49,90** com 2 displays de brinde — 28/07/2026
   - 100 cards de agradecimento 7 × 10 cm por **R$ 39,90** — 08/07/2026
   - 10 fotos polaroid por **R$ 16,00** — 08/07/2026
   - topo de bolo com nome, glitter verde + 3 flores G por **R$ 14,00** — 23/06/2026

   **Ficou de fora**: "10 topos por R$ 60,00", da Semana do Consumidor de
   março/2026 — velho demais pra publicar como corrente.

   O agente conhece exatamente essas quatro e **sempre** responde com a data +
   "a JK confirma se ainda está valendo". Fora delas não fala preço, não estima
   e **não faz regra de três** (testado: recusou calcular 200 mimos a partir do
   valor de 50). **Quando ela mudar as promoções, é editar os 4 cards no
   `index.html` E a lista no `agents.yaml` — os dois.**

2. **Horário de funcionamento não entrou, e não pode entrar.** Ela posta um story
   de "horários disponíveis PARA ESTA SEMANA" (segunda impressão em geral, terça
   a quinta topos e mimos, sexta agenda fechada, sábado sem atendimento). Isso é
   a agenda **de uma semana**, não o horário da loja. É a mesma armadilha do post
   de horário excepcional da Fisioclin. O agente também está proibido de dizer.

3. **As imagens da galeria são recortes das artes de divulgação dela**, não fotos
   de produto. Só existe uma foto "de estúdio" no feed (a mesa de sacolinhas) e
   ela parece composição. **Pedir fotos reais dos produtos é o maior ganho
   possível no site** — é só trocar os arquivos mantendo os nomes.

4. Personagens licenciados (Homem-Aranha, Sonic, Toy Story...) aparecem nas
   sacolinhas do feed dela, mas **não foram reproduzidos no site** e o agente não
   promete nenhum. Assunto dela com os clientes, não nosso.

## O site

`index.html` + `css/estilo.css?v=1` + `js/main.js?v=1` + `js/chat.js?v=1`.
GSAP 3.12.5 + ScrollTrigger por CDN. **Ao editar css/js, subir o `?v=N`.**

- **Paleta medida no pixel da logo**: magenta **#cc0084** (o "JK") + verde-menta
  **#18b484** (o anel). Fundo escuro em ameixa #3a0a2b, superfícies claras em
  rosa-branco. Não repete nenhum dos 8 sites anteriores.
- **Fontes**: Newsreader (títulos) + Outfit (texto) + **Caveat** — a palavra
  destacada de cada título sai **manuscrita**, não em itálico, porque o lema da
  logo dela é escrito à mão. Nenhuma das três foi usada em outro cliente.
- **Intro**: anel, balões e cordões da logo se desenhando; o "JK" entra depois.
- **Hero: varal de bandeirinhas com física de corda (Verlet).** Dá pra
  **empurrar o varal com o ponteiro** e ele balança e assenta sozinho.
- **Seção-assinatura: "Escreva um nome e monte a caixinha".** A pessoa digita o
  nome, escolhe a idade e uma das 4 paletas, e a **folha plana impressa se dobra
  em caixinha** conforme ela arrasta a barra — em CSS 3D, cada parede girando em
  torno da aresta que a prende à base. Dá pra arrastar o desenho pra girar. O
  botão de WhatsApp embaixo já vai com o nome digitado na mensagem.
  Ela monta sozinha uma vez quando a seção aparece, senão ninguém descobre a barra.
- Ficha "como chega até você" · galeria em trilho horizontal (6 painéis, em três
  proporções, porque as artes dela não são todas retrato) · contato · widget de chat.

## O agente `jk_papelaria`

Coleta: nome · o que quer · tema da festa · nome e idade na arte · quantidade ·
**data da festa** (o dado mais importante) · retirada ou envio · contato.
Termina com `📋 RESUMO DO PEDIDO`.

Proibições testadas em 6 armadilhas, passou nas 6: não fala preço (nem repete
promoção do Instagram), **não promete prazo nem diz "dá tempo"**, não confirma
dia de atendimento, não promete personagem ou modelo, não passa endereço com rua,
não calcula frete.

⚠️ **O chat do site só responde depois do push do `agents.yaml`** — o widget
aponta pro app no Streamlit Cloud.

## 🎥 Vídeo demo FEITO (02/ago)

**`vendas/video-jkpapelaria.mp4`** — 46,5s, 1440×900, 4,4 MB.
Script salvo em **`vendas/gravar-video-jk.py`** (não reescrever do zero).

Roteiro: intro 3,3s · **o ponteiro empurrando o varal de bandeirinhas** ·
serviços · promoções com as datas · **a seção-assinatura completa** (clica no
campo, digita "Manuela", troca a cor pra Doce, arrasta a barra desmontando a
caixinha até a folha plana e montando de novo) · galeria · chat com 2 turnos
reais.

O melhor momento do vídeo é o fim: perguntam *"Tema ursinho, ela faz 3 anos.
Quanto sai o kit?"* e o agente responde **R$ 49,90 com a data de 28/07/2026 e a
ressalva de que a JK confirma se ainda está valendo** — mostra o produto e a
honestidade na mesma tomada.

⏱️ Honestidade: só a 1ª espera da IA foi comprimida (4,0s capturados → 3,0s, que
é a latência real sem captura — tirar screenshot rouba CPU do Streamlit). A 2ª
espera saiu em 2,2s reais, sem compressão. Nada mais foi acelerado.

## Falta fazer

1. **Commitar e pushar o `agents.yaml`** (push é do usuário) e depois testar no
   ar: `?agente=jk_papelaria&embed=true&cor=cc0084`.
2. Escrever a mensagem de abordagem (padrão da Colmeia: não mandar link na 1ª
   mensagem, mandar o vídeo junto, 2 semanas grátis).
3. Confirmar com ela os 4 pontos da seção de decisões acima.
