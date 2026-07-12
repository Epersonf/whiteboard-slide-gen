import { useState, type ReactNode } from 'react';
import { PlaybackStore } from './PlaybackStore';
import { PlaybackStoreContext } from './playbackContext';

export function PlaybackStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new PlaybackStore());
  return <PlaybackStoreContext.Provider value={store}>{children}</PlaybackStoreContext.Provider>;
}
