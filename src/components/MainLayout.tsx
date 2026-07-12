import { Stage } from './Stage';
import { Transport } from './Transport';
import { ThemePanel } from './ThemePanel';
import { ScriptSplitter } from './ScriptSplitter';
import { SlideList } from './SlideList';

export function MainLayout() {
  return (
    <div className="main-layout">
      <div className="stage-column">
        <Stage />
        <Transport />
      </div>
      <div className="side-column">
        <ThemePanel />
        <ScriptSplitter />
        <SlideList />
      </div>
    </div>
  );
}
