import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Controla o preview de reprodução: fade-in, hold pela duração configurada,
 * fade-out — via CSS transitions no <Stage>, não desenho manual de frames
 * (isso é exclusivo do ExportRenderer). */
export const Transport = observer(function Transport() {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const generationRef = useRef(0);

  async function handlePlay() {
    const myGeneration = ++generationRef.current;
    const stillCurrent = () => generationRef.current === myGeneration;
    const { transitionMs, duration } = project.settings;

    playback.play(); // visible=false, dispara o estado inicial "escondido"
    await wait(20); // deixa o navegador pintar o estado invisível antes de animar pra visível
    if (!stillCurrent()) return;

    playback.setVisible(true); // fade-in
    await wait(transitionMs);
    if (!stillCurrent()) return;

    await wait(duration * 1000); // hold
    if (!stillCurrent()) return;

    playback.setVisible(false); // fade-out
    await wait(transitionMs);
    if (!stillCurrent()) return;

    playback.stop();
  }

  function handleStop() {
    generationRef.current++;
    playback.stop();
  }

  return (
    <div className="transport">
      <button type="button" className="transport__button" onClick={handlePlay} disabled={playback.isPlaying}>
        ▶ Reproduzir
      </button>
      <button type="button" className="transport__button" onClick={handleStop} disabled={!playback.isPlaying}>
        ■ Parar
      </button>
      <span className="transport__counter">Duração: {project.settings.duration}s</span>
    </div>
  );
});
