import { create } from 'zustand';

export type ExplorerState = {
  current: {
    folder?: string;
    selectedFileIndex?: number;
    selectCurrentFile: (current?: number) => void;
    selectCurrentFolder: (current?: string) => void;
    fileNames: string[];
    setFileNames: (current: string[]) => void;
  };
  selectedResources: {
    selectedFolders: string[];
    selectedFiles: string[];
    selectFolder: (id: string) => void;
    selectFile: (id: string) => void;
    selectNone: () => void;
  };
  dragMove: {
    destination?: string;
    setDestination: (destination?: string) => void;
  };
  sidenav: {
    open: boolean;
    toggle: () => void;
  };
};

export const useExplorerStore = create<ExplorerState>(set => ({
  current: {
    selectCurrentFile: (current?: number) => {
      set(prev => ({
        current: {
          ...prev.current,
          selectedFileIndex: current,
        },
      }));
    },
    selectCurrentFolder: (current?: string) => {
      set(prev => ({
        current: {
          ...prev.current,
          folder: current,
        },
      }));
    },
    fileNames: [],
    setFileNames: (current: string[]) => {
      set(prev => ({
        current: {
          ...prev.current,
          fileNames: current,
        },
      }));
    },
  },
  dragMove: {
    setDestination: (destination?: string) => {
      set(prev => ({
        dragMove: {
          ...prev.dragMove,
          destination,
        },
      }));
    },
  },
  selectedResources: {
    selectedFiles: [],
    selectedFolders: [],
    selectFolder: (id: string) => {
      set(prev => ({
        selectedResources: {
          ...prev.selectedResources,
          selectedFolders: prev.selectedResources.selectedFolders.includes(id)
            ? prev.selectedResources.selectedFolders.filter(x => x !== id)
            : [...prev.selectedResources.selectedFolders, id],
        },
      }));
    },
    selectFile: (id: string) => {
      set(prev => ({
        selectedResources: {
          ...prev.selectedResources,
          selectedFiles: prev.selectedResources.selectedFiles.includes(id)
            ? prev.selectedResources.selectedFiles.filter(x => x !== id)
            : [...prev.selectedResources.selectedFiles, id],
        },
      }));
    },
    selectNone: () => {
      set(prev => ({
        selectedResources: {
          ...prev.selectedResources,
          selectedFiles: [],
          selectedFolders: [],
        },
      }));
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
