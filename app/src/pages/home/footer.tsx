import ApplicationIcon from '@components/defaults/icon.tsx';
import { Link } from 'react-router-dom';
import { BuildTagDisplay } from '@pages/settings/appInfo.tsx';

export default function Footer() {
  return (
    <footer className={'mt-24 space-y-2 px-10 text-stone-700'}>
      <div
        className={
          'flex flex-col justify-between gap-2 sm:flex-row sm:items-end'
        }>
        <div className={'flex items-center gap-2'}>
          <ApplicationIcon className={'h-12 w-12'} />
          <div>
            <h2 className={'flex gap-2 text-2xl font-semibold'}>
              Kosmos
              <BuildTagDisplay noIcon />
            </h2>
            <p className={'italic'}>High performance file hosting platform</p>
          </div>
        </div>
        <div>
          Made with ❤️ by{' '}
          <Link
            to={'https://setilic.com'}
            target={'_blank'}
            className={'text-stone-600 hover:underline'}>
            Setilic
          </Link>
        </div>
      </div>
      <div
        className={
          'border-t border-stone-800/10 pb-2 pt-2 text-center text-sm text-stone-500'
        }>
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
