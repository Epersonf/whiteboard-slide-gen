import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';
import type { Project } from '../types';
import { makeTimeline, preloadAssets, renderFrameAt } from './renderFrame';
import type { ExportHandle, ExportProgress } from './types';

/**
 * Opção B — FFmpeg.wasm + MP4 (H.264), a opção de "alta qualidade" e maior
 * compatibilidade fora do navegador. Não roda em tempo real: cada frame é
 * desenhado na velocidade que o navegador conseguir, depois o ffmpeg
 * costura tudo com CRF baixo (quase sem perdas). Não suporta canal alpha —
 * fundo transparente força exportação em WebM (ver exportWebm.ts).
 */
export function exportMp4(project: Project, onProgress?: (p: ExportProgress) => void): ExportHandle {
  let cancelled = false;
  let ffmpeg: FFmpeg | null = null;

  const canvasSize = { width: project.settings.canvasWidth, height: project.settings.canvasHeight };
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D não suportado');

  const result = (async () => {
    onProgress?.({ stage: 'preparing', ratio: 0, message: 'Carregando codificador de vídeo…' });
    ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(coreURL, 'text/javascript'),
      wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
    });
    if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');

    const [imageCache] = await Promise.all([preloadAssets(project)]);
    const timeline = makeTimeline(project);
    const fps = project.settings.fps;
    const totalFrames = Math.max(1, Math.round((timeline.totalMs / 1000) * fps));

    onProgress?.({ stage: 'rendering', ratio: 0 });
    for (let i = 0; i < totalFrames; i++) {
      if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');
      const t = Math.min((i * 1000) / fps, timeline.totalMs);
      renderFrameAt(ctx, t, project, timeline, imageCache);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Falha ao capturar frame');
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const name = `frame_${String(i).padStart(5, '0')}.png`;
      await ffmpeg.writeFile(name, bytes);
      onProgress?.({ stage: 'rendering', ratio: (i + 1) / totalFrames });
    }

    if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');

    onProgress?.({ stage: 'encoding', ratio: 0, message: 'Codificando MP4…' });
    ffmpeg.on('progress', ({ progress }) => {
      onProgress?.({ stage: 'encoding', ratio: Math.min(1, Math.max(0, progress)) });
    });

    await ffmpeg.exec([
      '-framerate', String(fps),
      '-i', 'frame_%05d.png',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '16',
      '-pix_fmt', 'yuv420p',
      'output.mp4',
    ]);

    if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');

    const data = await ffmpeg.readFile('output.mp4');
    onProgress?.({ stage: 'done', ratio: 1 });
    return new Blob([data as BlobPart], { type: 'video/mp4' });
  })();

  return {
    result: result.finally(() => {
      ffmpeg?.terminate();
    }),
    cancel: () => {
      cancelled = true;
      ffmpeg?.terminate();
    },
  };
}
