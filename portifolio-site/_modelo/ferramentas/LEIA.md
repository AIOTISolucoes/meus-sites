# Ferramentas de site de cliente

Scripts que nasceram na Gentleman Barbearia (12/ago/2026) e que servem pro
próximo cliente. **Todos têm caminhos apontando pra pasta `gentleman/`** —
ao reusar, trocar as constantes do topo (`SAIDA`, `PASTA`, `HTML`, `AGENTE`).

| script | pra que serve |
|---|---|
| `vetorizar.py` | **transforma a foto de perfil do Instagram em SVG.** O IG só entrega 150×150 (resolução maior volta 403), então a logo é reconstruída por tracing: LANCZOS ×8 → blur → limiar → marching squares (skimage) → Douglas-Peucker → Catmull-Rom. Gera o brasão e um monograma pra nav. |
| `injetar_svg.py` | cola o SVG gerado **dentro** do `index.html`, nos marcadores `<!--BRASAO-->` / `<!--MONOGRAMA-->`. Inline porque a intro anima os grupos separados, e `fetch()` quebra se o cliente abrir o arquivo em `file://`. |
| `tratar.py` | corta as fotos do feed em 3:4 e aplica o **mesmo** filtro em todas. Tem pré-corte (pra jogar fora tarja de post) e giro (reel gravado deitado). |
| `retrato.html` | **bancada de desenho**: mostra 8 combinações do SVG lado a lado. Iterar aqui é muito mais rápido que recarregar o site inteiro a cada ajuste de path. |
| `portar_retrato.py` | leva o desenho aprovado na bancada pro `index.html`, garantindo que os dois não divirjam. |
| `testar_agente.py` | roda perguntas-armadilha contra um agente **sem subir o Streamlit** (~30s). Chama `core.agent.responder` direto — o `MODO_DEMO` do `app.py` engole a exceção real. |

## Dependências

`vetorizar.py` e `tratar.py` precisam de `numpy`, `pillow` e
`scikit-image`. Já estavam instalados neste PC em ago/2026.

## A ordem de uso, num cliente novo

1. Baixar a foto de perfil e as fotos do feed (agent-browser + `urllib`; o
   `curl` num `while read` já falhou, usar Python).
2. `vetorizar.py` → `assets/brasao.svg` + `assets/monograma.svg`.
   ⚠️ Conferir o resultado **renderizado**, não confiar no tamanho do arquivo.
3. `tratar.py` → as fotos em `assets/`.
4. Escrever o `index.html` com os marcadores, rodar `injetar_svg.py`.
5. Se o site tiver um desenho interativo, iterar em `retrato.html` e portar.
6. `testar_agente.py` antes de gravar qualquer vídeo.
