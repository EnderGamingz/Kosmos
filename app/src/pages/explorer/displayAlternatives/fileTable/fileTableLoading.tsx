import { Skeleton } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/defaults/transition.ts';

export function FileTableLoading() {
  return (
    <>
      <style>
        {`
        .file-list {
        overflow-y:hidden;
        }
        `}
      </style>
      <table className={'w-full table-auto text-left opacity-60'}>
        <thead>
          <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
            <th>
              <div className={'w-7'}>
                <Skeleton className={'h-5 w-5 rounded-md'} />
              </div>
            </th>
            <th className={'w-full'}>Name</th>
            <th align={'right'} className={'min-w-[100px]'}>
              Size
            </th>
            <th align={'right'} className={'min-w-[155px]'}>
              Modified
            </th>
          </tr>
        </thead>
        <motion.tbody
          variants={containerVariant()}
          initial='hidden'
          animate='show'
          className={'divide-y divide-stone-300/50 overflow-hidden'}>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.tr
              variants={itemTransitionVariant}
              key={i}
              className={'[&_td]:p-3  [&_td]:font-bold [&_td]:text-stone-700'}>
              <td className={'p-3'}>
                <div className={'w-7'}>
                  <Skeleton className={'h-5 w-5 rounded-md opacity-50'} />
                </div>
              </td>
              <td className={'w-full'}>
                <Skeleton className={'h-5 w-full opacity-50'} />
              </td>
              <td align={'right'}>
                <Skeleton className={'h-5 w-full opacity-50'} />
              </td>
              <td align={'right'}>
                <Skeleton className={'h-5 w-full opacity-50'} />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </>
  );
}
