import { observer } from 'mobx-react-lite';
import { useRef, useState, type ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { splitScript } from '../lib/scriptSplitter';
import { parseProjectJson } from '../lib/projectFile';

type Mode = 'script' | 'json';

export const ImportDialog = observer(function ImportDialog({ onClose }: { onClose: () => void }) {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const [mode, setMode] = useState<Mode>('script');
  const [scriptText, setScriptText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSplit() {
    const slides = splitScript(scriptText);
    if (slides.length === 0) return;
    project.appendSlides(slides);
    onClose();
  }

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
        <h2 className="panel__title">Importar</h2>

        <div className="tabs">
          <button
            type="button"
            className={mode === 'script' ? 'tab tab--active' : 'tab'}
            onClick={() => {
              setMode('script');
              setError(null);
            }}
          >
            Roteiro
          </button>
          <button
            type="button"
            className={mode === 'json' ? 'tab tab--active' : 'tab'}
            onClick={() => {
              setMode('json');
              setError(null);
            }}
          >
            Projeto (JSON)
          </button>
        </div>

        {mode === 'script' ? (
          <>
            <p className="modal__hint">
              Cole um roteiro em texto corrido. Parágrafos separados por linha em branco viram slides; texto corrido é
              dividido por frase. Os slides gerados são adicionados ao fim da lista atual.
            </p>
            <textarea
              className="script-splitter__textarea"
              rows={8}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              autoFocus
            />
            <div className="modal__actions">
              <button type="button" className="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="button button--primary" onClick={handleSplit} disabled={!scriptText.trim()}>
                Dividir em slides
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal__hint">
              Substitui o tema e os slides do projeto atual pelo conteúdo de um arquivo <code>.json</code> exportado por
              aqui.
            </p>
            <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
              Escolher arquivo .json
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleFileChange} />
            <textarea
              className="script-splitter__textarea"
              rows={8}
              placeholder="...ou cole o JSON aqui"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
            />
            {error && <p className="export-error">{error}</p>}
            <div className="modal__actions">
              <button type="button" className="button" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => handleLoadJson(jsonText)}
                disabled={!jsonText.trim()}
              >
                Carregar projeto
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
