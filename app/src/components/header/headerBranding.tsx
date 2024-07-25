import { UserModel } from '@models/user.ts';
import { Link } from 'react-router-dom';
import ApplicationIcon from '@components/defaults/icon.tsx';
import { motion } from 'framer-motion';

export function HeaderBranding({ user }: { user?: UserModel }) {
  return (
    <motion.div className={'min-w-max'} layoutId={'header-branding'}>
      <Link
        to={user ? '/home' : '/'}
        className={
          'flex items-center gap-2 rounded-lg p-2 text-stone-700 transition-all hover:bg-stone-700/5'
        }>
        <ApplicationIcon className={'h-8 w-8'} />
        <span className={'hidden text-2xl font-semibold sm:block'}>Kosmos</span>
      </Link>
    </motion.div>
  );
}
