# Gentleman Barbearia — o que foi feito e o que falta

Cliente: **@gentlemanbarbearias** · 11,3 mil seguidores · Av. Godofredo
Maciel, 3399 — Maraponga, Fortaleza (CE). Site feito em 12/ago/2026.

É a **4ª barbearia** do portfólio e o **2º maior perfil da carteira**, atrás
só da LS (18,6 mil).

---

## ✅ Pronto

- **Site completo** em `index.html` + `css/estilo.css?v=7` + `js/main.js?v=5`.
- **Agente `gentleman_barbearia`** no `agents.yaml` da raiz do projeto.
- **Vídeo de venda**: `vendas/video-gentleman.mp4` — 55s, 1440×900, 4,0 MB.
  Script em `vendas/gravar-video-gentleman.py`.

## ⚠️ O chat do site NÃO funciona até o push

O `js/chat.js` aponta pro app no Streamlit Cloud, e o agente
`gentleman_barbearia` só existe no `agents.yaml` local. **Enquanto o
`agents.yaml` não for pushado, a caixinha abre e não responde.** O push é você
quem roda (`git push origin main`).

Depois do deploy, testar no ar:
`?agente=gentleman_barbearia&embed=true&cor=e2621c`

---

## 🔴 4 coisas pra confirmar com o cliente ANTES de publicar

1. **Os preços.** Corte R$ 39,90 · Barba R$ 39,90 · Combo R$ 69,90 saíram da
   **tabela afixada na porta**, lida na foto da fachada que eles mesmos
   publicaram em **22/04/2026**. O site mostra os três **com a data e com a
   ressalva** (decisão sua, mesmo padrão da JK Papelaria). Se a tabela mudou,
   é trocar 3 números no `index.html` e 3 no `agents.yaml`.
2. **"Combo = corte + barba" é dedução minha.** O texto miúdo embaixo de cada
   preço na foto está ilegível a 640px — só o do COMBO dá pra arriscar. A
   aritmética fecha (39,90 + 39,90 = 79,80 contra 69,90 de combo), mas
   **ninguém escreveu isso em lugar nenhum**. Confirmar.
3. **"Domingo: fechado" é dedução minha.** A bio deles publica horário de
   **segunda a sexta (9h–19h)** e **sábado (9h–18h)**, e não diz nada sobre
   domingo. Ausência de horário quase sempre significa fechado, mas é
   inferência. Está no site e no agente.
4. **O que exatamente está incluído no corte e na barba** (lavagem? toalha
   quente?). O agente tem regra explícita de dizer que a tabela não
   especifica. Com a resposta, dá pra enriquecer os cartões.

## ❓ O que não deu pra descobrir

- **Preço de alinhamento capilar, platinado, sobrancelha e corte infantil.**
  Existem destaques "Valores" e "Localização" no Instagram, mas destaque é
  story e **exige login pra abrir** — não deu pra ler. Se ele conseguir os
  prints desses destaques, entram no site e no agente na hora.
- Nome do dono / dos barbeiros. Não aparece em lugar nenhum do perfil.

---

## Identidade

- **Paleta**: preto `#0f1216` + **laranja `#e2621c`** + **azul `#1b2532`** —
  as três cores do **poste de barbeiro da fachada deles**. Mais tijolo
  `#8a3f2b` (a parede do salão) e osso `#f4f1ea`.
- ⚠️ **As outras 3 barbearias do portfólio são amarelo sobre preto** (LS,
  Drummer, Diretoria). Esta escapa porque **a logo dela é BRANCA sobre
  preto**: a cor não vem da marca, vem do poste. Se um dia parecerem
  parentes, mexer no azul e no tijolo — **nunca puxar o laranja pro
  amarelo**, que é o que reaproximaria das outras.
- ⚠️ O laranja **reprova em AA sobre fundo claro** (3,10:1). Por isso existe
  `--laranja-tinta: #a33d08` (5,77:1), que é a versão que vira LETRA no
  claro. Não trocar um pelo outro.
- **Fontes**: Prata (didone, títulos — "fino trato") + Epilogue. Nenhuma das
  duas foi usada em outro site do portfólio, e as outras três barbearias são
  todas condensadas/pesadas (Oswald, Anton, Bevan): a diferença é proposital.

## A logo: reconstruída, não baixada

