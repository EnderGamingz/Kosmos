import {
  DetailType,
  ExplorerDisplay,
  ExplorerLoading,
  getDetailType,
  getExplorerDisplay,
  getExplorerLoading,
  getMobileView,
  MobileViewType,
  type PreferenceState,
} from '@stores/preferenceStore.ts';
import type { ReactNode } from 'react';
import {
  BringToFront,
  CircleEllipsis,
  Files,
  Image,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Proportions,
  TableProperties,
} from 'lucide-react';

export type PreferenceOption = {
  name: string;
  value: number;
  icon?: ReactNode;
  description?: string;
};

export type ExplorerStylePreference = {
  name: string;
  icon: ReactNode;
  type: {
    current: number;
    onChange: (value: number) => void;
    getName: (type: number) => string;
    options: PreferenceOption[];
  };
  details?: {
    current: number;
    onChange: (value: number) => void;
    getName: (type: number) => string;
    options: PreferenceOption[];
  };
};

export const selections = (
  pref: PreferenceState,
): ExplorerStylePreference[] => [
  {
    name: 'Mobile explorer view',
    icon: <Proportions />,
    type: {
      current: pref.mobileView.type,
      onChange: pref.mobileView.setEnabled,
      getName: getMobileView,
      options: [
        {
          name: 'Enabled',
          description: 'Use optimized layout on smaller screens',
          value: MobileViewType.Enabled,
          icon: <LayoutList />,
        },
        {
          name: 'Disabled',
          description: 'Uses selected display type',
          value: MobileViewType.Disabled,
          icon: <BringToFront />,
        },
      ],
    },
  },
  {
    name: 'Loading Style',
    icon: <CircleEllipsis />,
    type: {
      current: pref.loading.type,
      onChange: pref.loading.setType,
      getName: getExplorerLoading,
      options: [
        {
          name: 'Table',
          value: ExplorerLoading.Table,
          icon: <TableProperties />,
        },
        {
          name: 'Grid',
          value: ExplorerLoading.Grid,
          icon: <LayoutGrid />,
        },
      ],
    },
  },
  {
    name: 'Image Only',
    icon: <Image />,
    type: {
      current: pref.imageOnly.type,
      onChange: pref.imageOnly.setType,
      getName: getExplorerDisplay,
      options: [
        {
          name: 'Table',
          value: ExplorerDisplay.Table,
          icon: <TableProperties />,
        },
        /*        {
          name: 'Static Grid',
          value: ExplorerDisplay.StaticGrid,
          icon: <LayoutGrid />,
        },*/
        {
          name: 'Dynamic Grid',
          value: ExplorerDisplay.DynamicGrid,
          icon: <LayoutDashboard />,
        },
      ],
    },
    details: {
      current: pref.imageOnly.details,
      onChange: pref.imageOnly.setDetails,
      getName: getDetailType,
      options: [
        {
          name: 'Comfortable',
          value: DetailType.Default,
        },
        {
          name: 'Compact',
          value: DetailType.Compact,
        },
        {
          name: 'Hidden',
          value: DetailType.Hidden,
        },
      ],
    },
  },
  {
    name: 'Mixed Files',
    icon: <Files />,
    type: {
      current: pref.mixed.type,
      onChange: pref.mixed.setType,
      getName: getExplorerDisplay,
      options: [
        {
          name: 'Table',
          value: ExplorerDisplay.Table,
          icon: <TableProperties />,
        },
        /*        {
          name: 'Static Grid',
          value: ExplorerDisplay.StaticGrid,
          icon: <LayoutGrid />,
        },*/
        {
          name: 'Dynamic Grid',
          value: ExplorerDisplay.DynamicGrid,
          icon: <LayoutDashboard />,
        },
      ],
    },
    details: {
      current: pref.mixed.details,
      onChange: pref.mixed.setDetails,
      getName: getDetailType,
      options: [
        {
          name: 'Comfortable',
          value: DetailType.Default,
        },
        {
          name: 'Compact',
          value: DetailType.Compact,
        },
        {
          name: 'Hidden',
          value: DetailType.Hidden,
        },
      ],
    },
  },
];
