import type { ElementBase } from '../types';

export type CanvasSize = { width: number; height: number };
export type Box = { x: number; y: number; width: number; height: number };

/** Converte a caixa percentual (0-100) de um elemento para pixels reais do canvas de exportação. */
export function computeElementBox(element: ElementBase, canvas: CanvasSize): Box {
  return {
    x: (element.x / 100) * canvas.width,
    y: (element.y / 100) * canvas.height,
    width: (element.width / 100) * canvas.width,
    height: (element.height / 100) * canvas.height,
  };
}

/** Padding interno de um elemento de texto, proporcional ao seu tamanho de fonte. */
export function textPadding(fontSize: number): number {
  return Math.round(fontSize * 0.25);
}

/** Quebra de linha manual para o canvas 2D (o DOM usa o wrap nativo do navegador). */
export function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${current} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }
  return lines;
}

export type DrawRect = { x: number; y: number; width: number; height: number };

/** Geometria de posicionamento de imagem para 'contain' | 'cover' dentro de uma caixa, usada só pelo canvas. */
export function computeImageDrawRect(
  imageWidth: number,
  imageHeight: number,
  box: CanvasSize,
  fit: 'contain' | 'cover',
): DrawRect {
  const boxRatio = box.width / box.height;
  const imgRatio = imageWidth / imageHeight;
  const scale =
    fit === 'contain'
      ? boxRatio > imgRatio
        ? box.height / imageHeight
        : box.width / imageWidth
      : boxRatio > imgRatio
        ? box.width / imageWidth
        : box.height / imageHeight;
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { x: (box.width - width) / 2, y: (box.height - height) / 2, width, height };
}
