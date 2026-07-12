import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { computeSlideLayout } from '../lib/layout';
import { TRANSPARENT } from '../types';

export const Stage = observer(function Stage() {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { canvasWidth, canvasHeight, transitionMs } = project.settings;

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / canvasWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvasWidth]);

  const clampedIndex = project.slides.length === 0 ? -1 : Math.min(playback.currentIndex, project.slides.length - 1);
  const transitionCss = playback.isPlaying ? `opacity ${transitionMs}ms ease-in-out` : 'none';

  return (
    <div className="stage" ref={outerRef} style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}>
      <div className="stage__checker" aria-hidden="true" />
      <div
        className="stage__canvas"
        style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})` }}
      >
        {project.slides.map((slide, index) => {
          const layout = computeSlideLayout(slide, project.settings, { width: canvasWidth, height: canvasHeight });
          const visible = index === clampedIndex;
          const align = slide.type === 'text' ? (layout.style.align ?? 'center') : 'center';
          return (
            <div
              key={slide.id}
              className="stage__layer"
              style={{
                opacity: visible ? 1 : 0,
                transition: transitionCss,
                background: layout.style.background === TRANSPARENT ? 'transparent' : layout.style.background,
              }}
            >
              {slide.type === 'image' ? (
                <img src={slide.src} alt="" className="stage__image" style={{ objectFit: slide.fit ?? 'contain' }} />
              ) : (
                <div
                  className="stage__text"
                  style={{
                    padding: layout.padding,
                    color: layout.style.color,
                    fontFamily: layout.style.fontFamily,
                    fontSize: layout.style.fontSize,
                    lineHeight: `${layout.lineHeight}px`,
                    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
                  }}
                >
                  <div className="stage__text-inner" style={{ textAlign: align }}>
                    {slide.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {project.slides.length === 0 && <div className="stage__empty">Adicione um slide para começar</div>}
      </div>
    </div>
  );
});
