import { useState, type ReactNode } from 'react';
import { ProjectStore } from './ProjectStore';
import { ProjectStoreContext } from './projectContext';

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new ProjectStore());
  return <ProjectStoreContext.Provider value={store}>{children}</ProjectStoreContext.Provider>;
}
