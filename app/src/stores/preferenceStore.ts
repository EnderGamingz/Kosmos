import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { merge } from 'lodash';

export enum ExplorerDisplay {
  Table,
  StaticGrid,
  DynamicGrid,
}

export enum ExplorerLoading {
  Table,
  Grid,
}

export enum DetailType {
  Default,
  Compact,
  Hidden,
}

type DisplayType = {
  type: ExplorerDisplay;
  details: DetailType;
  setType: (type: ExplorerDisplay) => void;
  setDetails: (details: DetailType) => void;
};

export type PreferenceState = {
  loading: ExplorerLoading;
  imageOnly: DisplayType;
  mixed: DisplayType;
};

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      loading: ExplorerLoading.Table,
      imageOnly: {
        type: ExplorerDisplay.Table,
        details: DetailType.Default,
        setType: (type: ExplorerDisplay) =>
          set({
            imageOnly: { ...get().imageOnly, type },
          }),
        setDetails: (details: DetailType) =>
          set({
            imageOnly: { ...get().imageOnly, details },
          }),
      },
      mixed: {
        type: ExplorerDisplay.Table,
        details: DetailType.Default,
        setType: (type: ExplorerDisplay) =>
          set({
            mixed: { ...get().mixed, type },
          }),
        setDetails: (details: DetailType) =>
          set({
            mixed: { ...get().mixed, details },
          }),
      },
    }),
    {
      name: 'kosmos.preference',
      merge: (persistedState, currentState) => {
        // Needed to persist nested functions
        return merge({}, currentState, persistedState);
      },
    },
  ),
);
