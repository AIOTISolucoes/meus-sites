# LS Barbearia — o que foi feito e o que falta

Cliente: **@lsbarbearia_** · 18,6 mil seguidores · Av. Contorno Leste, 125 —
Novo Mondubim, Fortaleza (CE). Site feito em 07/ago/2026.

**É o maior alvo da carteira** — passou o RFlores (16,4 mil) e a Fisioclin (4.978).

---

## ✅ Pronto

- **Site completo** em `index.html` + `css/estilo.css?v=1` + `js/main.js?v=1`.
- **Agente `ls_barbearia`** no `agents.yaml` da raiz do projeto.
- **Vídeo de venda**: `vendas/video-lsbarbearia.mp4` — 49s, 1440×900, 3,4 MB.
  Script em `vendas/gravar-video-lsbarbearia.py`.

## ⚠️ O chat do site NÃO funciona até o push

O `js/chat.js` aponta pro app no Streamlit Cloud, e o agente `ls_barbearia` só
existe no `agents.yaml` local. **Enquanto o `agents.yaml` não for pushado, a
caixinha abre e não responde.** O push é você quem roda (`git push origin main`).

Depois do deploy, testar no ar:
`?agente=ls_barbearia&embed=true&cor=faec41`

---

## Identidade

- **Paleta**: preto `#12100a` + **amarelo `#faec41`** (medido no pixel da logo)
  + **concreto `#e8e6e1`** — o cinza da parede da barbearia, tirado das fotos
  do mural.
- ⚠️ O Félix também é preto + dourado. O que separa: aqui o amarelo é **ácido**,
  não dourado, e a superfície clara é concreto frio, não creme. Se ainda
  parecerem parentes no portfólio, **esfriar mais o concreto — nunca esquentar
  o amarelo**, que é a cor real da marca.
- **Fontes**: Oswald (condensada, é a letra da faixa do próprio brasão) + Barlow.
- **Brasão** em `assets/brasao.svg`, inline no `index.html` pra intro animada.
  Na nav vai um **monograma LS simplificado** — o brasão inteiro vira borrão
  abaixo de ~90px.

## A seção-assinatura: o seletor de degradê

O gesto central da barbearia é a mão subindo a lateral da cabeça pra decidir
onde o degradê começa. No site quem faz o gesto é quem está olhando: **arrasta
na cabeça e o cabelo é redesenhado fio a fio** — comprimento, densidade e peso
mudam de verdade ao longo da altura. Não é troca de imagem pronta.

Tem os quatro presets (baixo, médio, alto, navalhado), funciona no teclado
(setas, Home, End) e no toque, e o botão **copia a mensagem pronta e abre o
Direct** — porque `ig.me/m/` não aceita texto na URL, diferente do `wa.me`.

---

## ❓ 3 coisas pra confirmar com o cliente antes de publicar

1. **"Barba e acabamento" é dedução minha.** As fotos mostram barbas
   aparadas e o nome é "barbearia", mas o perfil não lista o serviço em texto.
   Confirmar que fazem barba.
2. **O nome do dono.** A assinatura em cursiva no mural do brasão parece ler
   **"Leandro Silva"** — o que explicaria o "LS". Está borrada nas fotos, então
   **não entrou no site**. Se ele confirmar, dá pra usar.
3. **Sem horário e sem telefone.** O perfil só publica "terça a sábado", sem
   hora, e não tem número em lugar nenhum. Por isso tudo vai pro **Direct**
   (decisão do usuário, ciente de que converte menos que WhatsApp). Com um
   número, é trocar os links.

## Sobre as fotos

10 fotos do feed, cortadas em 3:4 e uniformizadas com o mesmo filtro (vinham de
reel e de post, com temperaturas diferentes).

⚠️ **`fachada-resenha.jpg` NÃO é a fachada** — é um cliente posando na rua. O
nome do arquivo engana. **Não existe foto da fachada nem do interior amplo.**
Pedir isso pro cliente é o maior ganho possível no site.

As duas melhores são `navalha-acabamento.jpg` e `degrade-parede.jpg`: são as
únicas em que o **mural do brasão** aparece.

---

## Próximos da fila

**Drummer** (@drummerbarbearia, 1.320 seg) e **Diretoria**
(@diretoriabarberoficial, 850 seg) — ainda não começados. As três logos são
amarelo-no-preto, então o plano combinado é separar pelo resto: Drummer
industrial monocromático (a logo já é P&B), Diretoria no amarelo com tratamento
diferente.
