import { createContext, useContext } from 'react';
import { ProjectStore } from './ProjectStore';

export const ProjectStoreContext = createContext<ProjectStore | null>(null);

export function useProjectStore(): ProjectStore {
  const store = useContext(ProjectStoreContext);
  if (!store) throw new Error('useProjectStore must be used within ProjectStoreProvider');
  return store;
}
