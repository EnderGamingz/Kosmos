import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { merge } from 'lodash';

export enum Dismiss {
  StorageLimit = 'storage_limit',
}

type DismissItem = {
  id: string;
  dismissed: boolean;
};

export type DismissState = {
  dismissible: {
    [id: string]: DismissItem;
  };
  isDismissed: (id: Dismiss) => boolean;
  actions: {
    dismiss: (id: Dismiss) => void;
    reset: (id: Dismiss) => void;
  };
};

export const useDismissStore = create<DismissState>()(
  persist(
    (set, get) => ({
      dismissible: {},
      isDismissed: (id: Dismiss) => {
        return get().dismissible?.[id]?.dismissed;
      },
      actions: {
        dismiss: (id: Dismiss) => {
          set(state => ({
            dismissible: {
              ...state.dismissible,
              [id]: {
                ...state.dismissible[id],
                dismissed: true,
              },
            },
          }));
        },
        reset: (id: Dismiss) =>
          set(state => ({
            dismissible: {
              ...state.dismissible,
              [id]: {
                ...state.dismissible[id],
                dismissed: false,
              },
            },
          })),
      },
    }),
    {
      name: 'kosmos.dismiss',
      merge: (persistedState, currentState) => {
        // Needed to persist nested functions
        return merge({}, currentState, persistedState);
      },
    },
  ),
);
