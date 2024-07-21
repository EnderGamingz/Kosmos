import ApplicationIcon from '@components/defaults/icon.tsx';
import { Link } from 'react-router-dom';
import { CloudIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import { BUILD_ID } from '@lib/env.ts';
import { Tooltip } from '@nextui-org/react';

const links = [
  {
    name: 'Source',
    href: 'https://git.flouet.com/philipp.hergenhahn/kosmos',
    icon: CloudIcon,
  },
];

export default function AppInfo() {
  return (
    <div className={'space-y-2 p-4 md:p-10'}>
      <div className={'flex items-center gap-3 text-stone-700'}>
        <ApplicationIcon className={'h-12 w-12 md:h-16 md:w-16'} />
        <h2 className={'text-2xl font-semibold md:text-5xl'}>Kosmos</h2>
      </div>
      <p className={'italic'}>High performance file hosting platform</p>
      <ul className={'py-5'}>
        {links.map(link => (
          <li key={link.name} className={'flex items-center gap-2'}>
            <link.icon className={'h-6 w-6'} />
            {link.name}:{' '}
            <Link
              to={link.href}
              target={'_blank'}
              className={
                'w-0 flex-grow truncate text-stone-600 hover:underline'
              }>
              {link.href}
            </Link>
          </li>
        ))}
      </ul>
      <div className={'flex flex-wrap items-center gap-5 text-stone-500'}>
        <p>
          © {new Date().getFullYear()}{' '}
          <Link to={'https://setilic.com'} target={'_blank'}>
            Setilic
          </Link>
        </p>
        {BUILD_ID && (
          <Tooltip content={'Build ID'}>
            <div className={'flex items-center gap-2'}>
              <FingerPrintIcon className={'h-5 w-5'} />
              {BUILD_ID}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
