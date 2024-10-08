import { motion } from 'framer-motion';
import { NavLink, Outlet } from 'react-router-dom';
import tw from '@utils/classMerge.ts';
import { links } from '@pages/settings/links.ts';
import { Helmet } from 'react-helmet';

export default function Settings() {
  return (
    <div className={'relative flex flex-grow pl-20 md:pl-0'}>
      <Helmet titleTemplate={'%s | Kosmos Settings'}>
        <title>Settings</title>
      </Helmet>
      <motion.aside
        className={tw(
          'border-r border-stone-800/10 py-3 transition-width',
          'absolute left-0 top-0 h-full w-20 px-2 md:h-[unset]',
          'flex flex-col md:relative md:w-[unset] md:px-4',
          '[&_a]:gap-0 [&_p]:w-0 [&_p]:overflow-hidden',
          'md:[&_a]:gap-3 md:[&_p]:w-full md:[&_p]:overflow-visible',
          'dark:border-stone-300/10 dark:text-stone-300',
        )}>
        <h2 className={'pb-0 text-[0] font-light md:pb-1 md:text-lg'}>
          Settings
        </h2>
        <hr
          className={
            'my-1 border-stone-800/10 px-1 opacity-0 transition-opacity md:opacity-100 dark:border-stone-300/10'
          }
        />
        {links.map(link => (
          <NavLink
            to={link.href}
            key={link.name}
            end
            title={link.name}
            className={({ isActive }) =>
              tw(
                'flex items-center rounded-lg p-2 text-stone-700 transition-all',
                'px-4 text-lg hover:bg-stone-700/5 dark:text-stone-300 dark:hover:bg-stone-300/10',
                !!link.bottom && 'mt-auto',
                isActive && 'bg-stone-700/5 dark:bg-stone-300/5',
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
