# Originalfarma — conceito de site

**Status:** site pronto, vídeo pronto, revisão pendente; **candidato
condicional**. **Não publicado, não enviado à farmácia.**

## Por que condicional

O domínio `originalfarma.com.br` existe (resolve DNS), mas não responde em
HTTPS e um documento de 2015 o liga a um contato de outro estado. Não foi
possível vincular o domínio ao grupo cearense nem descartar o vínculo. Antes
de abordar: perguntar se a farmácia já tem site.

## Conceito visual

**A folhinha da farmácia do bairro.** Linguagem comunitária, diferente da
Farmácia Central (eucalipto/coral) e da Provisão (petróleo/gaveteiro):
azul-marinho suave, amarelo-manteiga de bilhete e folhinha, verde medicinal só
no que é do farmacêutico.

- **Hero:** foto do balcão com bilhetes adesivos balançando (“receita na
  bolsa”, “repor dia 12”, “perguntar ao farmacêutico”).
- **Atalhos em forma de etiqueta:** cada um escreve a mensagem para o WhatsApp.
- **Interação-assinatura, lembrete de reposição:** a pessoa marca o dia em que
  o remédio de uso contínuo costuma acabar. O site gera um arquivo `.ics` com
  lembrete **mensal, dois dias antes** (regra que funciona em meses curtos),
  e a mensagem “avisar a farmácia”. Nada sai do aparelho; não há orientação
  clínica.
- **Scroll scrub:** no desktop, a folhinha fica fixada e as páginas de dicas
  gerais (receita, validade, armazenamento, alergia, descarte) se destacam uma
  a uma com a rolagem. No celular, viram uma lista que vira página ao entrar.
- **Tipografia:** Lexend (legibilidade) + Kalam (letra de bilhete).

## Dados

| Dado | Situação |
|---|---|
| Nome “Farmácia OriginalFarma Fortaleza/Maracanaú” | Provável (título do Instagram no índice de busca) |
| Unidades Siqueira, Alto Alegre, Residencial, Jereissati I | Provável (trecho da bio); o site mostra só os bairros |
| Horários por unidade | Provável na bio, **não publicados** no site |
| WhatsApp (85) 98510-1245 | Provável (cadastro público); marcado “Demo: confirmar” |
| Telefones das fichas do Maps | Divergentes entre si; não usados |
| Endereços | Só no README de pesquisa; o site usa busca no mapa por bairro |

## Imagem

`assets/balcao.webp`: gerada com GPT Images (conceitual, rotulada no rodapé).

## Dependências externas

Google Fonts (Lexend, Kalam), Phosphor Icons, GSAP 3.12.5 + ScrollTrigger.
Sem GSAP, a folhinha vira lista e o lembrete funciona do mesmo jeito.

## Executar e testar

```bash
python -m http.server 8765 --bind 127.0.0.1
python tests/test_new_sites_2026_09.py originalfarma
```

O teste baixa o `.ics` e confere `RRULE:FREQ=MONTHLY;BYMONTHDAY=…`.

## Vídeos

- Horizontal 1440×900: `vendas/video-originalfarma.mp4` (`python vendas/gravar-videos-prospectos.py --only …`).
- Reels 1080×1920, 30 fps: `vendas/reels/reels-originalfarma.mp4` (`python vendas/gravar-reels.py --only …`).
- Ambos exigem o site servido na porta 8602 e o app de agentes na 8512 com a
  chave do Groq; o gravador recusa vídeo sem resposta do agente.

## Agente

`originalfarma` em `agents.yaml`: organiza a consulta, aponta o lembrete do
site, nunca orienta remédio/dose, manda emergências para o 192 e fecha com
`📋 RESUMO DA CONSULTA`.

## Pendências com a farmácia

Se já tem site, domínio, WhatsApp oficial por unidade, endereços e horários,
se faz entrega, logo, fotos reais e autorização de marca.
