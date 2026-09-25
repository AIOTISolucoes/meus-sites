# Sites e prospecção — retomada de 15/09/2026

## Atualização de 25/09/2026

- As demos 4 a 6 agora também têm vídeos demonstrativos revisados:
  `video-bar-do-peixe.mp4` (24,32 s), `video-farmacia-central.mp4` (25,84 s)
  e `video-pro-otica.mp4` (26,76 s).
- Os três arquivos estão em H.264, 1440×900 e 25 fps. Mostram interação
  desktop, adaptação mobile e conversa respondida pelo agente local.
- Os sites Bar do Peixe, Farmácia Central e Pró-Ótica passaram no teste de
  desktop, mobile, interações e `prefers-reduced-motion` antes das gravações.
- O inventário passa a ter **23 sites personalizados e 23 vídeos principais**,
  desconsiderando versões `-antigo` e os dois rascunhos de modelo.
- Nenhuma empresa foi contatada e os dados comerciais ainda devem ser
  confirmados antes de qualquer apresentação.

## Atualização de 16/09/2026

- Os três primeiros prospectos agora têm site, agente e vídeo demonstrativo.
- Novos vídeos: `video-vizzio-fashion.mp4`, `video-morada-nova.mp4` e
  `video-louro-caipira.mp4`.
- O workspace passa a ter 20 sites personalizados e 20 vídeos principais,
  desconsiderando versões `-antigo` e diretórios de modelo.
- Os agentes funcionaram na gravação local, mas ainda precisam ser publicados
  antes de os links dos sites serem apresentados aos negócios.

## O que já existia no workspace

- **17 sites personalizados** em `portifolio-site/`, identificados pelo HTML,
  com **17 vídeos** em `vendas/video-*.mp4`, desconsiderando versões `-antigo`.
  Isto é inventário de arquivos, não uma nova aprovação funcional de todos.
- Clientes: Colmeia Encantada, Sabtec, Félix, Estúdio E Conceito, Claudia,
  Spaço Beauty, Butterfly Dreams, Fisioclin, JK Papelaria, Reserva Iguatemi,
  Sávio, Gentleman, Elo, North Barber, LS Barbearia, Drummer e Diretoria.
- `fionegro/index.html` e `srbessa/index.html` ainda têm título com `[[CLIENTE]]`
  e `[[O QUE FAZ]]`: são rascunhos do modelo, não sites finalizados.
- [RFlores](../portifolio-site/rflores/RETOMAR.md) tem pesquisa anterior;
  nenhum `index.html` foi localizado na pasta.
- [pipeline.md](pipeline.md) tinha 20 linhas vazias. Há scripts de abordagem,
  mas ausência de preenchimento não comprova que o usuário nunca contatou ninguém.
- As anotações antigas de publicação e pendências variam por data. Não inferir
  que um site está incompleto só porque a pasta está fora do Git: os sites eram
  preparados para repositórios independentes.

## Pesquisa nova

Recorte assumido: Fortaleza e região, especialmente Messejana, Eusébio e
Maracanaú, seguindo os clientes anteriores. Foram criados:

- [Lista consolidada de possíveis clientes](POSSIVEIS-CLIENTES.md): arquivo
  principal para consultar os 11 candidatos e a ordem sugerida.
- [Pesquisa de alimentação](pesquisa-restaurantes-2026-09-15.md): cinco candidatos.
- [Pesquisa de óticas e farmácias](pesquisa-oticas-farmacias-2026-09-15.md): seis
  candidatos, incluindo Originalfarma como condicional por domínio homônimo.
- [Pipeline preenchido](pipeline.md): os 11, com canais, contatos e ressalvas.

**Não foi comprovada ausência de site ou Google Maps em nenhum candidato.**
As buscas não localizaram domínio próprio atribuível com segurança; Instagram
direto não permitiu ler as bios atuais. Onde já existem Airgo, Linktree, Saipos
ou MenuDino, isso está registrado para orientar uma oferta de integração.

### Ordem sugerida de qualificação

1. **Ótica Vizzio Fashion, Messejana.** Ficha do Waze liga ao Instagram;
   nome/endereço conferidos em segunda fonte. [Ficha comercial](https://www.waze.com/live-map/directions/br/ce/otica-vizzio-fashion?to=place.ChIJA3xdSgBPxwcRJyiPgmebvck).
2. **Restaurante Morada Nova, Messejana.** Reportagem recente publica nome,
   endereço, Instagram e WhatsApp; o ponto mudou de nome. [Fonte de 20/08/2026](https://saboresdacidade.com/2026/08/20/restaurante-morada-nova-refeicoes-para-todos-os-momentos-do-dia-em-messejana/).
3. **Louro Caipira, Lagoa Redonda.** Instagram e endereço em reportagem recente;
   contato em diretório. [Fonte de 27/08/2026](https://saboresdacidade.com/2026/08/27/peixes-e-frutos-do-mar-com-sabor-caseiro-em-fortaleza/).
4. **Bar do Peixe, Eusébio.** Presença dispersa entre Instagram e diretórios;
   confirmar canal e eventual site antes de criar demo.
5. **Farmácia Central, Fortaleza.** [Linktree comercial](https://linktr.ee/farmaciacentralfortaleza)
   já organiza WhatsApps por loja. Qualificar necessidade de página institucional
   e responsável pelo grupo; não oferecer algo que apenas repita esse serviço.

Prioridades são julgamento comercial, não interesse demonstrado pelos negócios.

### Exclusões e divergências importantes

- **Fisioclin já tem site próprio**, conferido em
  [fisioclinmessejana.com.br](https://fisioclinmessejana.com.br/). Nosso site é
  uma possível demonstração de reformulação, não oferta de primeiro site.
- **Servirfarma foi retirada da seleção principal:** a ficha do Waze agora
  redireciona para Drogaria Fortal Saúde, embora conserve o Instagram antigo.
  Continuidade da empresa e contato atual não foram comprovados. Ver ressalva
  no relatório de farmácias antes de reutilizar o nome.
- As pesquisas registram outros negócios descartados por já possuírem domínio.

## Fisioclin — trabalho executado

Revisão local concluída nos limites dos testes disponíveis: falha de GSAP não
bloqueia o site; guia acessível por teclado; canvas retoma ao voltar à aba;
grade adaptada a telas estreitas; chat com fechamento/foco/ARIA, altura limitada
à tela e alternativa WhatsApp. Cache CSS/JS atualizado para `?v=4`.

O modelo configurado antes não aparecia na API; o fallback já respondia.
Fisioclin agora usa diretamente `openai/gpt-oss-120b`, confirmado disponível.
Refinada a orientação infantil para encaminhar à avaliação sem antecipar conduta.

Verificações: sintaxe JS aprovada; 36 cenários do guia e comportamento do widget
aprovados em jsdom; três consultas reais ao agente local com dados fictícios.
O teste final respondeu corretamente à dúvida conjunta de preço e plano e
encaminhou postura infantil para avaliação em Fisioterapia. Detalhes no
[resumo da Fisioclin](../portifolio-site/fisioclin/RETOMAR.md).
Sem validação visual ou da conversa no iframe público nesta sessão: navegador
integrado indisponível. HTTP 200 do Streamlit não equivale a chatbot validado.

O vídeo já existente tem 39,56 s em 1440×900. Sem necessidade de recriar material
para constatar que o projeto existia. Fotos melhores e confirmação da oferta
atual da clínica seguem para uma eventual entrega de reformulação.

**Não houve mensagem, abordagem, commit, push ou deploy.** O servidor local da
revisão fica em `http://127.0.0.1:8601/` enquanto o processo estiver ativo.
