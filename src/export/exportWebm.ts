import type { Project } from '../types';
import { makeTimeline, preloadAssets, projectHasTransparency, renderFrameAt } from './renderFrame';
import type { ExportHandle, ExportProgress } from './types';

/**
 * Opção A — MediaRecorder + WebM. API nativa do navegador, sem dependências.
 * Único caminho que preserva canal alpha (fundo transparente), já que
 * MP4/H.264 não tem suporte amplo a transparência. Grava em tempo real: não
 * dá para acelerar, é limitação da própria API — refletido no onProgress.
 */
export function exportWebm(project: Project, onProgress?: (p: ExportProgress) => void): ExportHandle {
  let cancelled = false;
  const canvasSize = { width: project.settings.canvasWidth, height: project.settings.canvasHeight };
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Canvas 2D não suportado');

  const result = (async () => {
    onProgress?.({ stage: 'preparing', ratio: 0 });
    const [imageCache] = await Promise.all([preloadAssets(project)]);
    const timeline = makeTimeline(project);
    if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');

    const hasAlpha = projectHasTransparency(project);
    const candidates = hasAlpha
      ? ['video/webm;codecs=vp9', 'video/webm']
      : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mimeType = candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';

    const stream = canvas.captureStream(project.settings.fps);
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000 });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    if (timeline.totalMs <= 0) {
      recorder.start();
      recorder.stop();
      await stopped;
      return new Blob(chunks, { type: mimeType });
    }

    recorder.start();
    onProgress?.({ stage: 'rendering', ratio: 0 });
    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        if (cancelled) {
          resolve();
          return;
        }
        const t = performance.now() - startedAt;
        const clamped = Math.min(t, timeline.totalMs);
        renderFrameAt(ctx, clamped, project, timeline, imageCache);
        onProgress?.({ stage: 'rendering', ratio: clamped / timeline.totalMs });
        if (t >= timeline.totalMs) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    recorder.stop();
    await stopped;
    if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');
    onProgress?.({ stage: 'done', ratio: 1 });
    return new Blob(chunks, { type: mimeType });
  })();

  return {
    result,
    cancel: () => {
      cancelled = true;
    },
  };
}
