import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function SubPageTitle({ children }: { children: ReactNode }) {
  return (
    <motion.h1
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={
        'text-3xl font-semibold text-stone-800 dark:text-stone-200 truncate'
      }>
      {children}
    </motion.h1>
  );
}
