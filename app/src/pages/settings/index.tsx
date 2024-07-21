import {
  InformationCircleIcon,
  KeyIcon,
  UserIcon,
  WindowIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { NavLink, Outlet } from 'react-router-dom';
import tw from '@lib/classMerge.ts';

const links = [
  {
    name: 'Account',
    href: '/settings/account',
    icon: UserIcon,
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: KeyIcon,
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: WindowIcon,
  },
  {
    name: 'Kosmos',
    href: '/settings/info',
    icon: InformationCircleIcon,
    bottom: true,
  },
];

export default function Settings() {
  return (
    <div className={'relative flex flex-grow pl-20 md:pl-0'}>
      <motion.aside
        className={tw(
          'border-r border-stone-800/10 py-3 transition-all',
          'absolute left-0 top-0 h-full w-20 px-2 md:h-[unset]',
          'flex flex-col md:relative md:w-[unset] md:px-4',
          '[&_a]:gap-0 [&_a]:transition-all [&_p]:w-0 [&_p]:overflow-hidden',
          'md:[&_a]:gap-3 md:[&_p]:w-full md:[&_p]:overflow-visible',
        )}>
        <h2
          className={
            'pb-0 text-[0] font-light transition-all md:pb-1 md:text-lg'
          }>
          Settings
        </h2>
        <hr
          className={
            'my-1 border-stone-800/10 px-1 opacity-0 transition-opacity md:opacity-100'
          }
        />
        {links.map(link => (
          <NavLink
            to={link.href}
            end
            title={link.name}
            className={({ isActive }) =>
              tw(
                'flex items-center rounded-lg p-2 text-stone-700 transition-all',
                'px-4 text-lg hover:bg-stone-700/5',
                !!link.bottom && 'mt-auto',
                isActive && 'bg-stone-700/5',
              )
            }>
            <link.icon className={'h-8 w-8'} />
            <p>{link.name}</p>
          </NavLink>
        ))}
      </motion.aside>
      <div
        className={
          'h-full max-h-[calc(100dvh-90px)] flex-grow overflow-y-auto p-5'
        }>
        <div className={'mx-auto max-w-4xl'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
