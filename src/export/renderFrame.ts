import { TRANSPARENT, type ImageSlide, type Project, type Slide } from '../types';
import { computeImageDrawRect, computeSlideLayout, wrapCanvasText, type CanvasSize } from '../lib/layout';
import { buildTimeline, resolveFrameAt, type Timeline } from '../lib/timeline';

export type ImageCache = Map<string, HTMLImageElement>;

/** Carrega fontes e decodifica imagens antes de qualquer frame ser desenhado. */
export async function preloadAssets(project: Project): Promise<ImageCache> {
  const fontSpecs = new Set<string>();
  for (const slide of project.slides) {
    if (slide.type === 'text') {
      const family = slide.fontFamily ?? project.settings.fontFamily;
      const size = slide.fontSize ?? project.settings.fontSize;
      fontSpecs.add(`${size}px ${family}`);
    }
  }
  await Promise.all([...fontSpecs].map((spec) => document.fonts.load(spec).catch(() => undefined)));
  await document.fonts.ready;

  const cache: ImageCache = new Map();
  await Promise.all(
    project.slides
      .filter((s): s is ImageSlide => s.type === 'image')
      .map(async (s) => {
        const img = new Image();
        img.src = s.src;
        await img.decode().catch(() => undefined);
        cache.set(s.id, img);
      }),
  );
  return cache;
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
  const layout = computeSlideLayout(slide, project.settings, canvasSize);
  ctx.save();
  ctx.globalAlpha = alpha;

  if (layout.style.background !== TRANSPARENT) {
    ctx.fillStyle = layout.style.background;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }

  if (slide.type === 'image') {
    const img = imageCache.get(slide.id);
    if (img && img.naturalWidth > 0) {
      const rect = computeImageDrawRect(img.naturalWidth, img.naturalHeight, canvasSize, slide.fit ?? 'contain');
      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    }
  } else {
    const align = layout.style.align ?? 'center';
    ctx.fillStyle = layout.style.color ?? '#000';
    ctx.font = `${layout.style.fontSize}px ${layout.style.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = align;
    const lines = wrapCanvasText(ctx, slide.content, layout.contentWidth);
    const totalHeight = lines.length * layout.lineHeight;
    let y = (canvasSize.height - totalHeight) / 2 + layout.lineHeight / 2;
    const x = align === 'left' ? layout.padding : align === 'right' ? canvasSize.width - layout.padding : canvasSize.width / 2;
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += layout.lineHeight;
    }
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
