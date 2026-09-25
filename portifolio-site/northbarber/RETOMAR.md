# North Barber Shop — o que foi feito e o que falta

Cliente: **@shopnorthbarber** · 7.144 seguidores · **TRÊS unidades em
Fortaleza**. Site feito em 12/ago/2026. É o maior perfil deste lote.

---

## ✅ Pronto

- **Site** em `index.html` + `css/estilo.css?v=1` + `js/main.js?v=2`.
- **Agente `north_barber`** no `agents.yaml` da raiz.
- **Vídeo**: `vendas/video-northbarber.mp4` — 50,3s, gravado em **13/ago**.
  Script em `vendas/gravar-video-northbarber.py`.

> ⚠️ Esta linha dizia, em 12/ago, que o vídeo tinha sido "gravado no fim da
> sessão". **Não tinha** — a sessão acabou antes. Ficou 1 dia como pendência
> invisível, porque o próprio arquivo de retomada afirmava que estava pronto.
> Lição: só escrever "feito" depois de conferir o arquivo no disco.

## ⚠️ O chat só funciona depois do push do `agents.yaml`

Testar no ar depois: `?agente=north_barber&embed=true&cor=c62430`

---

## As três unidades (tudo saiu de posts DELES)

| unidade | endereço | WhatsApp |
|---|---|---|
| **Presidente Kennedy** | Av. Gov. Parsifal Barroso, 399 — New Mall, em frente ao Parque Rachel de Queiroz | (85) 9 8472-9029 |
| **Parquelândia** | Av. Jovita Feitosa, 2580 — Loja 03, anexado ao Cometa | (88) 9 9635-3430 |
| **Montese** | Buena Vista Mall — Rua 15 de Novembro, 340, próximo à Greenlife | (85) 9 2185-2119 |

⚠️ O telefone da Parquelândia tem **DDD 88**, não 85. Está assim no post
deles. Parece erro, mas foi copiado como está — **confirmar antes de publicar**
(mesmo cuidado do WhatsApp de 8 dígitos da Ah Imobiliária).

**Sala VIP, visagismo, cadeira kids e estacionamento** estão confirmados
**só na unidade Kennedy** — o post é sobre a inauguração dela. O site e o
agente não afirmam nada sobre as outras duas.

## O plano de assinatura — a razão de ser da seção-assinatura

Cabelo **R$ 99,90/mês** · Barba **R$ 119,90/mês** · Cabelo e barba
**R$ 199,90/mês**. Inclui corte ou barboterapia, lavagem relaxante,
capuccino/café/chocolate à vontade, finalização com escova e pomada, massagem
e **15% off em produtos e serviços**.

**A seção-assinatura é a conta disso**: a pessoa escolhe quantas vezes vai por
mês (1 a 6) e o site divide o valor mensal por esse número, mostrando quanto
sai *cada ida* nos três planos.

⚠️ **O site NÃO compara com o preço avulso e não diz "você economiza X".**
O valor avulso de corte e barba não está publicado em lugar nenhum — a
comparação exigiria inventar esse número, que é o erro que queima o cliente.
O agente tem a mesma regra.

### 🐛 Bug do agente pego DURANTE a gravação (13/ago) — e corrigido

Perguntado "quanto custa o corte avulso? e o plano vale nas três unidades?",
ele recusou o preço certinho mas respondeu **"o plano de assinatura é válido,
mas veja os detalhes com a unidade"** — ou seja, **afirmou o que ninguém
publicou**. A regra existia, mas estava enterrada numa lista de proibições no
fim do prompt.

O conserto foi subir um aviso explícito pra dentro do bloco do plano, citando
a frase errada. Depois disso a resposta virou *"não sei se vale em mais de uma
unidade, isso a barbearia explica"*. **A primeira gravação foi jogada fora e
refeita.**

**Lição pros próximos:** regra de "não invente X" só funciona perto do bloco
que fala de X. E **conferir o último frame do vídeo antes de dar por pronto** —
foi lá que isso apareceu.

## 🔴 O que confirmar com o cliente

1. **DDD 88 da Parquelândia** (acima).
2. **Horário de funcionamento** — eles não publicam. O site inteiro diz "quem
   confirma é a unidade". Com o horário, entra uma seção como a da Gentleman.
3. **Preço avulso** dos serviços. Existe destaque "VALORES" no Instagram, mas
   **destaque é story e exige login** — não abre. Pedir print.
4. **Regras do plano**: quantos cortes por mês, se tem fidelidade/carência, se
   vale nas três unidades. Nada disso está publicado; o agente se recusa a
   responder.
5. **A foto do card da Parquelândia não é da Parquelândia.** Nenhuma foto do
   feed identifica essa unidade, então o card usa uma foto neutra (o balcão de
   produtos) e o `alt` não menciona o bairro. Com uma foto real, é trocar o
   arquivo.

## Identidade

- **Paleta**: marinho `#01052a` (medido — é a cor dominante da logo, 9.089 px)
  + azul `#16407a` + **vermelho do poste `#c62430`** + gelo `#eef2f8`.
- ⚠️ A **Claudia** também é marinho + azul + gelo. O que separa: aqui existe
  **vermelho** (ela não tem nenhum) e o marinho é bem mais fundo. Se ficarem
  parecidos, aumentar o vermelho — nunca clarear o marinho.
- ⚠️ O vermelho sobre marinho dá **4,0:1** e reprova em AA para TEXTO. Por
  isso existe `--vermelho-claro #f2606a` (5,6:1), que é a versão que vira
  letra no escuro. O `--vermelho` só entra em bloco e em detalhe.
- **Fontes**: Sora + Plus Jakarta Sans. Nenhuma usada em outro site do
  portfólio, e as outras barbearias são todas condensadas/pesadas.
- **A marca**: o "N" é feito de uma **navalha** (perna esquerda) e de um
  **poste de barbeiro** (perna direita). É o melhor detalhe da logo e é o que
  a intro mostra primeiro; o poste também virou a textura do hero.
  O **anel fino** da logo não sobrevive ao limiar do vetorizador (é um traço
  de 1px em azul sobre marinho): ele é **redesenhado à mão** como um
  `<circle>` no `index.html`, e é ele que se desenha na abertura.

## Sobre as fotos

⚠️ **Metade do feed da North é arte de post com texto por cima**, não
fotografia. Por isso várias fotos do site são **recortes** feitos de dentro
dessas artes (`_modelo/ferramentas/tratar2.py`, campo de pré-corte):
`unidade-kennedy` saiu do post de inauguração, `unidade-montese` saiu do
mockup de celular do post da Montese, `primeiro-corte` saiu do post do corte
infantil.

Pedir fotos limpas do interior das três unidades é o maior ganho possível.
