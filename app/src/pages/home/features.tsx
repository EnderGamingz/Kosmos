import {
  ChartPieIcon,
  LinkIcon,
  WindowIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

type Feature = {
  icon: ReactNode;
  description: string;
  label: string;
};

const features: Feature[] = [
  {
    label: 'Performance',
    icon: <ChartPieIcon />,
    description:
      'Kosmos is build with performance in mind allowing for fast navigation, file downloads and uploads',
  },
  {
    label: 'File Sharing',
    icon: <LinkIcon />,
    description:
      'Kosmos allows the sharing of files and folders with public links or other users',
  },
  {
    label: 'Display options',
    icon: <WindowIcon />,
    description:
      'There are a variety of display options to choose from, allowing files to be displayed in different ways',
  },
];

export function Features() {
  return (
    <div className={'space-y-5'}>
      <h2 className={'text-center text-2xl font-semibold text-stone-600'}>
        Features
      </h2>
      <div className={'grid grid-cols-1 gap-5 p-5 md:grid-cols-3'}>
        {features.map(feature => (
          <Feature key={feature.label} {...feature} />
        ))}
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label, description }: Feature) {
  return (
    <div
      className={
        'space-y-2 rounded-xl bg-stone-200/60 p-4 shadow-md outline outline-1 outline-stone-600/20'
      }>
      <div className={'flex items-center gap-2 text-stone-900'}>
        <div
          className={'rounded-full bg-stone-200 p-2 [&_svg]:h-8 [&_svg]:w-8'}>
          {Icon}
        </div>
        <h3 className={'text-2xl font-semibold'}>{label}</h3>
      </div>
      <p className={'text-lg text-stone-600'}>{description}</p>
    </div>
  );
}
