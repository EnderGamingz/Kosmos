import type { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { MoreHorizontal } from 'lucide-react';
import { CONTEXT_MENU_WIDTH } from '@lib/constants.ts';
import { RemoveContact } from '@pages/social/contacts/actions/removeContact.tsx';

export function ContactActionMenu({
  profile,
}: {
  profile: ProfileContactModelDTO;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type={'button'} className={'px-1'}>
          <MoreHorizontal />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={'p-3'}
        style={{ maxWidth: CONTEXT_MENU_WIDTH }}
      >
        <div className={'-space-y-1'}>
          <p className={'text-sm animate-fade-in-top'}>Actions for </p>
          <p className={'text-lg animate-fade-in-top delay-50'}>
            {profile.full_name ?? profile.username}
          </p>
        </div>
        <hr className={'my-2 animate-fade-in-top delay-100'} />
        <div className={'animate-fade-in-top delay-150'}>
          <RemoveContact profile={profile} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
