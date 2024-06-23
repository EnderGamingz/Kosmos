import {
  DetailType,
  ExplorerDisplay,
  ExplorerLoading,
  getDetailType,
  getExplorerDisplay,
  getExplorerLoading,
  PreferenceState,
} from '@stores/preferenceStore.ts';
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ListBulletIcon,
  PhotoIcon,
  RectangleGroupIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

export type ExplorerPreferenceOption = {
  name: string;
  value: number;
  icon?: ReactNode;
};

export type ExplorerPreference = {
  name: string;
  icon: ReactNode;
  type: {
    current: number;
    onChange: (value: number) => void;
    getName: (type: number) => string;
    options: ExplorerPreferenceOption[];
  };
  details?: {
    current: number;
    onChange: (value: number) => void;
    getName: (type: number) => string;
    options: ExplorerPreferenceOption[];
  };
};

export const selections = (pref: PreferenceState): ExplorerPreference[] => [
  {
    name: 'Loading Style',
    icon: <ArrowPathIcon />,
    type: {
      current: pref.loading.type,
      onChange: pref.loading.setType,
      getName: getExplorerLoading,
      options: [
        {
          name: 'Table',
          value: ExplorerLoading.Table,
          icon: <ListBulletIcon />,
        },
        {
          name: 'Grid',
          value: ExplorerLoading.Grid,
          icon: <Square2StackIcon />,
        },
      ],
    },
  },
  {
    name: 'Image Only',
    icon: <PhotoIcon />,
    type: {
      current: pref.imageOnly.type,
      onChange: pref.imageOnly.setType,
      getName: getExplorerDisplay,
      options: [
        {
          name: 'Table',
          value: ExplorerDisplay.Table,
          icon: <ListBulletIcon />,
        },
        {
          name: 'Static Grid',
          value: ExplorerDisplay.StaticGrid,
          icon: <Square2StackIcon />,
        },
        {
          name: 'Dynamic Grid',
          value: ExplorerDisplay.DynamicGrid,
          icon: <RectangleGroupIcon />,
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
    icon: <DocumentDuplicateIcon />,
    type: {
      current: pref.mixed.type,
      onChange: pref.mixed.setType,
      getName: getExplorerDisplay,
      options: [
        {
          name: 'Table',
          value: ExplorerDisplay.Table,
          icon: <ListBulletIcon />,
        },
        {
          name: 'Static Grid',
          value: ExplorerDisplay.StaticGrid,
          icon: <Square2StackIcon />,
        },
        {
          name: 'Dynamic Grid',
          value: ExplorerDisplay.DynamicGrid,
          icon: <RectangleGroupIcon />,
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
