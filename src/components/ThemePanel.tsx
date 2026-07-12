import { observer } from 'mobx-react-lite';
import { useProjectStore } from '../store/projectContext';
import { ColorField } from './ColorField';
import { CollapsiblePanel } from './CollapsiblePanel';
import { CURATED_FONTS } from '../types';

export const ThemePanel = observer(function ThemePanel() {
  const project = useProjectStore();
  const s = project.settings;

  return (
    <CollapsiblePanel title="Tema do projeto">
      <ColorField
        label="Cor de fundo"
        value={s.background}
        allowTransparent
        onChange={(background) => project.updateSettings({ background })}
      />
      <ColorField label="Cor do texto" value={s.textColor} onChange={(textColor) => project.updateSettings({ textColor })} />

      <label className="field">
        <span>Fonte</span>
        <select value={s.fontFamily} onChange={(e) => project.updateSettings({ fontFamily: e.target.value })}>
          {CURATED_FONTS.map((f) => (
            <option key={f.family} value={f.family}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Tamanho da fonte ({s.fontSize}px)</span>
        <input
          type="range"
          min={16}
          max={140}
          value={s.fontSize}
          onChange={(e) => project.updateSettings({ fontSize: Number(e.target.value) })}
        />
      </label>

      <label className="field">
        <span>Duração do quadro ({s.duration}s)</span>
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={s.duration}
          onChange={(e) => project.updateSettings({ duration: Number(e.target.value) })}
        />
      </label>

      <label className="field">
        <span>Duração do fade ({s.transitionMs}ms)</span>
        <input
          type="range"
          min={100}
          max={2000}
          step={50}
          value={s.transitionMs}
          onChange={(e) => project.updateSettings({ transitionMs: Number(e.target.value) })}
        />
      </label>
    </CollapsiblePanel>
  );
});
