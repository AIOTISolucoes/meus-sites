# Cena Vercel para Reels

Cena vertical de 5,4 segundos em 1080x1920, criada para o trecho de 3s a 8s do roteiro.

## Prévia

Abra `index.html` no navegador. A animação reinicia automaticamente.

## Renderizar o MP4

```powershell
python render.py
```

O arquivo final será salvo como `cena-vercel.mp4`.

## Ajustes rápidos

- Duração: altere `--duration` ao executar o render.
- Qualidade: use `--crf 16` para mais qualidade e arquivo maior.
- Saída: use `--output outro-nome.mp4`.

Exemplo:

```powershell
python render.py --duration 5.4 --fps 30 --crf 18
```

Todos os movimentos são determinísticos. Cada render usa exatamente os mesmos enquadramentos, posição do cursor e zoom.
