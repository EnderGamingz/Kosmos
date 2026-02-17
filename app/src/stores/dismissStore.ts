import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import merge from 'lodash.merge';
import { HardDrive, MessageCircleWarning } from 'lucide-react';
import type { Icon } from '@/types/icon.ts';

export enum Dismiss {
  StorageLimit = 'storage_limit',
  SystemMessage = 'system_message',
}

type DismissItem = {
  id: Dismiss;
  icon: Icon;
  name: string;
  dismissed: boolean;
};

const dismissible: DismissItem[] = [
  {
    id: Dismiss.SystemMessage,
    icon: MessageCircleWarning,
    name: 'System Message',
    dismissed: false,
  },
  {
    id: Dismiss.StorageLimit,
    icon: HardDrive,
    name: 'Storage Limit Warning',
    dismissed: false,
  },
];

export type DismissState = {
  dismissible: DismissItem[];
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
      dismissible,
      isDismissed: (id: Dismiss) =>
        get().dismissible.find(x => x.id === id)?.dismissed || false,
      getDismissed: () => {
        return get().dismissible.filter(x => x.dismissed);
      },
      actions: {
        dismiss: (id: Dismiss) => {
          set({
            dismissible: get().dismissible.map(x =>
              x.id === id ? { ...x, dismissed: true } : x,
            ),
          });
        },
        reset: (id: Dismiss) => {
          set({
            dismissible: get().dismissible.map(x =>
              x.id === id ? { ...x, dismissed: false } : x,
            ),
          });
        },
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
