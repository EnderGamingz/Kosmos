import { cn } from '@lib/utils.ts';
import { Input } from '@components/ui/input.tsx';
import { formatBytes } from '@utils/fileSize.ts';

export function StorageLimitSelector({
  limit,
  onChange,
}: {
  limit: number;
  onChange: (newValue: number) => void;
}) {
  return (
    <div>
      <div className={'flex items-center gap-2 flex-wrap mb-2'}>
        {[
          {
            label: '500 Mib',
            value: 500 * 1024 * 1024,
          },
          {
            label: '1 Gib',
            value: 1024 * 1024 * 1024,
          },
          {
            label: '5 Gib',
            value: 5 * 1024 * 1024 * 1024,
          },
          {
            label: '10 Gib',
            value: 10 * 1024 * 1024 * 1024,
          },
          {
            label: '50 Gib',
            value: 50 * 1024 * 1024 * 1024,
          },
          {
            label: '10 YiB',
            value: 10 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
          },
        ].map(option => (
          <button
            type={'button'}
            className={cn(
              'transition-colors duration-200 ease-in-out',
              'text-xs px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-800/10 dark:hover:bg-stone-300/10',
              option.value === limit &&
                'bg-stone-800/10 dark:bg-stone-300/10 border-stone-800 dark:border-stone-300',
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Input
        type={'number'}
        name={'limit'}
        id={'limit'}
        placeholder={'Limit'}
        value={limit === 0 ? '' : limit.toString()}
        onChange={e =>
          onChange(e.target.value === '' ? 0 : Number(e.target.value))
        }
      />
      <p
        className={
          'px-2 pt-1 italic text-muted-foreground flex justify-between'
        }
      >
        <span>{formatBytes(limit || 0, 2, false)}</span>
        <span>{formatBytes(limit || 0, 2, true)}</span>
      </p>
    </div>
  );
}
