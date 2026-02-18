import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import createDeepMerge from '@fastify/deepmerge';

const deepMerge = createDeepMerge({ all: true });

export enum ExplorerDisplay {
  Mobile,
  Table,
  StaticGrid,
  DynamicGrid,
  Album,
}

export const mobileListIgnoreTypes = [ExplorerDisplay.Album];

export function isTypeIgnoredForMobile(type: ExplorerDisplay) {
  return mobileListIgnoreTypes.includes(type);
}

export function getExplorerDisplay(type: ExplorerDisplay) {
  switch (type) {
    case ExplorerDisplay.Album:
      return 'Album';
    case ExplorerDisplay.Table:
      return 'Table';
    case ExplorerDisplay.StaticGrid:
      return 'Static Grid';
    case ExplorerDisplay.DynamicGrid:
      return 'Dynamic Grid';
    case ExplorerDisplay.Mobile:
      return 'Mobile';
  }
}

export enum ExplorerLoading {
  Table,
  Grid,
}

export function getExplorerLoading(type: ExplorerLoading) {
  switch (type) {
    case ExplorerLoading.Table:
      return 'Table';
    case ExplorerLoading.Grid:
      return 'Grid';
  }
}

export enum DetailType {
  Default,
  Compact,
  Hidden,
}

export function getDetailType(type: DetailType) {
  switch (type) {
    case DetailType.Default:
      return 'Default';
    case DetailType.Compact:
      return 'Compact';
    case DetailType.Hidden:
      return 'Hidden';
  }
}

type DisplayType = {
  type: ExplorerDisplay;
  details: DetailType;
  setType: (type: ExplorerDisplay) => void;
  setDetails: (details: DetailType) => void;
};

type LoadingType = {
  type: ExplorerLoading;
  setType: (type: ExplorerLoading) => void;
};

export enum Unit {
  SI,
  IEC,
}

export type UnitType = {
  type: Unit;
  setType: (type: Unit) => void;
};

export enum Theme {
  Light,
  Dark,
}

export type ThemeType = {
  type: Theme;
  setType: (type: Theme) => void;
};

export enum MobileViewType {
  Enabled,
  Disabled,
}

export type MobileView = {
  type: MobileViewType;
  setEnabled: (enabled: MobileViewType) => void;
};

export function getMobileView(type: MobileViewType) {
  switch (type) {
    case MobileViewType.Enabled:
      return 'Enabled';
    case MobileViewType.Disabled:
      return 'Disabled';
  }
}

export type PreferenceState = {
  loading: LoadingType;
  imageOnly: DisplayType;
  mixed: DisplayType;
  unit: UnitType;
  theme: ThemeType;
  mobileView: MobileView;
};

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      theme: {
        type: Theme.Light,
        setType: (type: Theme) =>
          set({
            theme: { ...get().theme, type },
          }),
      },
      unit: {
        type: Unit.SI,
        setType: (type: Unit) =>
          set({
            unit: { ...get().unit, type },
          }),
      },
      loading: {
        type: ExplorerLoading.Table,
        setType: (type: ExplorerLoading) =>
          set({
            loading: { ...get().loading, type },
          }),
      },
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
      mobileView: {
        type: MobileViewType.Enabled,
        setEnabled: (type: MobileViewType) =>
          set({
            mobileView: { ...get().mobileView, type },
          }),
      },
    }),
    {
      name: 'kosmos.preference',
      merge: (persistedState, currentState) =>
        deepMerge(currentState, persistedState) as never,
    },
  ),
);
