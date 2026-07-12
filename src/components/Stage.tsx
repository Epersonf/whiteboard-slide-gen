import { observer } from 'mobx-react-lite';
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';
import { resolveTextElementStyle } from '../lib/resolveStyle';
import { textPadding } from '../lib/layout';
import { DEFAULT_FADE_MS, TRANSPARENT } from '../types';

export const Stage = observer(function Stage() {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fadeOverrides, setFadeOverrides] = useState<Record<string, number>>({});

  const { canvasWidth, canvasHeight, transitionMs, duration, background } = project.settings;

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / canvasWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvasWidth]);

  // Fades de entrada/saída por elemento, só durante a reprodução real — em
  // edição o elemento fica sempre visível pra não atrapalhar quem está ajustando.
  useEffect(() => {
    if (!playback.isPlaying) {
      setFadeOverrides({});
      return;
    }
    const holdMs = duration * 1000;
    const initial: Record<string, number> = {};
    for (const el of project.elements) {
      if (el.fadeIn) initial[el.id] = 0;
    }
    setFadeOverrides(initial);

    const raf = requestAnimationFrame(() => {
      setFadeOverrides((prev) => {
        const next = { ...prev };
        for (const el of project.elements) {
          if (el.fadeIn) next[el.id] = 1;
        }
        return next;
      });
    });

    const timers = project.elements
      .filter((el) => el.fadeOut)
      .map((el) => {
        const fadeMs = el.fadeMs ?? DEFAULT_FADE_MS;
        const delay = Math.max(0, holdMs - fadeMs);
        return window.setTimeout(() => {
          setFadeOverrides((prev) => ({ ...prev, [el.id]: 0 }));
        }, delay);
      });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [playback.isPlaying, project.elements, duration]);

  const layerOpacity = playback.isPlaying ? (playback.visible ? 1 : 0) : 1;
  const transitionCss = playback.isPlaying ? `opacity ${transitionMs}ms ease-in-out` : 'none';
  const sorted = [...project.elements].sort((a, b) => a.z - b.z);

  return (
    <div className="stage" ref={outerRef} style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}>
      <div className="stage__checker" aria-hidden="true" />
      <div className="stage__canvas" style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})` }}>
        <div
          className="stage__layer"
          style={{
            opacity: layerOpacity,
            transition: transitionCss,
            background: background === TRANSPARENT ? 'transparent' : background,
          }}
        >
          {sorted.map((element) => {
            const fadeMs = element.fadeMs ?? DEFAULT_FADE_MS;
            const fadeOpacity = fadeOverrides[element.id];
            const elementStyle: CSSProperties = {
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              zIndex: element.z,
            };
            if (fadeOpacity !== undefined) {
              elementStyle.opacity = fadeOpacity;
              elementStyle.transition = `opacity ${fadeMs}ms ease-in-out`;
            }
            const isSelected = playback.selectedElementId === element.id && !playback.isPlaying;
            return (
              <Fragment key={element.id}>
                <div className="stage__element" style={elementStyle}>
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
                            fontWeight: style.fontWeight,
                            fontStyle: style.italic ? 'italic' : 'normal',
                            lineHeight: 1.35,
                            justifyContent: style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center',
                          }}
                        >
                          <div
                            className="stage__text-inner"
                            style={{ textAlign: style.align, textDecoration: style.underline ? 'underline' : 'none' }}
                          >
                            {element.content}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
                {isSelected && (
                  <div
                    className="stage__debug-box"
                    style={{ left: `${element.x}%`, top: `${element.y}%`, width: `${element.width}%`, height: `${element.height}%` }}
                    aria-hidden="true"
                  >
                    <span className="stage__debug-label">
                      {Math.round(element.x)}%, {Math.round(element.y)}% · {Math.round(element.width)}×{Math.round(element.height)}%
                    </span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
        {project.elements.length === 0 && <div className="stage__empty">Adicione um elemento para começar</div>}
      </div>
    </div>
  );
});
