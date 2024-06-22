import { create } from 'zustand';

export type KeyState = {
  keys: {
    shift: boolean;
    ctrl: boolean;
  };
  actions: {
    toggleShift: (newValue: boolean) => void;
    toggleCtrl: (newValue: boolean) => void;
  };
};

export const useKeyStore = create<KeyState>(set => ({
  keys: {
    shift: false,
    ctrl: false,
  },
  actions: {
    toggleShift: (newValue: boolean) => {
      set(state => {
        return {
          ...state,
          keys: {
            ...state.keys,
            shift: newValue,
          },
        };
      });
    },
    toggleCtrl: (newValue: boolean) => {
      set(state => {
        return {
          ...state,
          keys: {
            ...state.keys,
            ctrl: newValue,
          },
        };
      });
    },
  },
}));
