# Speculari Ótica — conceito de site

**Status:** em desenvolvimento. Código e testes prontos; faltam imagens finais
(GPT Images), teste da resposta real do agente e vídeo. **Não publicado, não
enviado à ótica.**

## Conceito visual

**Foco e ajuste.** “Especular” é o reflexo preciso de um espelho; o site trata
a escolha da armação como um ajuste de foco.

- **Hero:** a foto aparece desfocada e uma lente circular (com anel graduado)
  deixa nítido só o que está dentro dela. Segue o cursor; parada, deriva
  sozinha; no celular, segue o toque. Ao rolar, o círculo cresce até a imagem
  inteira ficar em foco. Botão para pausar o movimento automático.
- **Scroll scrub (desktop, seção fixada):** macro da dobradiça que aproxima
  enquanto linhas técnicas e notas sobre dobradiça, acetato e haste aparecem.
  No celular, sem fixar: só a aproximação.
- **Interação-assinatura:** estúdio de formato. Grau ou esportivo, quatro
  formatos desenhados em SVG, medidor de presença (espessura do traço) e
  material. O resumo vira mensagem de WhatsApp para agendar uma prova.
- **Diferente das outras óticas:** nada do lime/fashion da Vizzio nem da
  refração em cobalto da Pró-Ótica. Aqui: preto mineral, marfim como tinta,
  cinza fumê, metal discreto e uma grade técnica de 12 colunas ao fundo.
- **Tipografia:** Gloock (serifada de alto contraste) + Urbanist (geométrica).
- **Movimento:** preciso e curto (`expo.out`); o título entra como um ajuste de
  foco (desfoque e espaçamento se assentam). Com `prefers-reduced-motion`, a
  foto aparece nítida e sem lente.

## Dados

| Dado | Situação |
|---|---|
| Endereço Av. Pontes Vieira, 2250, loja 10 | Confirmado: ACM 2025 + CAACE + pin no Maps |
| WhatsApp (85) 98108-2522 | **Divergente:** ACM 2025. A CAACE (2022) traz (85) 9.8644-0775. O site marca “Demo: confirmar” |
| Instagram @speculariotica | Provável (ACM 2025); a CAACE grafa @spetaculareotica |
| Produtos: armações, lentes de grau, esportivos, acessórios | Provável (convênio CAACE) |
| Horário, marcas, linha solar, convênios vigentes | Não confirmados; o site não menciona |

Fontes: [`vendas/pesquisa-proximos-5-2026-09-25.md`](../../vendas/pesquisa-proximos-5-2026-09-25.md).

## Imagens

`assets/*.webp` são **placeholders temporários**. Substituir por
`speculari-hero`, `speculari-dobradica`, `speculari-lente` (e opcionalmente
`speculari-formatos`) de
[`vendas/PROMPTS-ASSETS-5-SITES-2026-09-25.md`](../../vendas/PROMPTS-ASSETS-5-SITES-2026-09-25.md).

## Dependências externas

Google Fonts (Gloock, Urbanist), Phosphor Icons light 2.1.1 e GSAP 3.12.5 +
ScrollTrigger via jsDelivr. Sem GSAP, a seção do detalhe fica estática e todo
o resto funciona.

## Executar e testar

```bash
python -m http.server 8765 --bind 127.0.0.1
python tests/test_new_sites_2026_09.py speculari
```

## Agente

`speculari_otica` em `agents.yaml`: pergunta uso, formato, presença, material e
dia da prova; não indica grau nem lente; manda sintomas oculares para
oftalmologista; fecha com `📋 RESUMO DO ATENDIMENTO`.

## Pendências com a ótica

Número atual de WhatsApp, Instagram oficial, horário, se trabalha com linha
solar, convênios vigentes, logo, fotos reais da loja e dos produtos e
autorização para usar a marca.
