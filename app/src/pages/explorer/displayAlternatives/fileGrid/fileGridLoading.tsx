import { Skeleton } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/transition.ts';

export function FileGridLoading() {
  return (
    <>
      <style>
        {`.file-list {
        overflow-y:hidden;
        }`}
      </style>
      <div className={'space-y-3 px-5 py-2'}>
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'h-5 w-5 rounded-md'} />
          <Skeleton className={'h-5 w-32 rounded-md'} />
        </div>
        <motion.div
          variants={containerVariant()}
          initial={'hidden'}
          animate={'show'}
          className={
            'grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div variants={itemTransitionVariant} key={i}>
              <Skeleton className={'h-12 w-full rounded-lg'} />
            </motion.div>
          ))}
          <div className={'col-span-4'} />
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div variants={itemTransitionVariant} key={i}>
              <Skeleton className={'h-40 w-full rounded-lg'} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
}
