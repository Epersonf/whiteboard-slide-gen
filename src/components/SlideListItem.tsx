import { observer } from 'mobx-react-lite';
import { useRef, useState, type ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { ColorField } from './ColorField';
import { SlideElementRow } from './SlideElementRow';
import type { Slide } from '../types';

function snippet(slide: Slide): string {
  const text = slide.elements.find((el) => el.type === 'text');
  if (text) return text.content.trim().slice(0, 60) || '(vazio)';
  const images = slide.elements.filter((el) => el.type === 'image').length;
  if (images > 0) return images === 1 ? 'Imagem' : `${images} imagens`;
  return '(slide vazio)';
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const SlideListItem = observer(function SlideListItem({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = playback.currentIndex === index;
  const bgOverridden = slide.background !== undefined;

  function selectThis() {
    playback.setIndex(index);
  }

  function addText() {
    project.addElement(slide.id, project.newTextElement(slide));
  }

  async function handleAddImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const src = await readAsDataURL(file);
    project.addElement(slide.id, project.newImageElement(slide, src));
  }

  return (
    <li className={`slide-item ${isActive ? 'slide-item--active' : ''}`}>
      <div className="slide-item__header">
        <button type="button" className="slide-item__select" onClick={selectThis}>
          <span className="slide-item__badge">{index + 1}</span>
          <span className="slide-item__snippet">{snippet(slide)}</span>
        </button>
        <div className="slide-item__actions">
          <button type="button" aria-label="Mover para cima" disabled={index === 0} onClick={() => project.moveSlide(slide.id, -1)}>▲</button>
          <button type="button" aria-label="Mover para baixo" disabled={index === total - 1} onClick={() => project.moveSlide(slide.id, 1)}>▼</button>
          <button type="button" aria-label="Duplicar" onClick={() => project.duplicateSlide(slide.id)}>⧉</button>
          <button type="button" aria-label="Remover" onClick={() => project.removeSlide(slide.id)}>✕</button>
          <button type="button" aria-label={expanded ? 'Recolher controles' : 'Expandir controles'} onClick={() => setExpanded((v) => !v)}>
            {expanded ? '︿' : '﹀'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="slide-item__controls">
          <label className="field">
            <span>Duração ({slide.duration}s)</span>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={slide.duration}
              onChange={(e) => project.updateSlide(slide.id, { duration: Number(e.target.value) })}
            />
          </label>

          <label className="field field--toggle">
            <input
              type="checkbox"
              checked={bgOverridden}
              onChange={(e) =>
                project.updateSlide(slide.id, { background: e.target.checked ? project.settings.background : undefined })
              }
            />
            Personalizar cor de fundo deste slide
          </label>
          {bgOverridden && (
            <ColorField
              label="Fundo do slide"
              value={slide.background ?? project.settings.background}
              allowTransparent
              onChange={(background) => project.updateSlide(slide.id, { background })}
            />
          )}

          <div className="slide-item__elements">
            <h3 className="slide-item__elements-title">Elementos ({slide.elements.length})</h3>
            <ul className="element-list">
              {slide.elements.map((element) => (
                <SlideElementRow key={element.id} slide={slide} element={element} />
              ))}
            </ul>
            <div className="add-slide-buttons">
              <button type="button" className="button" onClick={addText}>
                + Texto
              </button>
              <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
                + Imagem
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAddImage} />
            </div>
          </div>
        </div>
      )}
    </li>
  );
});
