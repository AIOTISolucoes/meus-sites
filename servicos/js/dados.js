/* =========================================================
   TUDO O QUE VOCÊ EDITA ESTÁ NESTE ARQUIVO.
   O index.html e o main.js não têm texto de venda dentro.

   Duas regras de escrita que valem pra tudo aqui:
   nada de travessão e nada de dois-pontos no meio da frase.
   Se der vontade de usar, quebre em duas frases.
   ========================================================= */

/* ---------- 1. CONTATO ---------- */
const CONTATO = {
  whatsapp: "5585991225077",   // só dígitos, com 55 e DDD
  instagram: "maxyzao",        // sem o @
  email: ""                    // "" esconde
};

/* ---------- 2. LINKS DE PAGAMENTO ---------- =============
   Enquanto a URL for "", o botão de fechar cai no WhatsApp
   com o pedido já escrito. A página funciona sem conta de
   pagamento nenhuma. Colou a URL, o botão vira "Pagar agora".
   ========================================================= */
const PAGAMENTO = {
  landing: "",
  bot: "",
  site: "",
  saas: "",
  outro: ""
};

/* ---------- 3. AS PALAVRAS QUE A ABERTURA DIGITA --------
   A frase é "Página própria para ___", então cada item já
   vem com o artigo dentro. Assim funciona no masculino e no
   feminino sem quebrar a concordância.
   ========================================================= */
const DIGITA = [
  "o seu negócio",
  "o seu portfólio",
  "a sua marca",
  "o seu estúdio",
  "a sua loja",
  "o seu projeto"
];

/* ---------- 4. O CATÁLOGO ---------- =====================
   "cor" é a luz do item e "icone" é o id do desenho no
   sprite lá do fim do index.html.
   ========================================================= */
const SERVICOS = [
  {
    id: "landing",
    cor: "azul",
    icone: "ic-pagina",
    nome: "Landing page",
    frase: "Uma página só, feita do zero pro seu negócio.",
    resumo: "Não é modelo pronto com a cor trocada. O texto sai do seu Instagram e a página ganha um momento que nenhuma outra tem.",
    preco: "a partir de R$ 400",
    itens: [
      "Tudo numa página, do topo ao contato",
      "Uma seção interativa feita pro seu ramo",
      "Botão de WhatsApp sempre à mão",
      "Uma rodada de ajustes depois de pronta"
    ],
    nota: "R$ 400 é o piso. O valor fechado depende do tamanho, e você ouve ele antes de pagar."
  },
  {
    id: "bot",
    cor: "turquesa",
    icone: "ic-fala",
    adicional: true,
    nome: "Atendente de IA",
    frase: "Responde seus clientes às 3 da manhã.",
    resumo: "Entende o que a pessoa quer, não inventa preço nem horário, e te passa a conversa já resumida.",
    preco: "+ R$ 70",
    selo: "uma vez só, sem mensalidade",
    itens: [
      "Treinado com os seus serviços e o seu jeito de falar",
      "Nunca chuta preço, prazo nem horário",
      "Qualifica a pessoa e joga pro seu WhatsApp",
      "Vitalício, sem plano e sem renovação"
    ],
    nota: "Se soma a qualquer serviço. Uma vez pago, é seu."
  },
  {
    id: "site",
    cor: "ciano",
    icone: "ic-paginas",
    nome: "Site de várias páginas",
    frase: "Quando uma página só não dá conta.",
    resumo: "Catálogo grande, várias unidades, blog, ou uma página separada para cada serviço que você vende.",
    preco: "sob consulta",
    itens: [
      "Menu ligando todas as páginas",
      "Preparado pra aparecer no Google",
      "Você escolhe o que quer trocar sozinho"
    ],
    nota: "O valor depende de quantas páginas e do que cada uma mostra."
  },
  {
    id: "saas",
    cor: "ambar",
    icone: "ic-painel",
    aplicacao: true,
    nome: "Sistema sob medida",
    frase: "Isto não é site. É aplicação.",
    resumo: "Tem login, guarda informação que muda todo dia e cada pessoa que entra enxerga uma coisa diferente.",
    preco: "sob consulta",
    itens: [
      "Login e níveis de acesso",
      "Banco de dados que você mesmo edita",
      "Painel com os números do negócio"
    ],
    nota: "Projeto sob medida. Começa por uma conversa sobre o que precisa acontecer lá dentro."
  },
  {
    id: "outro",
    cor: "coral",
    icone: "ic-mais",
    nome: "Outra coisa",
    frase: "Uma ideia que não cabe nas caixas acima.",
    resumo: "Automação, integração, reforma de um site que já existe, ou algo que ninguém ainda te disse se dá pra fazer.",
    preco: "sob consulta",
    itens: [
      "Automação de tarefa repetitiva",
      "Reforma de um site que já existe",
      "Bot de WhatsApp ou de Instagram"
    ],
    nota: "Me conta o que precisa acontecer. Se eu não for a pessoa certa, você ouve isso de mim."
  }
];

