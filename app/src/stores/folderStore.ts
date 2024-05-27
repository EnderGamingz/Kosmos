import { create } from 'zustand';

export type FolderState = {
  selectedFolder?: string;
  actions: {
    selectFolder: (current?: string) => void;
  };
};

export const useFolderStore = create<FolderState>(set => ({
  selectedFolder: undefined,
  actions: {
    selectFolder: (current?: string) => {
      set({ selectedFolder: current });
    },
  },
}));
