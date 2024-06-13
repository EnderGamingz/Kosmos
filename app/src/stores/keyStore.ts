import { create } from 'zustand';

export type KeyState = {
  shift: boolean;
  actions: {
    toggleShift: (newValue: boolean) => void;
  };
};

export const useKeyStore = create<KeyState>(set => ({
  shift: false,
  actions: {
    toggleShift: (newValue: boolean) => {
      set({ shift: newValue });
    },
  },
}));
