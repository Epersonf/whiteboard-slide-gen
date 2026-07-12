import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { TextElementFields, ImageElementFields } from './ElementFields';
import { DEFAULT_FADE_MS, type SlideElement } from '../types';

function snippet(element: SlideElement): string {
  if (element.type === 'text') return element.content.trim().slice(0, 40) || '(vazio)';
  return 'Imagem';
}

export const ElementRow = observer(function ElementRow({ element }: { element: SlideElement }) {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      playback.selectElement(element.id);
    } else if (playback.selectedElementId === element.id) {
      playback.selectElement(null);
    }
  }

  return (
    <li className="element-row">
      <div className="element-row__header">
        <button type="button" className="element-row__toggle" onClick={toggle}>
          <span className="element-row__type">{element.type === 'text' ? 'Texto' : 'Imagem'}</span>
          <span className="element-row__snippet">{snippet(element)}</span>
        </button>
        <div className="element-row__actions">
          <button type="button" aria-label="Duplicar elemento" onClick={() => project.duplicateElement(element.id)}>⧉</button>
          <button type="button" aria-label="Remover elemento" onClick={() => project.removeElement(element.id)}>✕</button>
          <button type="button" aria-label={expanded ? 'Recolher elemento' : 'Expandir elemento'} onClick={toggle}>
            {expanded ? '︿' : '﹀'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="element-row__body">
          {element.type === 'text' ? <TextElementFields element={element} /> : <ImageElementFields element={element} />}

          <div className="position-grid">
            <label className="field">
              <span>X (%)</span>
              <input type="number" value={element.x} onChange={(e) => project.updateElement(element.id, { x: Number(e.target.value) })} />
            </label>
            <label className="field">
              <span>Y (%)</span>
              <input type="number" value={element.y} onChange={(e) => project.updateElement(element.id, { y: Number(e.target.value) })} />
            </label>
            <label className="field">
              <span>Largura (%)</span>
              <input
                type="number"
                min={1}
                value={element.width}
                onChange={(e) => project.updateElement(element.id, { width: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Altura (%)</span>
              <input
                type="number"
                min={1}
                value={element.height}
                onChange={(e) => project.updateElement(element.id, { height: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Z (ordem)</span>
              <input type="number" value={element.z} onChange={(e) => project.updateElement(element.id, { z: Number(e.target.value) })} />
            </label>
          </div>
          <p className="modal__hint">X e Y não têm limite — valores negativos ou acima de 100 sangram o elemento para fora do quadro.</p>

          <div className="element-row__zactions">
            <button type="button" className="button" onClick={() => project.bringToFront(element.id)}>
              Trazer para frente
            </button>
            <button type="button" className="button" onClick={() => project.sendToBack(element.id)}>
              Enviar para trás
            </button>
          </div>

          <div className="fade-controls">
            <label className="field field--toggle">
              <input
                type="checkbox"
                checked={element.fadeIn ?? false}
                onChange={(e) => project.updateElement(element.id, { fadeIn: e.target.checked })}
              />
              Fade suave de entrada
            </label>
            <label className="field field--toggle">
              <input
                type="checkbox"
                checked={element.fadeOut ?? false}
                onChange={(e) => project.updateElement(element.id, { fadeOut: e.target.checked })}
              />
              Fade suave de saída (perto do fim)
            </label>
            {(element.fadeIn || element.fadeOut) && (
              <label className="field">
                <span>Duração do fade ({element.fadeMs ?? DEFAULT_FADE_MS}ms)</span>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={50}
                  value={element.fadeMs ?? DEFAULT_FADE_MS}
                  onChange={(e) => project.updateElement(element.id, { fadeMs: Number(e.target.value) })}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </li>
  );
});
