# AIOTI — sites de prospecção

Este repositório é um snapshot de trabalho para continuar os sites de
prospecção da AIOTI em uma sessão na nuvem.

## Comece por aqui

Leia, nesta ordem:

1. `vendas/PROMPT-CLAUDE-PROXIMOS-SITES-E-VIDEOS.md`
2. `vendas/RETOMADA-PROSPECCAO.md`
3. `vendas/POSSIVEIS-CLIENTES.md`
4. `vendas/pipeline.md`
5. `agents.yaml`

Na nuvem, trate a raiz clonada como a raiz do projeto. Os caminhos absolutos
Windows que aparecem na documentação histórica correspondem a caminhos
relativos dentro deste repositório.

## Referências e ferramentas obrigatórias

Use estes sites para pesquisar padrões, detalhes e componentes de frontend;
não os copie literalmente e respeite as respectivas licenças:

- `https://www.details.so/inspo`
- `https://microkit.co/`
- `https://bencho.dev/finds`

Use somente estas duas skills locais, versionadas em `.claude/skills/`:

- `gpt-taste`: direção frontend, motion e scroll com GSAP;
- `impeccable`: auditoria, crítica, acabamento e endurecimento visual.

Os MCPs de Figma e Playwright estão declarados em `.mcp.json`. Aprove-os
quando o Claude solicitar. O Figma exige autenticação OAuth da conta do
usuário. Use Playwright para inspeção, testes responsivos e gravações.

Se forem necessários novos assets rasterizados, não improvise imagens ruins:
descreva com precisão o asset e forneça ao usuário um prompt pronto para ser
executado no GPT Images. Continue com o restante que não dependa do asset.

## Regras de segurança e escopo

- Não publique em produção e não contate empresas sem autorização explícita.
- Não invente preços, horários, endereços, cardápios, estoque ou serviços.
- Não adicione chaves, tokens, cookies ou credenciais ao repositório.
- Preserve mudanças existentes e evite reescrever projetos não relacionados.
- Use os canais oficiais já documentados apenas como destino de CTAs.
- Faça pesquisa atual antes de afirmar dados comerciais mutáveis.
- Teste desktop, mobile, acessibilidade, console, CTAs e chatbot.

## Prioridade atual

1. Auditar os seis sites listados no briefing.
2. Validar os vídeos existentes e concluir os que estiverem pendentes.
3. Pesquisar e construir os cinco próximos prospectos.
4. Atualizar documentação e pipeline com evidências e ressalvas.
