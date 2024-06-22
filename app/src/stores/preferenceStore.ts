import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum ExplorerDisplay {
  Table,
  StaticGrid,
  DynamicGrid,
}

export enum ExplorerLoading {
  Table,
  Grid,
}

export type PreferenceState = {
  explorerDisplay: {
    loading: ExplorerLoading;
    imageOnly: {
      type: ExplorerDisplay;
      compact: boolean;
      imageOnly: boolean;
    };
    mixed: {
      type: ExplorerDisplay;
      compact: boolean;
    };
  };
};

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      explorerDisplay: {
        loading: ExplorerLoading.Table,
        imageOnly: {
          type: ExplorerDisplay.Table,
          compact: false,
          imageOnly: false,
        },
        mixed: {
          type: ExplorerDisplay.Table,
          compact: false,
        },
      },
    }),
    {
      name: 'preference',
    },
  ),
);
