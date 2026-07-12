import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { TextElementFields, ImageElementFields } from './SlideItemControls';
import type { Slide, SlideElement } from '../types';

function snippet(element: SlideElement): string {
  if (element.type === 'text') return element.content.trim().slice(0, 40) || '(vazio)';
  return 'Imagem';
}

export const SlideElementRow = observer(function SlideElementRow({ slide, element }: { slide: Slide; element: SlideElement }) {
  const project = useProjectStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="element-row">
      <div className="element-row__header">
        <button type="button" className="element-row__toggle" onClick={() => setExpanded((v) => !v)}>
          <span className="element-row__type">{element.type === 'text' ? 'Texto' : 'Imagem'}</span>
          <span className="element-row__snippet">{snippet(element)}</span>
        </button>
        <div className="element-row__actions">
          <button type="button" aria-label="Duplicar elemento" onClick={() => project.duplicateElement(slide.id, element.id)}>⧉</button>
          <button type="button" aria-label="Remover elemento" onClick={() => project.removeElement(slide.id, element.id)}>✕</button>
          <button type="button" aria-label={expanded ? 'Recolher elemento' : 'Expandir elemento'} onClick={() => setExpanded((v) => !v)}>
            {expanded ? '︿' : '﹀'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="element-row__body">
          {element.type === 'text' ? (
            <TextElementFields slideId={slide.id} element={element} />
          ) : (
            <ImageElementFields slideId={slide.id} element={element} />
          )}

          <div className="position-grid">
            <label className="field">
              <span>X (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={element.x}
                onChange={(e) => project.updateElement(slide.id, element.id, { x: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Y (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={element.y}
                onChange={(e) => project.updateElement(slide.id, element.id, { y: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Largura (%)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={element.width}
                onChange={(e) => project.updateElement(slide.id, element.id, { width: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Altura (%)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={element.height}
                onChange={(e) => project.updateElement(slide.id, element.id, { height: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Z (ordem)</span>
              <input
                type="number"
                value={element.z}
                onChange={(e) => project.updateElement(slide.id, element.id, { z: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="element-row__zactions">
            <button type="button" className="button" onClick={() => project.bringToFront(slide.id, element.id)}>
              Trazer para frente
            </button>
            <button type="button" className="button" onClick={() => project.sendToBack(slide.id, element.id)}>
              Enviar para trás
            </button>
          </div>
        </div>
      )}
    </li>
  );
});
