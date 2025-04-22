import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@lib/utils.ts';

export function FileTableLoading() {
  return (
    <div className={cn('absolute inset-0 flex overflow-hidden')}>
      <style>
        {`
        .file-list {
        overflow-y:hidden;
        }
        `}
      </style>
      <table
        className={'w-full table-auto overflow-hidden text-left opacity-60'}>
        <thead>
          <tr className={'[&_th]:p-3 [&_th]:font-bold [&_th]:text-stone-700'}>
            <th>
              <div className={'w-7'}>
                <Skeleton className={'h-5 w-5 rounded-md'} />
              </div>
            </th>
            <th className={'w-full'}>
              <Skeleton className={'h-5 w-1/5'} />
            </th>
            <th align={'right'} className={'min-w-[100px]'}>
              <Skeleton className={'h-5 w-full'} />
            </th>
            <th align={'right'} className={'min-w-[155px]'}>
              <Skeleton className={'h-5 w-2/3'} />
            </th>
          </tr>
        </thead>
        <tbody className={'overflow-hidden'}>
          {Array.from({ length: 20 }).map((_, i) => (
            <tr
              key={i}
              className={
                '[&_td]:p-3 [&_td]:font-bold [&_td]:text-stone-700 animate-fade-in-top'
              }
              style={{
                animationDelay: `${i * 30}ms`,
              }}>
              <td className={'p-3'}>
                <div className={'w-7'}>
                  <Skeleton className={'h-5 w-5 rounded-md'} />
                </div>
              </td>
              <td className={'w-full'}>
                <Skeleton className={'h-5 w-full'} />
              </td>
              <td align={'right'}>
                <Skeleton className={'h-5 w-full'} />
              </td>
              <td align={'right'}>
                <Skeleton className={'h-5 w-full'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
