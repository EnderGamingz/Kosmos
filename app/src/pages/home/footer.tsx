import ApplicationIcon from '@components/defaults/icon.tsx';
import { Link } from 'react-router-dom';
import { BuildTagDisplay } from '@pages/settings/appInfo.tsx';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className={'mt-24 space-y-2 px-10 text-stone-700 dark:text-stone-300'}
    >
      <div
        className={
          'flex flex-col justify-between gap-2 sm:flex-row sm:items-end'
        }
      >
        <div className={'flex items-center gap-2'}>
          <ApplicationIcon className={'h-12 w-12'} />
          <div>
            <h2 className={'flex gap-2 text-2xl font-semibold'}>
              Kosmos
              <BuildTagDisplay noIcon />
            </h2>
            <p className={'italic'}>High performance file hosting</p>
          </div>
        </div>
        <Link
          to={'https://aka.setilic.com/l/portfolio?ref=kosmos'}
          target={'_blank'}
          className={'hover:underline'}
        >
          Made with <Heart className={'inline h-5 w-5'} />
        </Link>
      </div>
      <div
        className={
          'border-t border-stone-800/10 pb-2 pt-2 text-center text-sm text-stone-500 dark:text-stone-400'
        }
      >
        <p>
          © {new Date().getFullYear()}{' '}
          <Link to={'https://setilic.com'} target={'_blank'}>
            Setilic
          </Link>
        </p>
      </div>
    </footer>
  );
}
