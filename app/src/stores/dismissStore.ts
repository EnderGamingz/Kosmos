import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HardDrive, MessageCircleWarning } from 'lucide-react';
import createDeepMerge from '@fastify/deepmerge';

const deepMerge = createDeepMerge({ all: true });

export enum Dismiss {
  StorageLimit = 'storage_limit',
  SystemMessage = 'system_message',
}

export const dismissIcons = {
  [Dismiss.StorageLimit]: HardDrive,
  [Dismiss.SystemMessage]: MessageCircleWarning,
};

type DismissItem = {
  id: Dismiss;
  name: string;
};

export const dismissible: DismissItem[] = [
  {
    id: Dismiss.SystemMessage,
    name: 'System Message',
  },
  {
    id: Dismiss.StorageLimit,
    name: 'Storage Limit Warning',
  },
];

export type DismissState = {
  dismissed: Dismiss[];
  isDismissed: (id: Dismiss) => boolean;
  getDismissed: () => DismissItem[];
  actions: {
    dismiss: (id: Dismiss) => void;
    reset: (id: Dismiss) => void;
  };
};

export const useDismissStore = create<DismissState>()(
  persist(
    (set, get) => ({
      dismissed: [],
      isDismissed: (id: Dismiss) => get().dismissed.some(x => x === id),
      getDismissed: () =>
        get().dismissed.map(id => dismissible.find(x => x.id === id)!),
      actions: {
        dismiss: (id: Dismiss) => {
          set({
            dismissed: [...get().dismissed, id],
          });
        },
        reset: (id: Dismiss) => {
          set({
            dismissed: get().dismissed.filter(x => x !== id),
          });
        },
      },
    }),
    {
      name: 'kosmos.dismiss',
      merge: (persistedState, currentState) =>
        deepMerge(currentState, persistedState) as never,
    },
  ),
);
