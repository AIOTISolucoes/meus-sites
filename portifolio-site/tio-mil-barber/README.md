# Tio Mil Barber — conceito de site

**Status:** site pronto e testado, com as imagens do GPT Images. Faltam fotos
reais; revisão com o negócio pendente. **Não publicado, não enviado à barbearia.**

## Dados usados e fonte

Fonte: prints do perfil [@tio_mil_barber](https://www.instagram.com/tio_mil_barber/)
enviados pelo usuário em 28/09/2026. O Instagram bloqueia acesso automatizado a
partir do servidor da sessão (HTTP 429), e o Google não tem nada indexado sobre
a barbearia.

| Dado | Valor | Confiança | Fonte |
| --- | --- | --- | --- |
| Nome | Tio Mil Barber (logo: "Tio Mil Barber Shop", Est. 2017) | Confirmado | Nome e post do logo no perfil |
| Responsável | Emilson ("Tio Mil") | Confirmado | Nome do perfil |
| WhatsApp e telefone | (85) 99185-8627 | Confirmado | Bio e flyer com ícone de WhatsApp |
| Endereço | Rua Francisco Almeida, 813, Fortaleza/CE | Confirmado | Flyer de 12/08 |
| Bairro | Parque Santa Rosa (CEP 60762-845) | Provável | Faixa de CEP da rua: números 340 a 1055 ([ruacep](https://www.ruacep.com.br/ce/fortaleza/parque-santa-rosa/60762845-rua-francisco-almeida/)) |
| Lemas | "Seu estilo, nossa missão!", "+ Estilo, + confiança, sempre você!", "Visual novo, atitude inconfundível!" | Confirmado | Flyer |
| Bio | "Deus no controle de tudo" | Confirmado | Perfil |
| Serviços, valores, horários | Não publicados | — | O site manda confirmar no WhatsApp |

## Conceito: a cadeira do Tio

Barbearia de bairro com nome de família. A estrela da comunicação dele é o
antes e depois, então o site gira em torno disso.

- **Paleta:** preto quente e dourado velho, tirados das artes da própria barbearia.
  - O vermelho e o azul aparecem só no poste de barbeiro.
  - Fica diferente das outras barbearias do portfólio: Gentleman (laranja), North (marinho e vermelho) e LS (amarelo com Oswald).
- **Tipografia:** Big Shoulders Display no grito de pôster, Geist no texto e Geist Mono na comanda.
- **Poste de barbeiro:** é a barra de progresso da página.
  - No desktop fica fixo à direita, e as listras giram com a rolagem.
  - No celular vira a faixa listrada no topo.
- **Hero:** foto cinematográfica da cadeira (GPT Images) em tela cheia.
  - A imagem desliza devagar com a rolagem e acompanha o mouse de leve.
- **Interação-assinatura, a passada da máquina:**
  - No desktop, a seção fica fixada e a rolagem passa uma máquina (SVG) sobre a foto.
  - A máquina revela o "depois" sobre o "antes" e solta fios de cabelo num canvas.
  - Depois disso dá para arrastar a linha. É um `input range` real, acessível pelo teclado.
  - No celular a máquina anda sozinha até 62% quando a foto aparece.
  - As fotos foram alinhadas pelo fundo (placa, parede) com correlação de fase.
- **Texto que acende:** as palavras da frase "Eu só entrego o trabalho…" acendem com a rolagem.
  - A frase veio da legenda do próprio post.
- **Bento sem vãos:** grade 4×3.
  - O cartão em pé traz a foto real de "depois" e vira em 3D para mostrar o "antes".
  - Os outros cartões: lema, WhatsApp, Instagram, a navalha com parallax e "Est. 2017 · Deus no controle de tudo".
  - Vira 2 colunas no tablet e 1 no celular.
- **O kit do Tio:** a foto das ferramentas vistas de cima, com um foco de luz (máscara radial e anel dourado) que percorre as sete ferramentas.
  - No desktop a seção fica fixada e a rolagem passa o foco de uma para outra.
  - No celular o foco acompanha a rolagem.
  - Tocar num botão ou na foto acende a ferramenta escolhida.
- **Na cadeira do Tio:** quatro momentos em rolagem horizontal fixada no desktop.
  - Três cartões têm foto com parallax: a cadeira, a tesoura e o degradê.
  - O cartão da conversa tem um desenho traçado pela rolagem.
- **Comanda:** o visitante escolhe serviço, dia (com data), período e nome.
  - A comanda de papel se preenche com efeito de máquina de escrever.
  - O botão manda a mensagem pronta para o WhatsApp.
- **Faixa de lemas:** acelera e inverte o sentido com a velocidade da rolagem.
- **Chat:** agente `tio_mil_barber` no `agents.yaml`.
  - Não sabe valores nem horários e manda confirmar no WhatsApp.
  - Fecha com um "pedido de horário".
- **Movimento reduzido:** sem fixar seções.
  - O comparador abre em 50% e a faixa fica parada.
  - O botão "Ativar animações" permite ver a versão completa.

## Imagens

- `assets/antes.webp` e `assets/depois.webp`: recortes do post de antes e depois do perfil.
  - O print tem baixa resolução, então foram ampliados 2× com Lanczos.
  - Trocar pelo post original quando possível.
- `assets/emblema.webp` e `assets/emblema-96.png`: logo do post de 12/02, recortado em círculo.
- `hero`, `ferramentas`, `degrade`, `navalha` e `tesoura`: geradas no GPT Images pelo usuário em 28/09 com os prompts de [PROMPTS-GPT-IMAGES.md](PROMPTS-GPT-IMAGES.md).
  - São conceituais, e o rodapé avisa isso.

## Testes

```bash
python -m http.server 8765 --bind 127.0.0.1
python tests/test_new_sites_2026_09.py tiomil
```

A bateria cobriu 10 tamanhos de tela nos dois modos de movimento, a comanda, o comparador pelo teclado, o kit, a virada do cartão, o menu, o chat e a página funcionando sem GSAP. Tudo passou.

## Antes de mostrar ao Tio Mil

- Confirmar o bairro e se o número 813 está certo.
- Perguntar serviços, valores e horários, se ele quiser publicá-los.
- Pedir fotos reais do espaço e de outros cortes.
