# WhatsApp Cloud API — ativação controlada

## Estado confirmado em 05/09/2026

- Token temporário novo validado na Graph API e instalado no servidor sem
  expor o valor. `whatsapp_cloud:true` no health.
- Callback `https://clergyman-rewrite-jolt.ngrok-free.dev/whatsapp` ativo,
  handshake confirmado e campo `messages` inscrito. A conta de teste está
  assinada ao app; eventos de entrada chegam e retornam HTTP 200.
- O número pessoal de teste envia mensagens para o número sandbox. A Meta usa
  para ele um `wa_id` brasileiro sem o nono dígito; os dois formatos foram
  confirmados como a mesma conta e a normalização foi incorporada ao código.
- O bot processou a mensagem e a Cloud API aceitou a resposta, porém a entrega
  falhou com o código `130497`. O `health_status` da WABA confirmou
  `can_send_message: BLOCKED` por três pendências externas: método de pagamento
  com erro (`141006`), empresa ainda não verificada (`141010`) e perfil
  empresarial sem Nome legal, País e Site (`131000`).
- O sistema agora registra os webhooks `sent`, `delivered`, `read` e `failed`
  no CRM, em vez de tratar aceitação da API como entrega final. Testes locais:
  33 aprovados.
- A automação foi desligada novamente após o teste. Estado final seguro:
  `WHATSAPP_AUTOMATION_ENABLED=false` e `WHATSAPP_ALLOW_ALL=false`. FazzLeads e
  o WhatsApp profissional não foram alterados.
- Para concluir o teste real de resposta, o responsável pela empresa deve
  preencher os dados legais verdadeiros no Meta Business Suite, resolver a
  verificação empresarial e corrigir o pagamento. Depois disso, revalidar
  `health_status.can_send_message`, ligar a automação somente para a allowlist
  e repetir a conversa.

## Retomada em 04/09/2026

- Conta de teste da Meta criada: WABA `1656550902845747`.
- Número de teste: `+1 555 196 8547`, Phone Number ID `1345003225354655`.
- Celular pessoal autorizado pelo usuário confirmado na Meta por código; aparece
  selecionado como destinatário. Não guardar o código de confirmação.
- Token temporário da tela expirou. Validação Graph retornou HTTP 401, código 190.
- Ao tentar gerar novo token, o fluxo OAuth mostrou: “Recurso indisponível.
  O Login do Facebook está indisponível para este app no momento.” Recarregar
  a tela uma vez não resolveu. Não atribuir uma causa sem investigação.
- Nenhum token foi instalado no servidor nesta tentativa. Health confirmado:
  `crm:true`, `meta_leads:true`, `whatsapp_cloud:false`, `whatsapp_automation:false`.
- Próximo passo: resolver a emissão de token no app, configurar o webhook e
  somente então ativar respostas restritas ao celular de teste. O teste real
  de conversa ainda não ocorreu; FazzLeads e número profissional não foram alterados.
- Brave autenticado acessível por CDP em `127.0.0.1:9222`. Localizar a aba pelo
  app `899316022982852`, não por índice. Conexão direta ao WebSocket da aba
  funciona; agent-browser/Playwright podem travar ao conectar a todas as abas.

## Estado seguro publicado

- O endpoint é `GET/POST /whatsapp`.
- A automação nasce desligada com `WHATSAPP_AUTOMATION_ENABLED=false`.
- Mesmo ligada, responde somente a `WHATSAPP_TEST_RECIPIENTS` enquanto
  `WHATSAPP_ALLOW_ALL=false`.
- Todo POST exige `X-Hub-Signature-256` válido.
- Retries do mesmo `wamid` não geram uma segunda resposta já enviada.
- O teste controlado não dispara notificação de lead qualificado para a equipe.

## Checklist para o teste das 23h

1. Confirmar no painel da Meta se o número permite coexistência com o aplicativo
   WhatsApp Business e com a operação atual. Não remover o FazzLeads.
2. Obter `Phone Number ID`, token da Cloud API, segredo do app e criar o token
   de verificação do webhook.
3. Cadastrar o callback HTTPS terminado em `/whatsapp` e assinar o campo
   `messages` da conta do WhatsApp Business.
4. Definir somente o celular de teste em `WHATSAPP_TEST_RECIPIENTS`.
5. Manter `WHATSAPP_ALLOW_ALL=false`, ligar
   `WHATSAPP_AUTOMATION_ENABLED=true` e reiniciar o serviço.
6. Mandar uma mensagem do número autorizado, conferir resposta no WhatsApp e
   histórico no CRM.
7. Ao terminar, voltar `WHATSAPP_AUTOMATION_ENABLED=false` até a decisão de
   migração definitiva.

## Liberação definitiva

Somente depois de validar recebimento, resposta, histórico, pausa humana e
coexistência, avaliar `WHATSAPP_ALLOW_ALL=true`. Essa mudança é separada da
integração de formulários Meta Lead Ads.
