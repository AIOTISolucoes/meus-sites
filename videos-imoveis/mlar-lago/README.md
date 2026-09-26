# Reels — M.Lar Lago

Reels vertical (1080×1920, 30 fps, 41 s) para a imobiliária divulgar o
**M.Lar Lago** (M.Lar Empreendimentos / Grupo Marquise), no Cambeba, em Fortaleza.

A grafia "Emilar Lado" do pedido corresponde a **M.Lar Lago**, conforme o
logo, a ficha técnica e o book da pasta do Drive.

## Entregas (`saida/`)

| Arquivo | Uso |
| --- | --- |
| `mlar-lago-reels.mp4` | Versão final com trilha original (H.264 + AAC, -14 LUFS). |
| `mlar-lago-reels-sem-musica.mp4` | Mesmo vídeo sem áudio, para usar uma música da biblioteca do Instagram. Os cortes seguem 120 BPM; qualquer faixa perto desse andamento encaixa. |
| `trilha.wav` | Trilha isolada. |
| `../legenda.txt` | Legenda sugerida para a publicação. |

## Roteiro

| Tempo | Cena | Transição |
| --- | --- | --- |
| 0–3 s | Fachada + gancho "Morar a 2 minutos do Lago Jacarey" | — |
| 3–9 s | Portaria, piscina com prainha, deck churrasqueira | whip pan, subida com parallax |
| 9–22 s | Decorado: estar, cozinha, varanda, suíte com closet, quartos | zoom "entrando" no apartamento, ripas verticais (eco do ripado do decorado) |
| 22–32 s | Lazer: fitness, gourmet, festas, brinquedoteca + playground, mini campo, piquenique + lounge, mini mercado | cortes na batida, telas divididas |
| 32–36 s | Planta tipo C, 3 quartos com suíte, 63 a 67 m², 1 vaga | painel verde da marca |
| 36–41 s | Logo, Cambeba · Fortaleza, "Agende sua visita / Chame no direct", aviso legal | subida com parallax |

Textos, rótulos e avisos ficam dentro da área segura do Reels: fora dos
220 px do topo, dos ~420 px de baixo e da coluna de botões à direita.

## Dados usados e fonte

Só entrou o que o material do Drive confirma:

- Nome, logo, endereço (R. Francisco Borges Soares, 523, Cambeba) e "a apenas 2 minutos do Lago Jacarey": book digital.
- 3 quartos com suíte; plantas A 63,70 m², B 63,22 m² e C 66,93 m²; 1 vaga por unidade; itens de lazer: ficha técnica.
- "Suíte com closet" e "varanda": legendas das plantas no book.
- Avisos: o texto legal do book diz que as perspectivas são ilustrativas, que a decoração é mera sugestão e que o mobiliário não será entregue.

**Ficou de fora de propósito:**
- O preço "a partir de" do texto legal, porque é de uma tabela datada (set/2026) e a pasta "01. Tabela" está vazia.
- A previsão de entrega.
- Telefone e perfil: o CTA é "Chame no direct".
- A pasta "06. Vídeos" também estava vazia; o vídeo usa renders e fotos.

## Como editar e renderizar

Requisitos: Python 3 com `playwright`, `numpy`, `scipy`, `pillow`, `pymupdf`; `ffmpeg`.

```bash
# 1. (só se trocar imagens) trata e redimensiona a seleção a partir da pasta do Drive baixada
python preparar-imagens.py "/caminho/da/pasta do Drive"

# 2. pré-visualizar no navegador (espaço pausa, ← → quadro a quadro, Shift = 1 s)
python -m http.server 8700   # e abrir http://localhost:8700/composicao.html

# 3. trilha e vídeo
python trilha.py
python renderizar.py                     # gera os dois MP4 em saida/
python renderizar.py --quadros 1.5 12 33 # só PNGs de conferência
```

- **Cenas, tempos, câmera, legendas e transições:** ficam em `ROTEIRO`, no topo de `composicao.html`.
  - Cada cena tem o foco da câmera (`x`, `y` de 0 a 1) e o zoom (`z`) no início e no fim.
  - As transições disponíveis são `whip`, `whipv`, `slideup`, `zoom`, `slats`, `panel`, `duo` e `cut`.
- **Cor:** o tratamento é feito em `preparar-imagens.py`.
  - Ajusta o nível de luminância, sem alterar o balanço de cada imagem.
  - Aplica um calor sutil nas fotos do decorado e segura um pouco a saturação dos renders.
  - Nada é acrescentado ou removido das imagens.
- **Trilha:** `trilha.py` sintetiza a música do zero (bateria, baixo, piano elétrico por FM e pad), sem samples de terceiros.
  - Os whooshes caem nos cortes listados em `WHOOSH`.
