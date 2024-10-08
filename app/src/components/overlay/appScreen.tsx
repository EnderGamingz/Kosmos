import ApplicationIcon from '@components/defaults/icon.tsx';

export default function AppScreen({
  logo,
  text,
  loading,
}: {
  logo?: boolean;
  text?: string;
  loading?: boolean;
}) {
  return (
    <div
      className={
        'body-bg absolute inset-0 z-20 p-10 text-stone-700 dark:text-stone-300/80 ' +
        'flex flex-col items-center justify-center gap-2'
      }>
      <div className={'flex flex-col items-center gap-4'}>
        {logo && <ApplicationIcon className={'app-loading-logo h-32 w-32'} />}
        <span className={'app-loading-text text-center text-5xl font-bold'}>
          {text ?? 'Kosmos'}
        </span>
      </div>
      {loading && (
        <div
          className={
            'app-loading-indicator !border-t-stone-700 dark:!border-t-stone-300'
          }
        />
      )}
    </div>
  );
}
