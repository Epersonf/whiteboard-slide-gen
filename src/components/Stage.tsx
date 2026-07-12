import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { resolveSlideBackground, resolveTextElementStyle } from '../lib/resolveStyle';
import { textPadding } from '../lib/layout';
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
      <div className="stage__canvas" style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})` }}>
        {project.slides.map((slide, index) => {
          const background = resolveSlideBackground(slide, project.settings);
          const visible = index === clampedIndex;
          const sorted = [...slide.elements].sort((a, b) => a.z - b.z);
          return (
            <div
              key={slide.id}
              className="stage__layer"
              style={{
                opacity: visible ? 1 : 0,
                transition: transitionCss,
                background: background === TRANSPARENT ? 'transparent' : background,
              }}
            >
              {sorted.map((element) => (
                <div
                  key={element.id}
                  className="stage__element"
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.width}%`,
                    height: `${element.height}%`,
                    zIndex: element.z,
                  }}
                >
                  {element.type === 'image' ? (
                    <img src={element.src} alt="" className="stage__image" style={{ objectFit: element.fit ?? 'contain' }} />
                  ) : (
                    (() => {
                      const style = resolveTextElementStyle(element, project.settings);
                      return (
                        <div
                          className="stage__text"
                          style={{
                            padding: textPadding(style.fontSize),
                            color: style.color,
                            fontFamily: style.fontFamily,
                            fontSize: style.fontSize,
                            lineHeight: 1.35,
                            justifyContent: style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center',
                          }}
                        >
                          <div className="stage__text-inner" style={{ textAlign: style.align }}>
                            {element.content}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              ))}
            </div>
          );
        })}
        {project.slides.length === 0 && <div className="stage__empty">Adicione um slide para começar</div>}
      </div>
    </div>
  );
});
