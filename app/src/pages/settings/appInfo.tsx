import ApplicationIcon from '@components/defaults/icon.tsx';
import { Link } from 'react-router-dom';
import { BUILD_ID, BUILD_TAG } from '@lib/env.ts';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { CodeXml, Fingerprint, Tag } from 'lucide-react';

const links = [
  {
    name: 'Source',
    href: 'https://git.flouet.com/philipp.hergenhahn/kosmos',
    icon: CodeXml,
  },
];

export function BuildIdDisplay() {
  return (
    <>
      {BUILD_ID && (
        <div
          title={'Build ID'}
          className={'flex items-center gap-1 text-sm font-light'}
        >
          <Fingerprint className={'h-5 w-5'} />
          {BUILD_ID}
        </div>
      )}
    </>
  );
}

export function BuildTagDisplay({ noIcon }: { noIcon?: boolean }) {
  return (
    <>
      {BUILD_TAG && (
        <div
          title={'Build Tag'}
          className={'flex items-center gap-1 text-sm font-light'}
        >
          {!noIcon && <Tag className={'h-5 w-5'} />} {BUILD_TAG}
        </div>
      )}
    </>
  );
}

export default function AppInfo() {
  return (
    <div className={'space-y-2 p-4'}>
      <SettingsPageMetadata title={'Info'} />
      <div className={'flex items-center gap-3 text-stone-700'}>
        <ApplicationIcon
          className={'h-12 w-12 md:h-16 md:w-16 animate-fade-in-left'}
        />
        <h2
          className={
            'text-2xl font-semibold text-stone-700 md:text-5xl dark:text-stone-300 animate-fade-in-left delay-50'
          }
        >
          Kosmos
        </h2>
      </div>
      <p className={'italic animate-fade-in-top delay-100'}>
        High performance file hosting
      </p>
      <ul className={'py-5'}>
        {links.map((link, i) => (
          <li key={link.name} className={'flex items-center gap-2'}>
            <span
              className={'animate-fade-in-left flex gap-1'}
              style={{ animationDelay: `${(i + 1) * 100 + 100}ms` }}
            >
              <link.icon className={'h-6 w-6'} />
              {link.name}:{' '}
            </span>
            <Link
              to={link.href}
              target={'_blank'}
              style={{
                animationDelay: `${(i + 1) * 150 + 100}ms`,
              }}
              className={
                'w-0 grow truncate text-stone-600 hover:underline dark:text-stone-300 animate-fade-in-left'
              }
            >
              {link.href}
            </Link>
          </li>
        ))}
      </ul>
      <div
        style={{
          animationDelay: `${links.length * 150 + 200}ms`,
        }}
        className={
          'flex flex-wrap items-center gap-5 text-stone-500 dark:text-stone-400 animate-fade-in-bottom'
        }
      >
        <p>
          © {new Date().getFullYear()}{' '}
          <Link to={'https://setilic.com'} target={'_blank'}>
            Setilic
          </Link>
        </p>
        <BuildIdDisplay />
        <BuildTagDisplay />
      </div>
    </div>
  );
}
