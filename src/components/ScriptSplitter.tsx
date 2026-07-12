import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { splitScript } from '../lib/scriptSplitter';

export const ScriptSplitter = observer(function ScriptSplitter() {
  const project = useProjectStore();
  const [text, setText] = useState('');

  function handleSplit() {
    const slides = splitScript(text);
    if (slides.length === 0) return;
    project.appendSlides(slides);
    setText('');
  }

  return (
    <section className="panel">
      <h2 className="panel__title">Roteiro rápido</h2>
      <textarea
        className="script-splitter__textarea"
        placeholder="Cole aqui o roteiro completo. Parágrafos separados por linha em branco viram slides; texto corrido é dividido por frase."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
      />
      <button type="button" className="button" onClick={handleSplit} disabled={!text.trim()}>
        Dividir em slides
      </button>
    </section>
  );
});
