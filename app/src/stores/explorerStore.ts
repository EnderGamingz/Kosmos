import { create } from 'zustand';
import { ShareOperationType } from '@models/file.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';

export type SelectedResources = {
  selectedFolders: FolderModelDTO[];
  selectedFiles: FileModelDTO[];
  selectFolder: (folder: FolderModelDTO) => void;
  selectFile: (file: FileModelDTO) => void;
  selectNone: () => void;
  unselect: (ids: string[]) => void;
};

export type ExplorerState = {
  current: {
    folder?: string;
    selectedFileIndex?: number;
    selectCurrentFile: (current?: number) => void;
    selectCurrentFolder: (current?: string) => void;
    filesInScope: FileModelDTO[];
    setFilesInScope: (current: FileModelDTO[]) => void;
  };
  share: {
    shareElementId?: string;
    shareElementType?: ShareOperationType;
    setShareElement: (id: string, type: ShareOperationType) => void;
    clearShareElement: () => void;
  };
  selectedResources: SelectedResources;
  dragMove: {
    destination?: string;
    setDestination: (destination?: string) => void;
  };
  display: {
    height: number;
    setHeight: (height: number) => void;
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
    setFilesInScope: (current: FileModelDTO[]) => {
      set(prev => ({
        current: {
          ...prev.current,
          filesInScope: current,
        },
      }));
    },
  },
  share: {
    setShareElement: (id: string, type: ShareOperationType) => {
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
    selectFolder: (folder: FolderModelDTO) => {
      set(prev => ({
        selectedResources: {
          ...prev.selectedResources,
          selectedFolders: prev.selectedResources.selectedFolders
            .map(folder => folder.id)
            .includes(folder.id)
            ? prev.selectedResources.selectedFolders.filter(
                x => x.id !== folder.id,
              )
            : [...prev.selectedResources.selectedFolders, folder],
        },
      }));
    },
    selectFile: (file: FileModelDTO) => {
      set(prev => ({
        selectedResources: {
          ...prev.selectedResources,
          selectedFiles: prev.selectedResources.selectedFiles
            .map(file => file.id)
            .includes(file.id)
            ? prev.selectedResources.selectedFiles.filter(x => x.id !== file.id)
            : [...prev.selectedResources.selectedFiles, file],
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
            x => !ids.includes(x.id),
          ),
          selectedFolders: prev.selectedResources.selectedFolders.filter(
            x => !ids.includes(x.id),
          ),
        },
      }));
    },
  },
  display: {
    height: 0,
    setHeight: (height: number) => {
      set(prev => ({
        display: {
          ...prev.display,
          height,
        },
      }));
    },
  },
}));
