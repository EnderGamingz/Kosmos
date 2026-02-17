import { Skeleton } from '@/components/ui/skeleton';

export function FileTableLoading() {
  return (
    <div className={'mt-10 absolute inset-0 flex overflow-hidden'}>
      <style>
        {`
        .file-list {
        overflow-y:hidden;
        }
        `}
      </style>
      <div className={'w-full overflow-hidden text-left opacity-60'}>
        <div
          className={
            'flex [&>div]:p-3 [&>div]:font-bold [&>div]:text-stone-700'
          }
        >
          <div>
            <div className={'w-7'}>
              <Skeleton className={'h-5 w-5 rounded-md'} />
            </div>
          </div>
          <div className={'w-full'}>
            <Skeleton className={'h-5 w-1/5'} />
          </div>
          <div className={'min-w-[100px] text-right'}>
            <Skeleton className={'h-5 w-full'} />
          </div>
          <div className={'min-w-[155px] text-right'}>
            <Skeleton className={'h-5 w-2/3'} />
          </div>
        </div>
        <div className={'overflow-hidden'}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={
                'flex [&>div]:p-3 [&>div]:font-bold [&>div]:text-stone-700 animate-fade-in-top'
              }
              style={{
                animationDelay: `${i * 30}ms`,
              }}
            >
              <div>
                <div className={'w-7'}>
                  <Skeleton className={'h-5 w-5 rounded-md'} />
                </div>
              </div>
              <div className={'w-full'}>
                <Skeleton className={'h-5 w-1/2'} />
              </div>
              <div className={'min-w-[100px] text-right'}>
                <Skeleton className={'h-5 w-full'} />
              </div>
              <div className={'min-w-[155px] text-right'}>
                <Skeleton className={'h-5 w-2/3'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