O Instagram **só entrega a foto de perfil em 150×150** (as URLs de resolução
maior voltam 403). O brasão foi **vetorizado por tracing** em
`../_modelo/ferramentas/vetorizar.py`: amplia com LANCZOS → borra → limiariza → marching
squares (skimage) → Douglas-Peucker → Catmull-Rom virando cúbicas.

Saída: `assets/brasao.svg` (38 kB, 3 grupos: cabeça / script / faixa+navalha)
e `assets/monograma.svg` (só a cabeça, pra nav). **Os dois estão colados
inline no `index.html`** — `../_modelo/ferramentas/injetar_svg.py` faz isso. Inline
porque a intro anima os grupos separados, e `fetch()` quebraria se o cliente
abrisse o `index.html` com dois cliques (file:// barra por CORS).

⚠️ **Se o cliente tiver o arquivo original da logo, use ele.** O tracing
ficou fiel, mas é reconstrução de um bitmap de 150px.

⚠️ **Não dá pra separar a cabeça escolhendo contornos**: no desenho a barba
encosta na gravata, que encosta nas lapelas — é tudo UMA região branca
conectada, um contorno só. O monograma sai de um recorte do BITMAP
(`CAIXA_CABECA` no script), feito antes de traçar.

## A seção-assinatura: Monte o seu Gentleman

O brasão deles **é** um homem de topete, barba cheia e gravata-borboleta.
Aqui quem escolhe o cabelo e a barba dele é quem está olhando: 4 cabelos
(topete, degradê, cachos, platinado), 3 barbas (cheia, desenhada, fazer) e a
sobrancelha. **Uma navalha varre o retrato a cada troca** — sem ela o desenho
pisca e parece falha de carregamento; com ela a troca vira o gesto da casa.

A conta se monta com a **tabela real**: mostra o combo, a economia de R$ 9,80
contra os dois avulsos, e as linhas "a combinar" pro que não tem preço
publicado. O botão leva a escolha pronta pro WhatsApp.

⚠️ **O retrato NÃO é o brasão vetorizado.** Naquele, barba e cabelo são a
mesma mancha branca. Este foi desenhado por partes, no mesmo espírito, e é
iterado em `../_modelo/ferramentas/retrato.html` (uma bancada que mostra 8 combinações
lado a lado) → `../_modelo/ferramentas/portar_retrato.py` leva pro `index.html`.

## Sobre as fotos

9 fotos do feed, cortadas em 3:4 (780×1040) e uniformizadas com o mesmo
filtro **quente** (`../_modelo/ferramentas/tratar.py`). Quente de propósito: **a parede
de tijolo é a marca visual do salão** e lavar a cor dela tiraria o que o site
tem de mais deles.

- ✅ **Existe foto da fachada** (`fachada.jpg`) — raro nesta carteira, e ela
  mostra o poste listrado E a tabela de preços. Aparece duas vezes no site.
- ⚠️ `barba-navalha.jpg` veio de um reel gravado **deitado**: precisa de
  `rotate(90)`, que já está no script. Sem isso sai de cabeça pra baixo.
- ⚠️ `alinhamento.jpg` é só o painel "DEPOIS" de um antes/depois — o
  pré-corte no script joga fora as tarjas do post.
- Descartadas: 3 fotos que eram arte de post com texto por cima.

---

## Armadilhas pagas nesta rodada

- **`.from({opacity:0})` num elemento que já nasce com `opacity:0` no CSS
  anima de 0 PARA 0.** A cabeça do brasão nunca aparecia na intro e a
  animação rodava inteira mostrando só o script. Tem que ser `fromTo`.
- **Ícone que quase coincide com outra forma some.** O ícone do combo tinha
  um círculo de cabeça e dois arcos passando a 2px dele: renderizava só o
  círculo. O círculo saiu.
- **Faixa larga não fica mais parecida com um poste de barbeiro**, fica um
  zebrado gigante atravessando a tela. Testado em 108px (ruim) e 52px (bom).
- **`padding` do palco encolhido no mobile joga a legenda por cima das
  lapelas.** A folga de baixo é o lugar da legenda, nos dois tamanhos.
- **Degradê em `background-clip: text` come os traços finos da Prata** (uma
  didone tem hastes de ~1px). A palavra em destaque saiu em cor chapada.
