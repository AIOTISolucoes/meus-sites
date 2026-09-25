# Diretoria Barber — o que foi feito e o que falta

Cliente: **@diretoriabarberoficial** · 850 seguidores · Rua das Cerejeiras,
435 — Conjunto Esperança, Fortaleza (CE). Site feito em 07/ago/2026.

Terceiro e último do lote de 3 barbearias. Ver `../lsbarbearia/RETOMAR.md` e
`../drummer/RETOMAR.md`.

---

## ✅ Pronto

- **Site completo** em `index.html` + `css/estilo.css?v=1` + `js/main.js?v=1`.
- **Agente `diretoria_barber`** no `agents.yaml` da raiz do projeto.
- **Vídeo de venda**: `vendas/video-diretoria.mp4` — 49s, 1440×900, 3,0 MB.
  Script em `vendas/gravar-video-diretoria.py`.

## ⚠️ O chat do site NÃO funciona até o push

Sem o push do `agents.yaml`, a caixinha abre e não responde (o widget aponta
pro Streamlit Cloud). Depois do deploy:
`?agente=diretoria_barber&embed=true&cor=e8a71d`.

---

## 🔴 O CONFLITO DE HORÁRIO — decidir com o cliente

**As duas fontes públicas deles discordam:**

| Fonte | O que diz |
|---|---|
| **Bio do Instagram** | "Seg a Sab- 08:30 à 12hrs - **14:30 à 19hrs**; Dom das 08:30 à 12hrs" — ou seja, **fecham para o almoço** |
| **Página de agendamento** | seg–sex 08:30–19:00 e sáb 08:30–19:30, **corrido, sem intervalo** |

**O site usa a versão da BIO** (com o intervalo), porque é o que o dono
escreveu com todas as letras e um intervalo não é o tipo de coisa que se
inventa — o mais provável é que o sistema de agendamento só guarde a faixa
externa.

⚠️ **Isso precisa ser confirmado com ele.** Se não fecharem para o almoço, o
site inteiro muda de sentido: a seção-assinatura É o horário. Mexer em dois
lugares: as constantes `MANHA`/`TARDE` no fim do `js/main.js` e o bloco
"HORÁRIO" do agente `diretoria_barber` no `agents.yaml`.

Também descobrimos, na página deles, dois dados que a pesquisa anterior dava
como inexistentes: a **rua** (Cerejeiras, 435) e o **telefone**
(85 99612-1736).

---

## A tabela de preços (fonte: página de agendamento deles)

| | |
|---|---|
| Corte social | R$ 25 |
| Corte todo na tesoura | R$ 30 |
| Corte degradê | R$ 35 |
| Sobrancelha | R$ 5 |
| Acabamento | R$ 10 |
| Barba | R$ 25 |
| Social + sobrancelha | R$ 25 |
| Degradê + sobrancelha | R$ 40 |
| Social + barba | R$ 40 |
| Degradê + barba | R$ 45 |
| Combo completo (corte + barba + sobrancelha) | R$ 45 |

Detalhe que virou destaque no site: **social + sobrancelha custa o mesmo que o
social sozinho** — a sobrancelha vai junto sem cobrar. Está na tabela deles.

⚠️ **"Combo completo R$ 45" é AMBÍGUO**: a tabela não diz qual corte está
incluído, e "Degradê + barba" já custa R$ 45. O site lista exatamente como
eles escreveram e o agente foi instruído a **dizer que não sabe e mandar
confirmar** — não escolher por conta própria. Testado, ele obedece.

Outros dados públicos: pagamento em PIX, cartão e dinheiro; Wi-Fi,
ar-condicionado, café e video game.

---

## Identidade

- **Paleta**: breu quente `#16110c` + **âmbar `#e8a71d`** (medido no pixel da
  logo) + **tijolo `#b58860`** (medido na parede deles) sobre osso `#f3e9da`.
- ⚠️ **Terceira barbearia seguida e quarto site com âmbar/dourado.** Os três
  amarelos são de matiz diferente de propósito: LS é limão ácido `#faec41`,
  Drummer é latão fosco `#a97b2e`, Diretoria é laranja-mel `#e8a71d`. **Não
  unificar.** O que separa de vez é o tijolo, que nenhum outro site tem.
- **Fontes**: Bevan (slab de placa antiga) + Work Sans. A casa deles é
  **clássica** — tijolo aparente, poste de barbeiro, sofá capitonê, quadros
  emoldurados, toalha quente —, então a estética é de placa esmaltada velha,
  não de cartaz moderno (Drummer) nem heráldica (LS).
- O hero **não tem canvas**: as listras do poste são CSS e o globo de luz
  segue o ponteiro só com `transform`. Um terceiro canvas na série custaria
  caro sem ficar mais forte que isso.

## A seção-assinatura: a semana

O que a Diretoria tem que as outras duas não têm: **abre domingo de manhã**.
E **fecha para o almoço**, que é o que faz a pessoa bater na porta fechada.

Então a assinatura é a semana inteira desenhada, com a linha da hora que se
arrasta. O intervalo aparece como um buraco de verdade no meio da semana e o
domingo é visivelmente mais curto — dá pra entender antes mesmo de interagir.
Funciona no teclado (setas, Home, End) e no toque.

## Sobre as fotos

8 fotos do feed, recortadas em 3:4 com **grade quente vintage** (preto
levantado, luz puxada pro âmbar). Não é duotone — isso é do Drummer — nem véu
amarelo — isso é do LS. A grade preserva a cor do tijolo, que é o que dá a
identidade da casa.

As janelas de recorte excluem as legendas queimadas dos reels
(`sobrancelha.jpg` corta em cima). Se recortar de novo, conferir.

## ❓ Pra confirmar com o cliente

1. **O horário** (ver o bloco vermelho acima). É a pergunta mais importante.
2. **Qual corte entra no "Combo completo" de R$ 45.**
3. **Os nomes dos barbeiros.** Os posts são creditados a "Matheus" e
   "Renan Leal", o que sugere que são eles, mas isso é crédito de post
   colaborativo e **não entrou no site**.
4. **Faltam fotos boas da fachada.** Tudo que existe é frame de reel a 360px.
