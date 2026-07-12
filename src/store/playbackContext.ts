import { createContext, useContext } from 'react';
import { PlaybackStore } from './PlaybackStore';

export const PlaybackStoreContext = createContext<PlaybackStore | null>(null);

export function usePlaybackStore(): PlaybackStore {
  const store = useContext(PlaybackStoreContext);
  if (!store) throw new Error('usePlaybackStore must be used within PlaybackStoreProvider');
  return store;
}
