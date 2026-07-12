import type { ProjectSettings, Slide } from '../types';
import { resolveSlideStyle, type ResolvedSlideStyle } from './resolveStyle';

export type CanvasSize = { width: number; height: number };

export type SlideLayout = {
  style: ResolvedSlideStyle;
  /** Padding em pixels "reais" do canvas de exportação (16:9, canvasWidth x canvasHeight). */
  padding: number;
  contentWidth: number;
  contentHeight: number;
  lineHeight: number;
};

/**
 * Única fonte de verdade para "como o slide deve ficar": padding, área de
 * conteúdo e cores resolvidas. O <Stage> (DOM/CSS) e o ExportRenderer
 * (canvas 2D) chamam esta função e só traduzem o resultado pra sua própria
 * tecnologia de desenho — nunca duplicam a decisão de layout.
 *
 * O <Stage> é montado com as dimensões *reais* do canvas (ex.: 1920x1080) e
 * escalado visualmente via CSS transform, então o wrap nativo do navegador e
 * o wrap manual do canvas 2D operam sobre os mesmos pixels e batem.
 */
export function computeSlideLayout(
  slide: Slide,
  settings: ProjectSettings,
  canvas: CanvasSize,
): SlideLayout {
  const style = resolveSlideStyle(slide, settings);
  const padding = Math.round(canvas.width * 0.08);
  const fontSize = style.fontSize ?? settings.fontSize;
  return {
    style,
    padding,
    contentWidth: canvas.width - padding * 2,
    contentHeight: canvas.height - padding * 2,
    lineHeight: Math.round(fontSize * 1.35),
  };
}

/** Quebra de linha manual para o canvas 2D (o DOM usa o wrap nativo do navegador). */
export function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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

/** Geometria de posicionamento de imagem para 'contain' | 'cover', usada só pelo canvas. */
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
