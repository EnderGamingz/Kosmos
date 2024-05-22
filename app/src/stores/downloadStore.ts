import { create } from 'zustand';

export enum DownloadStatus {
  INITIATED,
  PROGRESS,
  FINISHED,
  FAILED,
}

export interface DownloadItem {
  id: string;
  name: string;
  description?: string;
  status: DownloadStatus;
}

export interface DownloadState {
  items: DownloadItem[];
  actions: {
    addDownload: (data: DownloadItem) => void;
    updateDownloadStatus: (id: string, status: DownloadStatus) => void;
    updateDownloadTitle: (id: string, newTitle: string) => void;
    removeDownload: (id: string) => void;
  };
}

export const useDownloadState = create<DownloadState>(set => ({
  items: [],
  actions: {
    addDownload: (data: DownloadItem) => {
      set(state => ({
        items: [data, ...state.items],
      }));
    },
    updateDownloadStatus: (id: string, status: DownloadStatus) => {
      set(state => {
        const updatedItems = state.items.map(item => {
          if (item.id === id) {
            return { ...item, status };
          }
          return item;
        });
        return { items: updatedItems };
      });
    },
    updateDownloadTitle: (id: string, newTitle: string) => {
      set(state => {
        const updatedItems = state.items.map(item => {
          if (item.id === id) {
            return { ...item, name: newTitle };
          }
          return item;
        });
        return { items: updatedItems };
      });
    },
    removeDownload: (id: string) => {
      set(state => ({
        items: state.items.filter(item => item.id !== id),
      }));
    },
  },
}));
