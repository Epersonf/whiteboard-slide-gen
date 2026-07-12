import { observer } from 'mobx-react-lite';
import { useRef, type ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { usePlaybackStore } from '../store/playbackContext';

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const AddSlideButtons = observer(function AddSlideButtons() {
  const project = useProjectStore();
  const playback = usePlaybackStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addText() {
    const slide = project.newTextSlide();
    project.addSlide(slide);
    playback.setIndex(project.slides.length - 1);
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const src = await readAsDataURL(file);
    const slide = project.newImageSlide(src);
    project.addSlide(slide);
    playback.setIndex(project.slides.length - 1);
  }

  return (
    <div className="add-slide-buttons">
      <button type="button" className="button" onClick={addText}>
        + Texto
      </button>
      <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
        + Imagem
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
});
