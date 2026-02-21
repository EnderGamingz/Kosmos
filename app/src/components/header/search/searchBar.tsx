import { SearchForm } from '@components/header/search/searchForm.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useDisclosure from '@/hooks/useDisclosure';
import { Search } from 'lucide-react';
import getCurrentTimeSection, { getRandomGreeting } from '@utils/greeting.ts';

export function SearchBar() {
  return (
    <div className={'text-center space-y-1'}>
      <p className={'text-xs text-muted-foreground'}>
        Good {getCurrentTimeSection()}! <b>{getRandomGreeting()}</b>
      </p>
      <SearchForm />
    </div>
  );
}

export function SearchPopup() {
  const searchDisclosure = useDisclosure();

  return (
    <Popover
      open={searchDisclosure.isOpen}
      onOpenChange={searchDisclosure.onOpenChange}
    >
      <PopoverTrigger asChild>
        <button type={'button'} className={'block p-2 sm:hidden max-md:hidden'}>
          <Search className={'h-6 w-6 sm:mr-1 sm:h-5 sm:w-5'} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={'bottom'}>
        <SearchForm onClose={searchDisclosure.onClose} />
      </PopoverContent>
    </Popover>
  );
}
