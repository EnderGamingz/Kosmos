import { SearchForm } from '@components/header/search/searchForm.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useDisclosure from '@/hooks/useDisclosure';
import { Search } from 'lucide-react';

export function SearchBar() {
  return <SearchForm />;
}

export function SearchPopup() {
  const searchDisclosure = useDisclosure();

  return (
    <Popover
      open={searchDisclosure.isOpen}
      onOpenChange={searchDisclosure.onOpenChange}>
      <PopoverTrigger asChild>
        <button className={'block p-2 sm:hidden'}>
          <Search className={'h-6 w-6 sm:mr-1 sm:h-5 sm:w-5'} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={'bottom'}>
        <SearchForm onClose={searchDisclosure.onClose} />
      </PopoverContent>
    </Popover>
  );
}
