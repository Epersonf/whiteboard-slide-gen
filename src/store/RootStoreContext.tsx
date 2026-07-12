import { createContext, useContext, useState, type ReactNode } from 'react';
import { ProjectStore } from './ProjectStore';

const ProjectStoreContext = createContext<ProjectStore | null>(null);

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new ProjectStore());
  return <ProjectStoreContext.Provider value={store}>{children}</ProjectStoreContext.Provider>;
}

export function useProjectStore(): ProjectStore {
  const store = useContext(ProjectStoreContext);
  if (!store) throw new Error('useProjectStore must be used within ProjectStoreProvider');
  return store;
}
