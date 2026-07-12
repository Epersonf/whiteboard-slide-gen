import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { startExport, fileExtensionFor, projectHasTransparency, type ExportHandle, type ExportProgress } from '../export/ExportRenderer';
import { downloadProjectJson } from '../lib/projectFile';
import type { ExportFormat } from '../types';

type DialogFormat = ExportFormat | 'json';

const STAGE_LABEL: Record<ExportProgress['stage'], string> = {
  preparing: 'Preparando',
  rendering: 'Renderizando frames',
  encoding: 'Codificando vídeo',
  done: 'Concluído',
};

export const ExportDialog = observer(function ExportDialog({ onClose }: { onClose: () => void }) {
  const project = useProjectStore();
  const hasTransparency = projectHasTransparency(project.project);
  const [format, setFormat] = useState<DialogFormat>(hasTransparency ? 'webm' : project.settings.exportFormat);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [jsonDone, setJsonDone] = useState(false);
  const handleRef = useRef<ExportHandle | null>(null);

  useEffect(() => {
    return () => {
      handleRef.current?.cancel();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRunning = progress !== null && progress.stage !== 'done' && !downloadUrl && !error;

  function selectFormat(next: DialogFormat) {
    setFormat(next);
    setError(null);
    setJsonDone(false);
  }

  async function handleStart() {
    if (format === 'json') {
      downloadProjectJson(project.project);
      setJsonDone(true);
      return;
    }
    setError(null);
    setDownloadUrl(null);
    setProgress({ stage: 'preparing', ratio: 0 });
    project.updateSettings({ exportFormat: format });
    const handle = startExport(project.project, format, setProgress);
    handleRef.current = handle;
    try {
      const blob = await handle.result;
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setProgress(null);
      } else {
        setError(err instanceof Error ? err.message : 'Falha desconhecida na exportação.');
      }
    }
  }

  function handleCancel() {
    handleRef.current?.cancel();
  }

  const fileName = `${project.name || 'projeto'}.${format === 'json' ? 'json' : fileExtensionFor(format)}`;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Exportar" onClick={(e) => e.stopPropagation()}>
        <h2 className="panel__title">Exportar</h2>

        <fieldset className="export-format" disabled={isRunning}>
          <legend>Formato</legend>
          <label>
            <input type="radio" name="format" checked={format === 'mp4'} disabled={hasTransparency} onChange={() => selectFormat('mp4')} />
            MP4 (H.264) — alta qualidade, mais compatível
          </label>
          <label>
            <input type="radio" name="format" checked={format === 'webm'} onChange={() => selectFormat('webm')} />
            WebM — vídeo, necessário para fundo transparente
          </label>
          <label>
            <input type="radio" name="format" checked={format === 'json'} onChange={() => selectFormat('json')} />
            JSON — projeto completo (tema + slides + imagens em base64)
          </label>
          {hasTransparency && format === 'mp4' && (
            <p className="export-format__note">
              Este projeto usa fundo transparente. MP4/H.264 não suporta canal alpha — escolha WebM.
            </p>
          )}
        </fieldset>

        {format !== 'json' && progress && (
          <div className="export-progress">
            <div className="export-progress__bar">
              <div className="export-progress__fill" style={{ width: `${Math.round(progress.ratio * 100)}%` }} />
            </div>
            <p className="export-progress__label">
              {STAGE_LABEL[progress.stage]} — {Math.round(progress.ratio * 100)}%
              {progress.stage === 'rendering' && format === 'webm' && ' (tempo real, não acelera)'}
            </p>
          </div>
        )}

        {jsonDone && format === 'json' && <p className="export-format__note">JSON baixado como {fileName}.</p>}
        {error && <p className="export-error">{error}</p>}

        <div className="modal__actions">
          {format === 'json' ? (
            <button type="button" className="button button--primary" onClick={handleStart}>
              Baixar JSON
            </button>
          ) : (
            <>
              {!isRunning && !downloadUrl && (
                <button type="button" className="button button--primary" onClick={handleStart} disabled={project.slides.length === 0}>
                  Iniciar exportação
                </button>
              )}
              {isRunning && (
                <button type="button" className="button" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
              {downloadUrl && (
                <a className="button button--primary" href={downloadUrl} download={fileName}>
                  Baixar {fileName}
                </a>
              )}
            </>
          )}
          <button type="button" className="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
});
