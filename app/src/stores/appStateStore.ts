import { create } from 'zustand';
import type { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';

export type AppState = {
  headerLinks?: ExplorerLink[];
  clearHeaderLinks: () => void;
  setHeaderLinks: (links: ExplorerLink[]) => void;
};

export const useAppState = create<AppState>(set => ({
  headerLinks: undefined,
  clearHeaderLinks: () => set({ headerLinks: undefined }),
  setHeaderLinks: (links: ExplorerLink[]) => set({ headerLinks: links }),
}));
