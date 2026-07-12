import type { ExportFormat, Project } from '../types';
import { exportWebm } from './exportWebm';
import { projectHasTransparency } from './renderFrame';
import type { ExportHandle, ExportProgress } from './types';

export type { ExportProgress, ExportHandle } from './types';

/**
 * Ponto único de entrada da exportação. Não é um componente visual — decide
 * qual pipeline usar (seção 9.3 vs 9.4) e garante que fundo transparente
 * nunca vá para o pipeline MP4 (H.264 não tem canal alpha). O pipeline MP4
 * (ffmpeg.wasm, ~30MB de core wasm) só é importado sob demanda, quando o
 * usuário efetivamente pede exportação em MP4.
 */
export function startExport(project: Project, format: ExportFormat, onProgress?: (p: ExportProgress) => void): ExportHandle {
  const effectiveFormat = projectHasTransparency(project) ? 'webm' : format;
  if (effectiveFormat === 'webm') {
    return exportWebm(project, onProgress);
  }

  let cancelled = false;
  let inner: ExportHandle | null = null;
  const result = import('./exportMp4').then(({ exportMp4 }) => {
    if (cancelled) throw new DOMException('Exportação cancelada', 'AbortError');
    inner = exportMp4(project, onProgress);
    return inner.result;
  });

  return {
    result,
    cancel: () => {
      cancelled = true;
      inner?.cancel();
    },
  };
}

export function fileExtensionFor(format: ExportFormat): string {
  return format === 'mp4' ? 'mp4' : 'webm';
}

export { projectHasTransparency };
