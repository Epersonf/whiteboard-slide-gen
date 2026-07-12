import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useProjectStore } from '../store/projectContext';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';

export const Topbar = observer(function Topbar() {
  const project = useProjectStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <header className="topbar">
      <span className="topbar__brand">whiteboard-slide-gen</span>
      <input
        className="topbar__name"
        value={project.name}
        onChange={(e) => project.setName(e.target.value)}
        aria-label="Nome do projeto"
      />
      <button type="button" className="button" onClick={() => setImportOpen(true)}>
        Importar
      </button>
      <button type="button" className="button button--primary" onClick={() => setExportOpen(true)}>
        Exportar
      </button>
      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} />}
      {exportOpen && <ExportDialog onClose={() => setExportOpen(false)} />}
    </header>
  );
});
