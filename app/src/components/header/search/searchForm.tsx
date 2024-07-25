import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowTurnDownRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';

export function SearchForm({ onClose }: { onClose?: () => void }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onClose?.();
    if (!value) {
      navigate('/home');
      return;
    }
    navigate(`/home/search?q=${value}`);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={'relative'}>
        <MagnifyingGlassIcon
          className={
            'absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500'
          }
        />
        <input
          type={'text'}
          placeholder={'Search files or folders'}
          name={'query'}
          value={value}
          onChange={e => setValue(e.target.value)}
          autoComplete={'off'}
          className={
            'w-full truncate rounded-md bg-transparent p-3 px-9 outline outline-1 outline-stone-400/50 placeholder:text-sm'
          }
        />
        <button
          type={'submit'}
          disabled={!value}
          className={tw(
            'absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2',
            'text-stone-500 transition-opacity',
            !value && 'opacity-0',
          )}>
          <ArrowTurnDownRightIcon className={'h-5 w-5'} />
        </button>
      </div>
    </form>
  );
}
