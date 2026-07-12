import { TRANSPARENT, type Project, type SlideElement } from '../types';
import { computeElementBox, computeImageDrawRect, textPadding, wrapCanvasText, type CanvasSize } from '../lib/layout';
import { resolveTextElementStyle, type ResolvedTextStyle } from '../lib/resolveStyle';
import { computeElementFadeAlpha } from '../lib/fade';
import { buildTimeline, resolveFrameAlphaAt, type Timeline } from '../lib/timeline';

export type ImageCache = Map<string, HTMLImageElement>;

/** Carrega fontes e decodifica imagens antes de qualquer frame ser desenhado. */
export async function preloadAssets(project: Project): Promise<ImageCache> {
  const fontSpecs = new Set<string>();
  const imageElements: { id: string; src: string }[] = [];

  for (const el of project.elements) {
    if (el.type === 'text') {
      const family = el.fontFamily ?? project.settings.fontFamily;
      const size = el.fontSize ?? project.settings.fontSize;
      const weight = el.fontWeight ?? 400;
      const style = el.italic ? 'italic' : 'normal';
      fontSpecs.add(`${style} ${weight} ${size}px ${family}`);
    } else {
      imageElements.push({ id: el.id, src: el.src });
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

function drawUnderline(ctx: CanvasRenderingContext2D, line: string, xAnchor: number, y: number, style: ResolvedTextStyle) {
  if (!line) return;
  const width = ctx.measureText(line).width;
  const left = style.align === 'left' ? xAnchor : style.align === 'right' ? xAnchor - width : xAnchor - width / 2;
  const thickness = Math.max(1, Math.round(style.fontSize * 0.06));
  const underlineY = y + style.fontSize * 0.35;
  ctx.save();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(left, underlineY);
  ctx.lineTo(left + width, underlineY);
  ctx.stroke();
  ctx.restore();
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  element: SlideElement,
  project: Project,
  canvasSize: CanvasSize,
  imageCache: ImageCache,
  frameAlpha: number,
  msSinceHoldStart: number,
  holdDurationMs: number,
) {
  const alpha = frameAlpha * computeElementFadeAlpha(element, msSinceHoldStart, holdDurationMs);
  if (alpha <= 0) return;

  const box = computeElementBox(element, canvasSize);
  ctx.save();
  ctx.globalAlpha = alpha;
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
    ctx.font = `${style.italic ? 'italic ' : ''}${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = style.align;
    const lines = wrapCanvasText(ctx, element.content, contentWidth);
    const totalHeight = lines.length * lineHeight;
    let y = box.y + (box.height - totalHeight) / 2 + lineHeight / 2;
    const x = style.align === 'left' ? box.x + padding : style.align === 'right' ? box.x + box.width - padding : box.x + box.width / 2;
    for (const line of lines) {
      ctx.fillText(line, x, y);
      if (style.underline) drawUnderline(ctx, line, x, y, style);
      y += lineHeight;
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

  const alpha = resolveFrameAlphaAt(t, timeline, project.settings.transitionMs);
  if (alpha <= 0) return;

  ctx.save();
  if (project.settings.background !== TRANSPARENT) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = project.settings.background;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }

  const msSinceHoldStart = t - timeline.holdStart;
  const holdDurationMs = timeline.holdEnd - timeline.holdStart;
  const sorted = [...project.elements].sort((a, b) => a.z - b.z);
  for (const element of sorted) {
    drawElement(ctx, element, project, canvasSize, imageCache, alpha, msSinceHoldStart, holdDurationMs);
  }
  ctx.restore();
}

export function projectHasTransparency(project: Project): boolean {
  return project.settings.background === TRANSPARENT;
}

export function makeTimeline(project: Project): Timeline {
  return buildTimeline(project.settings.duration, project.settings.transitionMs);
}
