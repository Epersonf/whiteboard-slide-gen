# whiteboard-slide-gen

Editor de um único quadro (slide) com múltiplos elementos de texto e imagem
posicionados livremente (x/y/z, fade de entrada/saída), cores configuráveis
e exportação em vídeo — MP4 (alta qualidade, via ffmpeg.wasm) ou WebM
(necessário para fundo transparente).

## Rodando

```bash
npm install
npm run dev
```

Ou no VS Code: **Run and Debug → "whiteboard-slide-gen: dev server + Chrome"**
(`.vscode/launch.json`) sobe o servidor e abre o Chrome já apontado para
`http://localhost:5173`.

## Stack

- React + TypeScript + Vite
- MobX (`src/store`) para estado do projeto (persistente) e reprodução (efêmero)
- Canvas 2D + MediaRecorder (WebM) ou ffmpeg.wasm (MP4) para exportação — `src/export`

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — typecheck + build de produção
- `npm run lint` — ESLint
