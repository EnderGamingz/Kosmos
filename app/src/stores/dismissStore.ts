import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HardDrive, MessageCircleWarning } from 'lucide-react';

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
  dismiss: (id: Dismiss) => void;
  reset: (id: Dismiss) => void;
};

export const useDismissStore = create<DismissState>()(
  persist(
    (set, get) => ({
      dismissed: [],
      isDismissed: (id: Dismiss) => get().dismissed.some(x => x === id),
      getDismissed: () =>
        get().dismissed.map(id => dismissible.find(x => x.id === id)!),
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
    }),
    {
      name: 'kosmos.dismiss',
      version: 1,
      // biome-ignore lint/suspicious/noExplicitAny: Type of persisted state is unknown
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          console.log('[kosmos.dismiss] Version 0 -> 1');
          // In version 0 the dismissed items were stored in full in the state, now we only store the ids
          const dismissedIds = persistedState.dismissible.map(
            // biome-ignore lint/suspicious/noExplicitAny: Type of persisted state is unknown
            (item: any) => item.id,
          );
          persistedState.dismissed = Array.from(
            new Set(dismissedIds),
          ) as Dismiss[];
          delete persistedState.dismissible;
        }

        return persistedState;
      },
    },
  ),
);
