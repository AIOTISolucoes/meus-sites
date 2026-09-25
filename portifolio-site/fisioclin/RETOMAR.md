# Fisioclin — estado atualizado em 15/09/2026

## Leia primeiro: situação atual

- **A clínica já tem site próprio:** [fisioclinmessejana.com.br](https://fisioclinmessejana.com.br/),
  conferido em 15/09/2026. Endereço e telefones coincidem com esta proposta.
  Não incluir na prospecção de negócios sem site. O projeto local passa a ser
  uma demonstração de reformulação, ainda sem publicação própria comprovada.
- **Site e vídeo já existiam.** O vídeo `vendas/video-fisioclin.mp4`, gravado em
  04/08, foi verificado com ffprobe: H.264, 1440×900, 39,56 segundos.
  Ele mostra a versão anterior aos ajustes de acessibilidade desta revisão.
- **A pendência antiga de push do agente estava superada:** a chave `fisioclin`
  já está no HEAD do Git; `RETOMADA.md` registra os chats funcionando em 04/08.
  Isso não comprova qual revisão está no Streamlit hoje.
- **Correções locais feitas agora:** site/guia funcionam sem GSAP; intro não
  bloqueia a página quando a biblioteca falha; passo 2 realmente desabilitado
  até escolher o público; canvas volta após ocultar a aba; grade adaptada a
  telas estreitas, foco visível e respeito ao movimento reduzido.
- **Chat:** abertura e fechamento acessíveis, foco devolvido ao botão,
  fechamento por Escape no documento pai, altura limitada à tela e link
  permanente de WhatsApp dentro do painel como alternativa ao serviço externo.
  O iframe continua carregando apenas no primeiro clique.
- **Modelo do agente atualizado localmente:** `openai/gpt-oss-120b`.
  A API confirmou que o Llama configurado antes não estava disponível; a
  cadeia de reserva já permitia responder. Removida essa tentativa desnecessária.
  Ajustado o encaminhamento infantil para não antecipar Pilates após avaliação.

### Verificação desta revisão

- Sintaxe de `main.js` e `chat.js`: aprovada com `node --check`.
- Testes DOM com jsdom, sem carregar recursos externos: 18 combinações do guia
  em cada um dos dois modos de movimento, total de 36; links WhatsApp, bloqueio
  do passo 2, recálculo ao trocar o público, pausa/retomada do canvas, iframe
  único, ARIA, foco e fechamento passaram, sem erro de execução.
- Teste real do agente local via API: endereço correto, sem inventar preço ou
  confirmar cobertura, dúvida conjunta de preço + plano respondida, e postura
  infantil encaminhada à avaliação em Fisioterapia.
  Nenhum resumo foi enviado ao Telegram/WhatsApp; os alertas foram suprimidos no teste.
- A URL pública do Streamlit respondeu HTTP 200. Isso comprova acesso HTTP,
  **não** a conversa funcionando dentro do iframe nem a entrega à recepção.
- Navegador integrado indisponível nesta sessão. jsdom não renderiza layout:
  falta revisão visual atual em desktop/celular e verificação do iframe no navegador.

### O que falta para uma entrega pública

1. Revisão visual desktop/celular, com e sem movimento reduzido, e teste do chat
   público. A demonstração local pode ser aberta em `http://127.0.0.1:8601/`
   enquanto o servidor desta sessão estiver ativo.
2. Confirmar com a clínica o conteúdo de uma eventual reformulação, principalmente
   Terapia Ocupacional, não listada na página oficial consultada. Fotos internas
   melhores continuam sendo uma melhoria possível, não um impedimento para a demo.
3. Publicar a proposta e atualizar o agente remoto quando a entrega for definida.
   **Nesta sessão não houve commit, push, deploy nem contato com a clínica.**

O site oficial agora publica horários e convênios; a afirmação histórica abaixo
de que essas informações não existiam não deve ser reutilizada como dado atual.
Não foram copiados automaticamente para o projeto nem ampliadas as especialidades.

---

## Registro original — 01/ago/2026 (histórico)

Pasta: `portifolio-site/fisioclin/` (untracked, como todos os sites de cliente).
Feito a partir de `_modelo/`.

## O cliente

**@fisioclinmessejana** · Clínica de Medicina e Saúde · Messejana, Fortaleza-CE
**4.978 seguidores, 486 posts** — o maior perfil de cliente até agora.

Tudo abaixo é dado publicado por eles (Instagram, posts e a página oficial no
Facebook). Nada foi estimado:

- **Especialidades**: Fisioterapia, Pilates, Psicologia (inclusive infantil),
  Fonoaudiologia (inclusive infantil), Nutrição, Terapia Ocupacional —
  "e + especialidades médicas" na bio.
- **Endereço**: Rua Angélica Gurgel, 226 — Messejana, Fortaleza-CE, 60871-030.
  Confirmado em dois lugares: post deles de "Agenda aberta" e a aba Sobre do
  Facebook oficial. **É público, então o site e o agente podem informar.**
- **Telefones**: (85) 3274-0300 e (85) 3111-9919 · **WhatsApp** (85) 99411-8007
  (link da bio) · outro número que aparece em posts: (85) 99191-1861.
- **Atende particular E planos de saúde** (está escrito no post de vagas).
- **Estrutura** (do anúncio de locação de salas): consultórios amplos e
  climatizados, elevador, recepção, sala de espera, wi-fi, sistema de câmeras.
- E-mail: fisioclinpb@gmail.com

### ⚠️ O que NÃO existe publicado (e por isso não está no site)

- **Horário de funcionamento.** Não aparece em lugar nenhum. O único horário
  que achei foi "07h às 17h30" num post de 22/jun — mas era o horário
  **excepcional do dia 24/06** por causa de um jogo do Brasil, não a regra.
  Não usei. O site diz que a recepção confirma os horários.
- **Preço.** Nenhum. O agente é proibido de falar valores.
- **Quais planos são aceitos.** Eles dizem que atendem planos, mas não dizem
  quais. O agente anota o nome do plano e manda confirmar com a recepção.

## Identidade visual (medida no pixel, não escolhida no chute)

- **Creme #f7f4ef** — é o fundo de TODAS as artes do Instagram deles.
- **Terracota #7a4a34** — a cor da logo.
- **Verde-água #afd9d8** — a placa redonda pregada na fachada.
- Fontes: **Bricolage Grotesque + Figtree** (novas, não repetem nenhum site).

O risco era virar primo do Spaço Beauty (café + creme). O que separa: aqui a
superfície é clara, quase branca, o terracota só assina e quem manda no acento
é o verde-água.

## A fachada é o site

A clínica tem um **painel de cobogó branco com triângulos em relevo** na
fachada, com a placa verde-água no meio. É o melhor ativo visual que eles têm,
e virou as duas peças centrais:

1. **Hero (canvas)** — o cobogó redesenhado. Cada célula é um quadrado cortado
   por uma diagonal, virando dois triângulos com "dobras" opostas. O brilho de
   cada um é o quanto a dobra aponta para a luz — e **a luz é o ponteiro**. Por
   isso a parede parece girar quando o mouse anda: é o sol da tarde
   atravessando o brise. Sem ponteiro (e em movimento reduzido) a luz passeia
   sozinha, devagar.
2. **Seção-assinatura** — o mesmo painel em SVG, que **acende**.

## Seção-assinatura: "Por onde eu começo?"

A dúvida real de quem chega numa clínica com seis especialidades é qual
profissional procurar. Duas perguntas — **para quem é** (criança/adulto/pessoa
idosa) e **o que busca** (movimento, fala, emoções, alimentação, autonomia,
condicionamento) — e a parede da fachada acende a especialidade indicada, com
um texto escrito para aquela combinação específica (18 textos diferentes).

**Não é triagem clínica, de propósito**: não pergunta sintoma, não devolve
diagnóstico, e toda resposta traz fixa a ressalva de que quem define o plano é
a avaliação presencial. É o encaminhamento que a recepção faria.

Regra que precisou de exceção: **criança + postura NÃO vai para a turma de
Pilates** — vai para a Fisioterapia, que é quem avalia. (Testado.)

O botão do resultado abre o WhatsApp já com a mensagem escrita:
*"Procuro atendimento de Fonoaudiologia para uma criança..."*

## Agente de IA

`fisioclin` no `agents.yaml`. É o agente mais rígido de todos, porque é saúde:

- Nunca preço, nunca horário de funcionamento, nunca confirma dia da agenda.
- Nunca diz **quais planos** aceita nem confirma cobertura.
- Nunca dá parecer clínico, não fala em número de sessões nem tempo de
  recuperação.
- **PODE** informar endereço e telefones (são públicos).
- **Protocolo de urgência**: sinais de emergência → orienta 192/SAMU. Sofrimento
  psíquico grave ou menção a suicídio → acolhe, informa o **CVV 188** e não
  segue o roteiro de agendamento. Isso é obrigatório numa clínica que tem
  psicologia.

Testado em 7 armadilhas (preço, plano/Unimed, agenda de sábado, "acha que é
menisco?", endereço, crise suicida, horário). Passou nas 7 — duas precisaram de
ajuste depois do 1º teste: ele **ignorava** o pedido de sábado em vez de anotar
a preferência, e respondia "não tenho acesso a essa informação" sobre horário,
que é resposta de robô.

## ⚠️ Pendências antes de mostrar/publicar

1. **PUSH do `agents.yaml`** — sem isso a caixinha de chat do site abre e não
   responde. O site inteiro funciona, só o chat depende do push.
2. **As fotos.** Só existe UMA foto aproveitável (a fachada), e ela foi
   recortada de dentro de uma arte de post. As 4 fotos do interior que tentei
   usar (recepção, sala de espera, corredor) saíram borradas — uma delas com um
   extintor de incêndio em primeiro plano — e foram descartadas. Por isso a
   seção "A clínica" é foto + lista, e não o trilho horizontal dos outros
   sites: trilho com uma foto só é esteira vazia.
   **Pedir fotos do interior é o maior ganho possível neste site**, porque o
   argumento de venda deles é justamente "ambiente moderno e acolhedor".
3. **Confirmar as 6 especialidades** com a clínica. Nutrição e Terapia
   Ocupacional vieram de bio e de um post de agenda aberta; se alguma não
   estiver mais ativa, é trocar um card.
4. **Vídeo demo** — ainda não gravado. Usar `vendas/gravar-video-interativo.py`
   (o do cursor sintético), porque a assinatura aqui é de clique, não de scroll.

## Testado

- Desktop 1440×900 e celular 390×844.
- Movimento reduzido (o caminho que o PC do usuário mostra): o canvas continua
  vivo, só mais lento — não congela.
- Console limpo.
- No celular o painel foi **reordenado** para ficar entre as perguntas e o
  resultado. Antes ele vinha antes de tudo e a parede acendia FORA DA TELA:
  quem abrisse pelo Instagram não veria o efeito nenhuma vez.
