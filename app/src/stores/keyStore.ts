import { create } from 'zustand';

export type KeyState = {
  shift: boolean;
  ctrl: boolean;
  actions: {
    toggleShift: (newValue: boolean) => void;
    toggleCtrl: (newValue: boolean) => void;
  };
};

export const useKeyStore = create<KeyState>(set => ({
  shift: false,
  ctrl: false,
  actions: {
    toggleShift: (newValue: boolean) => {
      set({ shift: newValue });
    },
    toggleCtrl: (newValue: boolean) => {
      set({ ctrl: newValue });
    },
  },
}));
