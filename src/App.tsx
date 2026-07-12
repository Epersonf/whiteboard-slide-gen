import { ProjectStoreProvider } from './store/RootStoreContext';
import { PlaybackStoreProvider } from './store/PlaybackStoreContext';
import { Topbar } from './components/Topbar';
import { MainLayout } from './components/MainLayout';

function App() {
  return (
    <ProjectStoreProvider>
      <PlaybackStoreProvider>
        <div className="app">
          <Topbar />
          <MainLayout />
        </div>
      </PlaybackStoreProvider>
    </ProjectStoreProvider>
  );
}

export default App;
