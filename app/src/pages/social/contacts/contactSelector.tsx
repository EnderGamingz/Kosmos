import { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import { useState } from 'react';
import { useDebounce } from '@hooks/useDebounce.ts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { Button } from '@/components/ui/button';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import UserAvatar from '@components/UserAvatar.tsx';
import { Input } from '@components/ui/input.tsx';
import { cn } from '@lib/utils.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { Link } from 'react-router-dom';

export function ContactSelector({
  selected,
  onSelect,
}: {
  selected?: ProfileContactModelDTO;
  onSelect: (
    value:
      | ((
          prevState: ProfileContactModelDTO | undefined,
        ) => ProfileContactModelDTO | undefined)
      | ProfileContactModelDTO
      | undefined,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debounceResult = useDebounce(search, 300, '');

  return (
    <div className={'p-2 border border-muted-foreground/20 rounded-md'}>
      <div className={'flex gap-2 justify-between items-center'}>
        <div className={'-space-y-1'}>
          <p>Select a contact</p>
          <Link
            to={'/social/contacts'}
            className={'text-xs underline text-muted-foreground'}>
            View contact list
          </Link>
        </div>
        <div className={'flex gap-1'}>
          {selected && (
            <Button
              className={'!p-0 aspect-square'}
              variant={'secondary'}
              size={'sm'}
              onClick={() => onSelect(undefined)}>
              <X />
            </Button>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant={'secondary'} size={'sm'}>
                Select Contact
              </Button>
            </PopoverTrigger>
            <PopoverContent className={'p-3'}>
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={'h-10'}
                placeholder={'Search for contact'}
              />
              <hr className={'my-2'} />
              <FetchBoundary fetchGoal={'contacts'}>
                <ContactSelectorContent
                  query={debounceResult.debouncedValue as string}
                  onSelect={p => {
                    onSelect(p);
                    setOpen(false);
                  }}
                  selected={selected}
                />
              </FetchBoundary>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}>
            <ContactItem profile={selected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactSelectorContent({
  query,
  onSelect,
  selected,
}: {
  query: string;
  onSelect: (payload: ProfileContactModelDTO) => void;
  selected?: ProfileContactModelDTO;
}) {
  const { data } = ContactQuery.useProfilesSuspense({
    query,
  });

  return (
    <ul className={'max-h-72 overflow-y-auto'}>
      {data.map(profile => (
        <li
          key={profile.user_id}
          className={'group cursor-pointer'}
          onClick={() => onSelect(profile)}>
          <ContactItem profile={profile} isSelected={selected === profile} />
        </li>
      ))}
      {!data.length && (
        <div className={'overflow-hidden'}>
          <EmptyList noIcon message={'No contacts found'} />
        </div>
      )}
    </ul>
  );
}

function ContactItem({
  profile,
  isSelected,
}: {
  profile: ProfileContactModelDTO;
  isSelected?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex gap-2 p-2 items-center rounded-md group-hover:bg-border',
        isSelected && 'bg-border',
      )}>
      <UserAvatar username={profile.username} userId={profile.user_id} />
      <div className={'w-full overflow-hidden -space-y-1'}>
        <p>{profile.full_name ?? profile.username}</p>
        {profile.email && (
          <p className={'truncate text-sm text-muted-foreground'}>
            {profile.email}
          </p>
        )}
      </div>
    </div>
  );
}
