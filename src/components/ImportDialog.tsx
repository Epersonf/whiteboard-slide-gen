import { observer } from 'mobx-react-lite';
import { useRef, useState, type ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { parseProjectJson } from '../lib/projectFile';

export const ImportDialog = observer(function ImportDialog({ onClose }: { onClose: () => void }) {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLoadJson(text: string) {
    try {
      const parsed = parseProjectJson(text);
      project.loadProject(parsed);
      playback.reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON inválido.');
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
    setError(null);
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Importar" onClick={(e) => e.stopPropagation()}>
        <h2 className="panel__title">Importar projeto (JSON)</h2>
        <p className="modal__hint">
          Substitui o tema e os elementos do projeto atual pelo conteúdo de um arquivo <code>.json</code> exportado por
          aqui.
        </p>
        <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
          Escolher arquivo .json
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleFileChange} />
        <textarea
          className="textarea-field"
          rows={8}
          placeholder="...ou cole o JSON aqui"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setError(null);
          }}
          autoFocus
        />
        {error && <p className="export-error">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="button button--primary" onClick={() => handleLoadJson(jsonText)} disabled={!jsonText.trim()}>
            Carregar projeto
          </button>
        </div>
      </div>
    </div>
  );
});
