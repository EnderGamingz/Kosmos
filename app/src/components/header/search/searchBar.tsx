import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchForm } from '@components/header/search/searchForm.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react';

export function SearchBar() {
  return (
    <div className={'mx-auto w-full max-w-md px-3 md:px-10'}>
      <div className={'hidden sm:block'}>
        <SearchForm />
      </div>
    </div>
  );
}

export function SearchPopup() {
  const searchDisclosure = useDisclosure();

  return (
    <Popover
      isOpen={searchDisclosure.isOpen}
      onOpenChange={searchDisclosure.onOpenChange}
      placement={'bottom'}>
      <PopoverTrigger>
        <button className={'block p-2 sm:hidden'}>
          <MagnifyingGlassIcon className={'h-6 w-6 sm:mr-1 sm:h-5 sm:w-5'} />
        </button>
      </PopoverTrigger>
      <PopoverContent className={'bg-stone-50 dark:bg-stone-800'}>
        <div className={'p-2'}>
          <SearchForm onClose={searchDisclosure.onClose} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
