import { observer } from 'mobx-react-lite';
import { useRef, type ChangeEvent } from 'react';
import { useProjectStore } from '../store/projectContext';
import { ElementRow } from './ElementRow';

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const ElementsPanel = observer(function ElementsPanel() {
  const project = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addText() {
    project.addElement(project.newTextElement());
  }

  async function handleAddImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const src = await readAsDataURL(file);
    project.addElement(project.newImageElement(src));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Elementos ({project.elements.length})</h2>
      </div>
      <div className="panel__body">
        <ul className="element-list">
          {project.elements.map((element) => (
            <ElementRow key={element.id} element={element} />
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
    </section>
  );
});