/* ---------- 5. SISTEMAS (sem tela pronta) --------------- */
const SISTEMAS = [
  {
    icone: "ic-chave",
    nome: "Painel de imóveis",
    quem: "Imobiliária, corretor",
    o_que: "O corretor cadastra os imóveis e o atendente de IA busca dentro desse banco, oferecendo só o que existe."
  },
  {
    icone: "ic-agenda",
    nome: "Agenda com área do cliente",
    quem: "Clínica, salão, barbearia",
    o_que: "A pessoa marca sozinha o horário que está livre. Você abre o painel e vê o dia inteiro."
  },
  {
    icone: "ic-caixa",
    nome: "Controle de pedidos",
    quem: "Papelaria, confeitaria, oficina",
    o_que: "Cada pedido anda por etapas e o cliente acompanha por um link, sem te ligar pra perguntar."
  },
  {
    icone: "ic-funil",
    nome: "Central de leads",
    quem: "Quem recebe cliente por WhatsApp",
    o_que: "Todo contato vira um cartão numa fila. Você arrasta pelo estágio e não perde ninguém."
  }
];

/* ---------- 6. OS TRABALHOS (com vídeo) ---------- =======
   ⚠️ O vídeo passeia pelo site INTEIRO e mostra a marca do
   cliente em vários pontos. A barra de topo foi cortada,
   mas isso não esconde tudo. Trocar por outro cliente é só
   mudar "video" aqui e rodar de novo o ffmpeg (ver RETOMAR).
   ========================================================= */
const TRABALHOS = [
  {
    video: "barbearia",
    ramo: "Barbearia",
    nota: "Escuro, com serifa clássica e listra de poste. O visual é montado na própria página."
  },
  {
    video: "beleza",
    ramo: "Estúdio de beleza",
    nota: "Areia e itálico fino, com fios de cabelo que desviam do ponteiro enquanto a pessoa lê."
  },
  {
    video: "papelaria",
    ramo: "Papelaria de festa",
    nota: "Vinho e confete, com um montador de mimo que fecha o pedido no WhatsApp."
  }
];

/* ---------- 7. COMO FUNCIONA (sequência real) ---------- */
const PASSOS = [
  { icone: "ic-fala",   t: "Você me chama",   d: "Pelo botão daqui ou montando o pedido. Me diz o que você faz e onde está perdendo cliente." },
  { icone: "ic-lupa",   t: "Eu levanto tudo", d: "Puxo o que já é público do seu Instagram, dos serviços às fotos. Se faltar algo eu peço. Não invento." },
  { icone: "ic-olho",   t: "Você vê antes",   d: "Te mando a página funcionando pra abrir no celular. Ajuste se conversa nessa hora." },
  { icone: "ic-antena" ,t: "Vai pro ar",      d: "Publicada, com endereço próprio. O atendente de IA, se você quiser, já entra respondendo." }
];

/* ---------- 8. PERGUNTAS ---------- */
const PERGUNTAS = [
  {
    p: "O atendente de IA tem mensalidade?",
    r: "Não. São R$ 70 uma vez e ele é seu. Sem plano, sem renovação, sem cobrança por conversa."
  },
  {
    p: "Por que o preço não vem fechado?",
    r: "Duas páginas do mesmo tamanho podem dar trabalho muito diferente. R$ 400 é o piso real. O valor fechado eu digo depois de entender o projeto, e sempre antes de você pagar."
  },
  {
    p: "Qual a diferença de site pra sistema?",
    r: "Um catálogo com foto é site. Um catálogo onde você edita o estoque e o cliente acompanha o pedido é sistema, porque tem login e guarda informação que muda todo dia."
  },
  {
    p: "O endereço do site custa?",
    r: "A hospedagem vai inclusa e é gratuita. Domínio próprio custa cerca de R$ 40 por ano direto no registrador e não passa por mim. Sem ele o site fica no ar do mesmo jeito."
  },
  {
    p: "E se eu não gostar?",
    r: "Você vê a página pronta antes de pagar o restante. Se não for o que queria a gente ajusta, e se ainda assim não fizer sentido você não fica preso a nada."
  }
];
