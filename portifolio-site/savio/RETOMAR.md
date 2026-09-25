# Sávio Barbearia — o que foi feito e o que falta

Cliente: **@saviobarbearia** · **3,2 mil seguidores** · Messejana, Fortaleza
(CE). Site feito em 12/ago/2026, vídeo em 13/ago.

É a **6ª barbearia** do portfólio e, de longe, **o cliente que menos publica
informação** da carteira inteira. Isso define o site todo.

---

## ✅ Pronto

- **Site completo** em `index.html` + `css/estilo.css` + `js/main.js`.
- **Agente `savio_barbearia`** no `agents.yaml` da raiz.
- **Vídeo de venda**: `vendas/video-savio.mp4` — 50,7s, 1440×900.
  Script em `vendas/gravar-video-savio.py`.

## ⚠️ O chat do site NÃO funciona até o push

O `js/chat.js` aponta pro app no Streamlit Cloud e o agente `savio_barbearia`
só existe no `agents.yaml` local. **Enquanto o `agents.yaml` não for pushado, a
caixinha abre e não responde.** O push é você quem roda
(`git push origin main`).

Depois do deploy, testar no ar:
`?agente=savio_barbearia&embed=true&cor=8a5334`

---

## 🔴 O problema central: quase nada é público

Isto **não é falta de pesquisa**, é o que existe. Tudo o que a Sávio publica:

- Bairro: **Messejana, Fortaleza (CE)** — e só o bairro.
- WhatsApp: **(85) 9 8507-5395**.
- Serviços: **corte, barba** e **plano de assinatura**.
- **Estacionamento grátis** (está escrito na bio).

**NÃO existe em lugar nenhum**, e por isso não está no site nem no agente:

1. **Endereço com rua e número.**
2. **Horário de funcionamento** — nenhum dia, nenhuma hora.
3. **Preço de nada** — nem corte, nem barba, nem o plano. A página de planos
   deles **exige criar conta**, então não é pública.
4. **Regras do plano**: quantos cortes inclui, fidelidade, carência, multa.

⚠️ **Consequência de projeto: este é o único site da carteira SEM seção "onde
fica".** Não é esquecimento — inventar essa seção com meio endereço seria pior
que não ter. Com os dados do cliente, ela entra em minutos e o site cresce
muito.

**É o cliente com o maior ganho possível numa única resposta dele.** Uma
mensagem com endereço, horário e tabela de preços muda três seções do site e
metade do prompt do agente.

## A armadilha que isso criou no agente (pega em teste, vale pros próximos)

Um agente que sabe pouco tende a responder **"isso não está publicado" pra
tudo, no automático** — inclusive pro que não é pergunta de informação. Duas
regras explícitas foram escritas por causa disso:

1. **Pergunta sobre saúde não é pergunta sobre informação.** Caspa, coceira,
   queda de cabelo, alergia: a resposta é o barbeiro na cadeira e, se for
   saúde, um dermatologista — nunca "não está publicado".
2. O que ele **sabe**, ele diz com segurança: estacionamento grátis e o bairro
   saem sem ressalva. No vídeo isso é a primeira pergunta, de propósito.

## A seção-assinatura: Verdade ou mito?

**É o que a própria Sávio pergunta nos reels dela.** Seis cartas de mito de
barbearia (raspar a cabeça, aparar as pontas, boné e calvície, água quente,
raspar a barba, dormir de cabelo molhado). A pessoa chuta, a carta **vira em
3D** e mostra a resposta com a explicação; o placar conta os acertos.

Duas decisões que sustentam a seção:

- **As respostas ficam no terreno do "o que se observa"**, nunca no do
  diagnóstico. Embaixo do quiz está escrito, na tela, que queda de cabelo e
  couro cabeludo são assunto de dermatologista.
- **Nenhuma carta vende serviço.** É a barbearia sabendo do assunto, não
  fazendo propaganda — que é justamente o tom dos reels deles.

## Identidade

- **Paleta**: vinho `#1d0505` + **marrom `#8a5334`** (o **uniforme** da equipe)
  + tijolo `#9a5a3e` + creme `#f3ebdd`. Marrom-claro `#c78d63` é a versão que
  vira LETRA sobre escuro — não trocar um pelo outro.
- **Fontes**: Alfa Slab One + Asap. A slab pesada combina com a parede de
  tijolo e separa do resto do portfólio.
- **O hero é a frase da parede deles**: *"Você só vence amanhã se não desistir
  hoje"*, que está escrita em cursiva no salão. Num cliente sem dados, **o que
  o lugar tem escrito na parede vira o hero** — vale como técnica pros
  próximos.

## Sobre as fotos

6 fotos do feed em 3:4, com o filtro quente da casa (a parede de tijolo é a
identidade visual do salão). Não existe foto de fachada. Como sempre: **tudo é
frame de reel** — pedir fotos limpas é o maior ganho depois dos dados.
