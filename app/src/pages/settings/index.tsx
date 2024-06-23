import { WindowIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link, Route, Routes } from 'react-router-dom';
import tw from '@lib/classMerge.ts';
import Preferences from '@pages/settings/preferences';
import { Tooltip } from '@nextui-org/react';

const links = [
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: WindowIcon,
  },
];

export default function Settings() {
  return (
    <div className={'relative flex flex-grow pl-20 md:pl-0'}>
      <motion.aside
        className={tw(
          'peer border-r border-stone-800/10 py-3 transition-all',
          'absolute left-0 top-0 h-full w-20 px-2 md:h-[unset]',
          'md:relative md:w-[unset] md:px-4',
          '[&_a]:gap-0 [&_a]:transition-all [&_p]:w-0 [&_p]:overflow-hidden',
          'md:[&_a]:gap-3 md:[&_p]:w-full md:[&_p]:overflow-visible',
        )}>
        <h2
          className={
            'pb-0 text-center text-[0] font-[350] transition-all md:pb-2 md:text-lg'
          }>
          Kosmos Settings
        </h2>
        <hr
          className={
            'my-1 border-stone-800/10 px-1 opacity-0 transition-opacity md:opacity-100'
          }
        />
        {links.map(link => (
          <Tooltip
            key={link.name}
            content={link.name}
            placement={'right'}
            className={'block md:hidden'}>
            <Link
              to={link.href}
              className={tw(
                'flex items-center rounded-lg p-2 text-stone-700 transition-all',
                'px-4 text-lg hover:bg-stone-700/5',
                'peer-hover:bg-red-700 peer-hover:text-stone-100',
              )}>
              <link.icon className={'h-8 w-8'} />
              <p>{link.name}</p>
            </Link>
          </Tooltip>
        ))}
      </motion.aside>
      <div className={'mx-auto max-w-4xl flex-grow p-5'}>
        <Routes>
          <Route path={'preferences'} element={<Preferences />} />
        </Routes>
      </div>
    </div>
  );
}
