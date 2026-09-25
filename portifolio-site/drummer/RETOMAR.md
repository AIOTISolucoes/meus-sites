# Drummer Barbearia — o que foi feito e o que falta

Cliente: **@drummerbarbearia** · 1.320 seguidores · Av. Édson Magalhães, 817 —
Bairro Industrial, Fortaleza (CE). Site feito em 07/ago/2026.

Segundo do lote de 3 barbearias. Ver `../lsbarbearia/RETOMAR.md` pro primeiro.

---

## ✅ Pronto

- **Site completo** em `index.html` + `css/estilo.css?v=1` + `js/main.js?v=1`.
- **Agente `drummer_barbearia`** no `agents.yaml` da raiz do projeto.
- **Vídeo de venda**: `vendas/video-drummer.mp4` — 48s, 1440×900, 5,2 MB.
  Script em `vendas/gravar-video-drummer.py`.

## ⚠️ O chat do site NÃO funciona até o push

O `js/chat.js` aponta pro app no Streamlit Cloud, e o agente `drummer_barbearia`
só existe no `agents.yaml` local. **Sem push, a caixinha abre e não responde.**
Depois do deploy: `?agente=drummer_barbearia&embed=true&cor=a97b2e`.

---

## 🔑 A descoberta que mudou este site

A página de agendamento deles é **pública**: `schedweb.com.br/drummerbarbearia`.
Ela traz **tabela de preços completa, horário de funcionamento, formas de
pagamento e comodidades** — tudo publicado pela própria barbearia.

Por isso, ao contrário de quase todos os outros clientes, **este site mostra
preço e o agente informa preço** (mesmo caso do Félix). Não é estimativa.

### A tabela (fonte: página de agendamento deles)

| | |
|---|---|
| Cortes (Degradê, Degradê Navalhado, Na Tesoura, Social, Kids) | R$ 35 |
| Barba | R$ 30 |
| Sobrancelha | R$ 10 |
| Acabamento | R$ 10 |
| Raspagem (cabelo) | R$ 20 |
| **Combo** Corte + Barba | R$ 60 |
| **Combo** Corte + Barba + Sobrancelha | R$ 70 |
| **Combo** Corte + Sobrancelha | R$ 45 |
| **Combo** Barba + Sobrancelha + Acabamento | R$ 50 |

⚠️ **Os combos valem só para Degradê, Social e Na Tesoura.** Degradê Navalhado
e Kids **não aparecem em combo nenhum** na tabela deles. O site e o agente
respeitam isso: Kids + barba dá **R$ 65** (soma), não R$ 60.

**Se a barbearia mudar a tabela**, mexer em três lugares: o bloco `PRECOS`/
`COMBOS` no fim do `js/main.js`, os valores escritos nos cards do `index.html`,
e a seção de tabela do agente `drummer_barbearia` no `agents.yaml`.

Outros dados públicos usados: horário **seg–sex 9h–19h, sáb 8h–18h** (domingo
fechado), WhatsApp **(85) 99188-0170**, pagamento em dinheiro/PIX/débito/crédito,
comodidades Wi-Fi, cafezinho, ar-condicionado, TV e video game.

---

## Identidade

- **Paleta**: papel branco `#f4f3f0` + preto `#0d0d0d` + **latão `#a97b2e`**,
  medido no pixel das luminárias deles.
- ⚠️ **Este é o 2º de três barbearias e o 3º site preto-e-dourado do portfólio**
  (Félix e Butterfly são os outros). O que salva: aqui a superfície é BRANCA e
  o preto é pesado e gráfico, enquanto o LS é escuro com amarelo ácido. O latão
  é só detalhe — nunca superfície. Se ainda parecerem parentes, tirar mais
  saturação do latão, não mexer no preto.
- **Fontes**: Anton (condensada pesada, é a letra do próprio wordmark deles) +
  Space Grotesk. Estética de **cartaz de show**, que combina com o nome.
- A palavra de destaque dos títulos sai **vazada** (`-webkit-text-stroke`), com
  fallback em latão escuro pra quem não suportar.

## A seção-assinatura: montar o combo

A dúvida real de quem vai à barbearia é "quanto vai dar". Como a tabela é
pública, dá pra responder isso **antes de a pessoa sentar na cadeira**.

Os botões são **pratos de bateria** — as luminárias da casa deles são pratos, e
o nome é Drummer. Bater no prato acende a onda e recalcula o total na hora.

**O detalhe que vale o trabalho**: ao escolher Kids ou Navalhado, o site avisa
que aquele corte não entra nos combos e mostra o valor somado. É o que prova
que a tabela é a deles e que não tem desconto inventado. Está no vídeo.

## O tema da bateria

O nome é Drummer e **as luminárias da barbearia são pratos de bateria de
verdade** (dá pra ver em `assets/salao-pratos.jpg` e `barbeiro-pratos.jpg`).
Por isso o hero é um prato visto de cima: o ponteiro bate e ele vibra.

---

## Sobre as fotos

⚠️ **As fotos estão em PRETO E BRANCO (duotone), e isso foi uma decisão.**
Quase todo o feed deles é reel, com **legenda queimada na capa** e temperaturas
de cor bem diferentes entre si. O duotone uniformiza de verdade (véu colorido
só disfarçava) e afasta o site do LS, que ficou em cor.

**Dá pra reverter em um minuto**: as originais em cor estão salvas ao lado, com
o sufixo `-cor.jpg`. É só trocar os `src` no `index.html`.

As janelas de recorte foram escolhidas foto a foto pra **excluir a legenda do
reel** (`parede-drummer` corta em cima, `corte-kids` e `salao-pratos` cortam
embaixo). Se recortar de novo, conferir se a legenda voltou.

---

## ❓ Pra confirmar com o cliente

1. **Preto e branco**: ele pode preferir as fotos em cor. Está a 1 minuto de
   distância (ver acima).
2. **A foto `equipe.jpg`** é a seleção de barbeiros de camisa da seleção
   brasileira. Data a foto. Trocar quando tiverem uma foto de equipe neutra.
3. **Não sabemos o nome dos barbeiros** — o site diz "são quatro" e não nomeia
   ninguém. A página de agendamento cita um "Pix/Lucas", que sugere que o dono
   se chama Lucas, mas isso **não entrou no site** por não estar confirmado.
4. **Faltam fotos boas da fachada e do salão vazio.** Tudo que existe é frame
   de reel a 360px. Pedir fotos é o maior ganho possível.

## ⚠️ Um comportamento do agente pra vigiar

Ele foi testado em 9 armadilhas e passou, mas numa delas **inventou que havia
estacionamento nas proximidades**. Foi corrigido com uma regra explícita de não
afirmar nem negar nada sobre a estrutura do lugar. Ainda assim ele responde
"não atendemos em casa" por dedução — inofensivo, mas **testar de novo depois
de qualquer mexida no prompt**.
