import { create } from 'zustand';
import { DataOperationType, FileModel } from '@models/file.ts';

export type SelectedResources = {
  selectedFolders: string[];
  selectedFiles: string[];
  selectFolder: (id: string) => void;
  selectFile: (id: string) => void;
  selectNone: () => void;
  unselect: (ids: string[]) => void;
};

export type ExplorerState = {
  current: {
    folder?: string;
    selectedFileIndex?: number;
    selectCurrentFile: (current?: number) => void;
    selectCurrentFolder: (current?: string) => void;
    filesInScope: FileModel[];
    setFilesInScope: (current: FileModel[]) => void;
  };
  share: {
    shareElementId?: string;
    shareElementType?: DataOperationType;
    setShareElement: (id: string, type: DataOperationType) => void;
    clearShareElement: () => void;
  };
  selectedResources: SelectedResources;
  dragMove: {
    destination?: string;
    setDestination: (destination?: string) => void;
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
    filesInScope: [],
    setFilesInScope: (current: FileModel[]) => {
      set(prev => ({
        current: {
          ...prev.current,
          filesInScope: current,
        },
      }));
    },
  },
  share: {
    setShareElement: (id: string, type: DataOperationType) => {
      set(prev => ({
        share: {
          ...prev.share,
          shareElementId: id,
          shareElementType: type,
        },
      }));
    },
    clearShareElement: () => {
      set(prev => ({
        share: {
          ...prev.share,
          shareElementId: undefined,
          shareElementType: undefined,
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
    unselect: (ids: string[]) => {
      set(prev => ({
        selectedResources: {
          ...prev.selectedResources,
          selectedFiles: prev.selectedResources.selectedFiles.filter(
            x => !ids.includes(x),
          ),
          selectedFolders: prev.selectedResources.selectedFolders.filter(
            x => !ids.includes(x),
          ),
        },
      }));
    },
  },
}));
