import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function SubPageTitle({ children }: { children: ReactNode }) {
  return (
    <div className={'flex flex-wrap items-center gap-2'}>
      <motion.h1
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={'text-3xl font-semibold text-stone-800 dark:text-stone-200'}>
        {children}
      </motion.h1>
    </div>
  );
}
