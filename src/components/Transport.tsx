import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Controla o loop de reprodução dentro do navegador: qual slide está
 * visível, quando trocar, quando disparar o fade — via CSS transitions no
 * <Stage>, não desenho manual de frames (isso é exclusivo do ExportRenderer). */
export const Transport = observer(function Transport() {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const generationRef = useRef(0);

  const slides = project.slides;
  const total = slides.length;

  async function handlePlay() {
    if (total === 0) return;
    const myGeneration = ++generationRef.current;
    const stillCurrent = () => generationRef.current === myGeneration;

    playback.play(total);
    playback.setIndex(0);
    await wait(project.settings.transitionMs); // fade-in inicial solitário
    if (!stillCurrent()) return;

    for (let i = 0; i < total; i++) {
      if (!stillCurrent()) return;
      playback.setIndex(i);
      await wait(slides[i].duration * 1000); // hold
      if (!stillCurrent()) return;
      if (i < total - 1) {
        playback.setIndex(i + 1); // crossfade compartilhado
      } else {
        playback.setIndex(-1); // fade-out final solitário
      }
      await wait(project.settings.transitionMs);
      if (!stillCurrent()) return;
    }

    playback.stop();
  }

  function handleStop() {
    generationRef.current++;
    playback.stop();
  }

  const displayIndex = total === 0 ? 0 : Math.min(playback.currentIndex, total - 1) + 1;

  return (
    <div className="transport">
      <button type="button" className="transport__button" onClick={handlePlay} disabled={playback.isPlaying || total === 0}>
        ▶ Reproduzir
      </button>
      <button type="button" className="transport__button" onClick={handleStop} disabled={!playback.isPlaying}>
        ■ Parar
      </button>
      <span className="transport__counter">
        {total === 0 ? 'Nenhum slide' : `Slide ${displayIndex} de ${total}`}
      </span>
    </div>
  );
});
