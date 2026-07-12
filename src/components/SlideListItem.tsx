import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { ColorField } from './ColorField';
import { TextControls, ImageControls } from './SlideItemControls';
import type { Slide } from '../types';

function snippet(slide: Slide): string {
  if (slide.type === 'text') return slide.content.trim().slice(0, 60) || '(vazio)';
  return 'Imagem';
}

export const SlideListItem = observer(function SlideListItem({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const [expanded, setExpanded] = useState(false);

  const isActive = playback.currentIndex === index;
  const bgOverridden = slide.background !== undefined;

  function selectThis() {
    playback.setIndex(index);
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
          {slide.type === 'text' ? <TextControls slide={slide} /> : <ImageControls slide={slide} />}

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
        </div>
      )}
    </li>
  );
});
