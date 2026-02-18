import { type SubmitEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@lib/utils.ts';
import { CornerDownRight, Search } from 'lucide-react';

export function SearchForm({ onClose }: { onClose?: () => void }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = e => {
    e.preventDefault();

    onClose?.();
    if (!value) {
      navigate('/home');
      return;
    }
    navigate(`/home/search?q=${value}`);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={'relative'}>
        <Search
          className={'absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2'}
        />
        <input
          type={'text'}
          placeholder={'Search files or folders'}
          name={'query'}
          value={value}
          onChange={e => setValue(e.target.value)}
          autoComplete={'off'}
          className={
            'w-full truncate rounded-md border-primary/50 p-2.5 px-9 border placeholder:text-sm'
          }
        />
        <button
          type={'submit'}
          disabled={!value}
          className={cn(
            'transition-opacity absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2',
            !value && 'opacity-0',
          )}
        >
          <CornerDownRight className={'h-5 w-5'} />
        </button>
      </div>
    </form>
  );
}
