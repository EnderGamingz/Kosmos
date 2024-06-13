import { create } from 'zustand';

export type FolderState = {
  selectedFolder?: string;
  actions: {
    selectFolder: (current?: string) => void;
  };
  sidenav: {
    open: boolean;
    toggle: () => void;
  };
};

export const useFolderStore = create<FolderState>(set => ({
  selectedFolder: undefined,
  actions: {
    selectFolder: (current?: string) => {
      set({ selectedFolder: current });
    },
  },
  sidenav: {
    open: false,
    toggle: () => {
      set(state => ({
        sidenav: { ...state.sidenav, open: !state.sidenav.open },
      }));
    },
  },
}));
