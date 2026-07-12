import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { ExportDialog } from './ExportDialog';

export const Topbar = observer(function Topbar() {
  const project = useProjectStore();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <header className="topbar">
      <span className="topbar__brand">whiteboard-slide-gen</span>
      <input
        className="topbar__name"
        value={project.name}
        onChange={(e) => project.setName(e.target.value)}
        aria-label="Nome do projeto"
      />
      <button type="button" className="button button--primary" onClick={() => setExportOpen(true)} disabled={project.slides.length === 0}>
        Exportar
      </button>
      {exportOpen && <ExportDialog onClose={() => setExportOpen(false)} />}
    </header>
  );
});
