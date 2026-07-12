import { Stage } from './Stage';
import { Transport } from './Transport';
import { ThemePanel } from './ThemePanel';
import { ElementsPanel } from './ElementsPanel';

export function MainLayout() {
  return (
    <div className="main-layout">
      <div className="stage-column">
        <Stage />
        <Transport />
      </div>
      <div className="side-column">
        <ThemePanel />
        <ElementsPanel />
      </div>
    </div>
  );
}
