import { TRANSPARENT, type Project, type Slide, type SlideElement } from '../types';
import { computeElementBox, computeImageDrawRect, textPadding, wrapCanvasText, type CanvasSize } from '../lib/layout';
import { resolveSlideBackground, resolveTextElementStyle } from '../lib/resolveStyle';
import { buildTimeline, resolveFrameAt, type Timeline } from '../lib/timeline';

export type ImageCache = Map<string, HTMLImageElement>;

/** Carrega fontes e decodifica imagens antes de qualquer frame ser desenhado. */
export async function preloadAssets(project: Project): Promise<ImageCache> {
  const fontSpecs = new Set<string>();
  const imageElements: { id: string; src: string }[] = [];

  for (const slide of project.slides) {
    for (const el of slide.elements) {
      if (el.type === 'text') {
        const family = el.fontFamily ?? project.settings.fontFamily;
        const size = el.fontSize ?? project.settings.fontSize;
        fontSpecs.add(`${size}px ${family}`);
      } else {
        imageElements.push({ id: el.id, src: el.src });
      }
    }
  }

  await Promise.all([...fontSpecs].map((spec) => document.fonts.load(spec).catch(() => undefined)));
  await document.fonts.ready;

  const cache: ImageCache = new Map();
  await Promise.all(
    imageElements.map(async ({ id, src }) => {
      const img = new Image();
      img.src = src;
      await img.decode().catch(() => undefined);
      cache.set(id, img);
    }),
  );
  return cache;
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  element: SlideElement,
  project: Project,
  canvasSize: CanvasSize,
  imageCache: ImageCache,
) {
  const box = computeElementBox(element, canvasSize);
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();

  if (element.type === 'image') {
    const img = imageCache.get(element.id);
    if (img && img.naturalWidth > 0) {
      const rect = computeImageDrawRect(img.naturalWidth, img.naturalHeight, box, element.fit ?? 'contain');
      ctx.drawImage(img, box.x + rect.x, box.y + rect.y, rect.width, rect.height);
    }
  } else {
    const style = resolveTextElementStyle(element, project.settings);
    const padding = textPadding(style.fontSize);
    const contentWidth = Math.max(0, box.width - padding * 2);
    const lineHeight = Math.round(style.fontSize * 1.35);

    ctx.fillStyle = style.color;
    ctx.font = `${style.fontSize}px ${style.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = style.align;
    const lines = wrapCanvasText(ctx, element.content, contentWidth);
    const totalHeight = lines.length * lineHeight;
    let y = box.y + (box.height - totalHeight) / 2 + lineHeight / 2;
    const x = style.align === 'left' ? box.x + padding : style.align === 'right' ? box.x + box.width - padding : box.x + box.width / 2;
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
  }
  ctx.restore();
}

function drawSlideLayer(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  project: Project,
  canvasSize: CanvasSize,
  alpha: number,
  imageCache: ImageCache,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  const background = resolveSlideBackground(slide, project.settings);
  if (background !== TRANSPARENT) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }

  const sorted = [...slide.elements].sort((a, b) => a.z - b.z);
  for (const element of sorted) {
    drawElement(ctx, element, project, canvasSize, imageCache);
  }
  ctx.restore();
}

/**
 * Desenha o frame correspondente ao instante t (ms) da linha do tempo.
 * Sempre limpa o canvas primeiro (em vez de preencher com uma cor base
 * neutra) para permitir fundo transparente de ponta a ponta.
 */
export function renderFrameAt(
  ctx: CanvasRenderingContext2D,
  t: number,
  project: Project,
  timeline: Timeline,
  imageCache: ImageCache,
) {
  const canvasSize: CanvasSize = { width: project.settings.canvasWidth, height: project.settings.canvasHeight };
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  const frame = resolveFrameAt(t, timeline, project.settings.transitionMs);
  if (frame.kind === 'empty') return;
  if (frame.kind === 'solo') {
    drawSlideLayer(ctx, project.slides[frame.slideIndex], project, canvasSize, frame.alpha, imageCache);
    return;
  }
  drawSlideLayer(ctx, project.slides[frame.fromIndex], project, canvasSize, 1 - frame.progress, imageCache);
  drawSlideLayer(ctx, project.slides[frame.toIndex], project, canvasSize, frame.progress, imageCache);
}

export function projectHasTransparency(project: Project): boolean {
  if (project.settings.background === TRANSPARENT) return true;
  return project.slides.some((s) => s.background === TRANSPARENT);
}

export function makeTimeline(project: Project): Timeline {
  return buildTimeline(project.slides, project.settings.transitionMs);
}
