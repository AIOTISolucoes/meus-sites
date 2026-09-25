# RFlores Floricultura Eusébio — pesquisa feita, site AINDA NÃO construído

11º site de cliente. **Estado em 02/ago/2026: só a pesquisa está pronta.**
Nada de HTML/CSS/JS foi escrito ainda e o agente não existe. Este arquivo tem
tudo que foi levantado e as duas decisões já tomadas pelo usuário — começar
por aqui, não do zero.

## Por que este é o alvo mais importante da carteira

**16,4 mil seguidores.** É mais de 3× a Fisioclin (4.978), que era a maior até
agora. E é **negócio próprio**, sem franqueador no caminho (ver
`alerta-loja-franqueada` na memória). Ramo perfeito pro agente de IA: flor e
cesta são pedidos com data de entrega, destinatário, mensagem de cartão e
região — tudo que um qualificador resolve bem.

## Dados reais (tudo publicado no perfil)

- Instagram: **@rfloreseusebio**
- Nome: **RFLORES FLORICULTURA EUSÉBIO E AQUIRAZ | CESTAS DE CAFÉ DA MANHÃ**
- Lema: **"Amor em cada detalhe"**
- "Floricultura online"
- 📍 **Eusébio-CE**
- 🚚 **Entregas em Eusébio, Aquiraz e região**
- 🕒 **Seg à Sex: 8h às 18h | Sáb: 8h às 13h** ← horário PUBLICADO, pode entrar
  no site e o agente pode informar
- 📲 "Peça pelo link" → `canva.link/0wlklktb033rhpn` (o catálogo)

### ⚠️ NÃO EXISTE WHATSAPP PUBLICADO

O perfil de Eusébio não publica número em lugar nenhum: a bio só aponta pro
catálogo, e o catálogo não tem contato. Procurei no perfil, no catálogo inteiro
e na web.

**Decisão do usuário (02/ago): apontar tudo pro Direct do Instagram** —
`https://ig.me/m/rfloreseusebio`. Mesma solução do Spaço Beauty, que também não
tinha WhatsApp. Quando o número aparecer, é trocar os links por `wa.me/55...`
(5 minutos).

**NÃO usar o número da matriz**: `@rflorees` é a unidade de **Cascavel-CE**
("Flores & presentes desde 2005", 18,1 mil seguidores, 85 99960-2638). É outra
cidade e outra equipe — mandar cliente de Eusébio pra lá queima a demo.
RFlores é uma **rede local pequena**, não franquia de marca nacional.

## O catálogo — o maior ativo deste cliente

O "loja online" dela é literalmente um **catálogo Canva de 46 páginas** que o
cliente folheia no celular. **As 46 páginas já estão capturadas** em
`catalogo-fonte/p01.jpg` … `p46.jpg` (recortadas e comprimidas, 7,2 MB).

**Não precisa recapturar** — o script que fez isso está descrito abaixo, mas as
imagens já estão no disco e sincronizam pelo OneDrive.

Estrutura observada:
- `p01` capa: "CATÁLOGO DIGITAL", ursinho com buquê rosa, logo RFlores
- `p02` seção **FLORES** → Rosa Unitária **R$ 25,00** (01 rosa natural +
  embalagem celofone)
- `p03` Rosa Unitária + Ursinho **R$ 40,00** (01 rosa + urso chaveiro + celofone)
- … demais páginas: mais produtos, cada um com foto, preço, descrição e
  "Composto por:"
- `p45` seção **BUQUÊS** — grade com 9 fotos reais de buquês
- `p46` grade final

Toda página de produto traz o aviso da própria loja:
> "IMAGEM MERAMENTE ILUSTRATIVA / TONS E FLORES ESTARÃO DISPONÍVEIS ATÉ
> DURAREM O ESTOQUE, CONSULTE COM O VENDEDOR(A)"

**Esse aviso precisa aparecer no site e virar regra do agente** — é ela quem
diz que a foto é ilustrativa e o estoque varia.

### Decisão do usuário (02/ago): CATÁLOGO COMPLETO COM PREÇO

Extrair produto / preço / composição das 46 páginas e montar um **catálogo
navegável de verdade, com filtro por categoria**. Diferente da JK (onde os
preços eram promoções datadas), aqui é **tabela de catálogo** — situação do
Félix, que é o outro cliente com preço no site.

É o maior salto possível pra ela: hoje o cliente folheia PDF do Canva no
celular. E é o argumento de venda do vídeo.

## Passo a passo pra retomar

1. **Ler as 46 imagens** de `catalogo-fonte/` e montar uma tabela
   produto → preço → composição → categoria → página de origem.
   Dica: montar folhas de contato de 4 páginas (2×2) pra ler em ~12 leituras
   em vez de 46.
2. Escolher paleta e fontes. A marca é **rosa + lilás**: a logo "RFlores" é
   manuscrita em lilás/roxo e o catálogo inteiro é rosa-claro. **Medir no pixel**
   antes de fixar. ⚠️ Cuidado pra não repetir a JK Papelaria (magenta+menta) nem
   a Colmeia (mel + rosa pastel) — o risco de parecer irmão da JK é real.
   Fontes já usadas estão listadas no topo do `_modelo/css/estilo.css`.
3. Baixar as melhores fotos do feed do Instagram (16,4 mil seguidores → o feed
   tende a ter foto boa, ao contrário dos outros clientes).
4. Inventar a **seção-assinatura**. Ideias que casam com o ramo, nenhuma
   testada ainda:
   - "Pra que dia?" — um calendário/data que dispara o que dá pra entregar
     (mas CUIDADO: não prometer prazo, ela não publicou prazo de entrega).
   - "Monte o presente" — flor + acompanhamento (ursinho, chocolate, cartão),
     somando o preço real do catálogo ao vivo.
   - O cartãozinho: escrever a mensagem e ver ela aparecer no cartão da
     embalagem. É o detalhe emocional do produto dela ("Você é incrível!",
     "Com carinho" aparecem nas fotos do catálogo).
5. Site + agente + vídeo, no padrão dos outros. Copiar `_modelo/`.

## Regras do agente (quando for escrito)

- **PODE** informar horário (Seg-Sex 8h-18h, Sáb 8h-13h) e a região de entrega
  (Eusébio, Aquiraz e região) — os dois são publicados.
- **PODE** informar os preços do catálogo, com o aviso de que a foto é
  ilustrativa e o estoque varia.
- **NUNCA** prometer prazo de entrega nem dizer que "dá tempo" pra uma data —
  ela não publica prazo.
- **NUNCA** afirmar que uma flor/cor específica está disponível (é o próprio
  aviso dela: "até durarem o estoque").
- Coletar: ocasião · produto · **data e horário da entrega** · destinatário ·
  endereço/bairro · mensagem do cartão · contato.
- **Incluir a regra de perguntas empilhadas** (ver `agents.yaml`, foi o defeito
  que só apareceu no ar na JK e no Reserva).
