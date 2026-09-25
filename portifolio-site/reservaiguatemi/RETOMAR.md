# Reserva Iguatemi Bosque — o que foi feito e o que falta

10º site de cliente. Feito em 02/ago/2026, a partir de `portifolio-site/_modelo/`.
Pasta untracked. O agente `reserva_iguatemi` está no `agents.yaml`.

## ⚠️ LEIA ISTO ANTES DE ABORDAR

**O perfil não é o que a gente achava.** A memória registrava
`@reservaiguatemifortaleza` como "empreendimento imobiliário com equipe de
vendas, casa com o plano de leads". **Não é.** É uma **loja da grife Reserva**
dentro do Shopping Iguatemi Bosque, em Fortaleza. O linktree com "o link de cada
consultor" é o time de **vendedores da loja**, não corretores.

Consequências que valem pra decisão de vender:

1. **É franquia de marca nacional.** Rede de franquia costuma proibir a loja de
   ter site próprio, e usar a identidade da marca sem autorização é problema
   sério. Por isso, **decisão sua em 02/ago**: fazer uma **página de atendimento**,
   não um site/vitrine da marca. A página não tem catálogo, não tem preço, não
   reproduz campanha da marca e **não redesenha nenhuma logo** — nem a da
   Reserva, nem o passarinho do Iguatemi (que é o que está na foto do perfil).
   As cores saíram das FOTOS da loja, medidas no pixel, não de manual de marca.
2. **Quem decide contratar provavelmente não é o gerente da loja.** Vale
   confirmar antes de investir na abordagem.
3. **O perfil é fraco**: 725 seguidores, 12 posts, último de maio/2026.

Se em algum momento o franqueador barrar, o trabalho não se perde: a mesma
página serve pra qualquer loja de shopping com equipe de vendedores.

## Dados reais (tudo publicado pelo perfil)

- Instagram: **@reservaiguatemifortaleza** · nome: **Reserva Iguatemi Bosque**
- Bio: "A sua @reserva em Fortaleza! · Enviamos para todo o Brasil ·
  Shopping Iguatemi Bosque - Piso L2"
- **WhatsApp da loja: 5585991654590**
- **Os 5 consultores, do linktree** (cada um com o próprio número):
  | consultor | WhatsApp |
  |---|---|
  | Marcos | 5585987694942 |
  | Jaqueline | 5585996556071 |
  | Jackson | 5585994222808 |
  | Phillippe | 5585991148898 |
  | Rejania | 5585988165112 |

**Não publicado, então não entrou em lugar nenhum**: horário de funcionamento,
preço, tamanhos, estoque, endereço com rua e número.

## O site

`index.html` + `css/estilo.css?v=1` + `js/main.js?v=1` + `js/chat.js?v=1`.
GSAP 3.12.5 + ScrollTrigger por CDN. **Ao editar css/js, subir o `?v=N`.**

- **Paleta medida no pixel das fotos da loja**: vermelho do letreiro **#9f092c**
  + madeira do piso **#b47d42**, sobre areia clara. Superfície CLARA de
  propósito — Sabtec, Félix e Butterfly já são três sites escuros.
- **Fontes**: Instrument Serif + DM Sans. Nenhuma das duas usada em outro cliente.
- **Intro**: um **cabide** se desenhando — é o objeto da loja e é o mesmo gesto
  da seção-assinatura.
- **Hero**: a foto real da entrada da loja ao lado do texto. Loja física precisa
  mostrar que existe e tem cara.
- **Seção-assinatura: A ARARA.** Cinco fichas penduradas num trilho de madeira;
  **elas se abrem e inclinam conforme o ponteiro passa entre elas**, exatamente
  como a gente afasta cabide numa arara pra ver a peça de trás — e voltam
  sozinhas. Antes das fichas, dois filtros ("pra mim / presente / não sei" e
  "experimentar na loja / receber em casa") que **entram na mensagem do
  WhatsApp**: quem clica em "Marcos" já chega lá com
  *"Oi, Marcos! Vim pelo site da loja — quero um presente, e prefiro receber em casa."*
  Tem também **"Tanto faz, escolhe por mim"**, que sorteia um consultor, destaca
  a ficha e mostra o nome — de propósito **não abre o WhatsApp sozinho**.
- "Como funciona" (passar na loja / buscar já separado / receber em casa) ·
  "Onde fica" com a foto da vitrine + Piso L2 + botão de mapa · contato · chat.

### Detalhes técnicos que custaram tempo

- Só existem **DUAS fotos reais da loja** no perfil inteiro. Uma foi pro hero e
  a outra pro "onde fica". A primeira versão repetia a mesma foto cortada de
  dois jeitos na mesma seção e **ficava na cara** — por isso a segunda coluna
  virou informação de localização em vez de foto.
- `left: 0; right: 0` num elemento absoluto dentro de container com
  `overflow-x: auto` mede a largura **visível**, não a rolável: no celular o
  trilho da arara acabava no meio e as duas últimas fichas ficavam penduradas
  no nada. Corrigido com largura fixa.
- `legend` não obedece o `align-items` do `fieldset` — precisa de
  `width: 100%; text-align: center`.
- No celular a arara vira faixa de arrasto com `scroll-snap`: o `pointermove`
  ignora `pointerType === 'touch'`, senão empurrar as fichas brigaria com o
  scroll horizontal.
- Em movimento reduzido a arara **continua respondendo**, só com metade da
  amplitude e mais devagar — ela É a interação da página, desligar deixaria a
  seção morta. Testado.

## O agente `reserva_iguatemi`

Coleta: nome · o que procura · pra si ou presente · tamanho que costuma usar ·
como prefere (loja / buscar / receber) · cidade · contato. Termina com
`📋 RESUMO DO ATENDIMENTO`.

Testado em 6 armadilhas, passou nas 6: não fala preço, **não afirma que tem ou
não tem peça/tamanho/cor** (não vê estoque), não informa horário, **não
recomenda tamanho por altura e peso**, não trata troca de compra feita em outro
canal e não fala de cupom ou desconto. Também está instruído a falar como a
LOJA e não como a marca.

⚠️ **O chat do site só responde depois do push do `agents.yaml`.**

## 🎥 Vídeo demo FEITO (02/ago)

**`vendas/video-reservaiguatemi.mp4`** — 43,8s, 1440×900, 4,3 MB.
Script salvo em **`vendas/gravar-video-reserva.py`**.

Roteiro: intro do cabide 3,3s · hero com a foto da loja · categorias ·
**a ARARA** (a mão atravessa as cinco fichas devagar e elas se abrem e
inclinam, depois volta abrindo do outro lado), clica no filtro "Um presente" e
no "Tanto faz, escolhe por mim" · como funciona · onde fica · chat com 2 turnos.

⚠️ **As fichas são links pro wa.me**: no vídeo o ponteiro só PASSA por cima
delas (é isso que abre a arara), nunca clica — clicar sairia do site no meio da
tomada. Os únicos cliques da seção são no filtro e no botão de sorteio.

⏱️ Honestidade: **nenhuma espera precisou ser comprimida** neste vídeo (1,9s e
2,5s de latência real da IA). Nada foi acelerado.

## Falta fazer

1. **Commitar e pushar o `agents.yaml`** (push é do usuário) e testar no ar:
   `?agente=reserva_iguatemi&embed=true&cor=9f092c`.
2. Decidir se aborda — ver o bloco de alerta no topo.
3. Pedir fotos da loja: **duas fotos é o mínimo do mínimo**. Foto do interior,
   da parede de tênis e dos consultores (com autorização) mudaria a página de
   patamar — as fichas hoje são monograma justamente por falta de retrato.
