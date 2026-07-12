import { Stage } from './Stage';
import { Transport } from './Transport';
import { ThemePanel } from './ThemePanel';
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
        <SlideList />
      </div>
    </div>
  );
}
