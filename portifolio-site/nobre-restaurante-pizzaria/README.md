# Nobre Restaurante e Pizzaria — conceito de site

**Status:** em desenvolvimento. Código, imagens e testes prontos; faltam teste
da resposta real do agente e vídeo. **Não publicado, não enviado à casa.**

## Conceito visual

**Uma noite inteira à mesa.** Os dados reais mostram duas faces: o cardápio de
Maracanaú é de almoço (prato montado, executivos, massas) e o de Maranguape é
de noite (pizzas, combos, hambúrguer, pastéis). O site conta isso como um dia
que vira noite, sem parecer dois templates colados.

- **Hero:** almoço e pizza no mesmo quadro, com uma divisa sol/lua que se
  arrasta (mouse, toque ou setas do teclado; `role="slider"`). Parada, a luz
  vai e volta sozinha.
- **Céu que acompanha a rolagem:** uma camada fixa troca de cor conforme o
  capítulo na tela: oliva claro (almoço) → âmbar (entardecer) → bordô
  (noite) → verde-oliva escuro (fim da noite), com mistura em OKLCH.
- **Scroll scrub:** o sol percorre um arco e escurece; a foto da pizza é
  cortada em 8 fatias (clip-path em elipse, seguindo a perspectiva) que se
  juntam com a rolagem. No desktop a seção fica fixada; no celular, não.
- **Conversão:** seletor de unidade que troca o cardápio oficial (MenuDino) e o
  WhatsApp; formulário de **pedido de reserva** que monta a mensagem para o
  WhatsApp de reservas publicado pela casa.
- **Tipografia:** Young Serif + Albert Sans. Movimento lento e quente.

## Dados (Linktree oficial + MenuDino, 25/09/2026)

| Dado | Situação |
|---|---|
| Pedido Maracanaú / Maranguape (MenuDino) | Confirmado |
| WhatsApp Maracanaú (85) 98888-5464, Maranguape (85) 3341-2675 | Confirmado |
| WhatsApp de reservas (85) 98177-4418 | Confirmado (“Faça uma Reserva”) |
| “Desde 2007” | Autodeclarado na bio do Linktree |
| Endereço Maracanaú R. 49, 37, Jereissati II | Provável (diretórios); marcado “confirmar” |
| Endereço Maranguape, horários | Não localizados |
| Rodízio, música ao vivo, espaço infantil, promoções, preços | Não mencionados |

O telefone fixo (85) 3015-4089 da pesquisa antiga não aparece no Linktree e não
foi usado no site.

## Imagens

`almoco`, `pizza`, `mesa-noite`, `massa`: geradas com GPT Images
(conceituais, rotuladas no rodapé). Se chegar uma pizza vista de cima
(`nobre-pizza-topo`), basta trocar a imagem e ajustar `data-cx`, `data-cy`,
`data-rx` e `data-ry` em `.wedges` para 0.5/0.5/0.4/0.4.

## Dependências externas

Google Fonts (Young Serif, Albert Sans), Phosphor Icons, GSAP 3.12.5 +
ScrollTrigger. Sem GSAP, a pizza aparece inteira e o resto funciona.

## Executar e testar

```bash
python -m http.server 8765 --bind 127.0.0.1
python tests/test_new_sites_2026_09.py nobre
```

## Agente

`nobre_restaurante` em `agents.yaml`: descobre almoço ou noite, unidade,
pessoas e se é pedido ou reserva; nunca cita preço, sabor ou promoção; nunca
confirma reserva; fecha com `📋 RESUMO DO ATENDIMENTO`.

## Pendências com a casa

Endereços e horários das duas unidades, se a agência atual aceita um site
institucional, fotos reais, logo e autorização de marca, e se o MenuDino segue
como canal oficial.
