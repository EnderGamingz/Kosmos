import { Button } from '@components/ui/button.tsx';
import { Plus } from 'lucide-react';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import { ContactList } from '@pages/social/contacts/contactList.tsx';
import { ContactQuery } from '@lib/queries/contactQuery.ts';

export default function ContactsPage() {
  const { data: unhandled } = ContactQuery.useUnhandledSuspense();

  console.log(unhandled);
  return (
    <div className={'space-y-4'}>
      <div className={'flex items-center gap-2 justify-between'}>
        <h1 className={'text-3xl animate-fade-in-top'}>Contacts</h1>
        <Button size={'sm'} className={'animate-fade-in-right delay-200'}>
          <Plus />
          Add Contact
        </Button>
      </div>
      <h2 className={'text-xl animate-fade-in-top delay-200'}>
        Contact Request{unhandled.requests_received.length !== 1 && 's'}{' '}
        <span className={'text-sm text-muted-foreground'}>
          ({unhandled.requests_received.length})
        </span>
      </h2>
      <hr />
      <h2 className={'text-xl animate-fade-in-top delay-200'}>
        Request{unhandled.requests_send.length !== 1 && 's'} Pending{' '}
        <span className={'text-sm text-muted-foreground'}>
          ({unhandled.requests_send.length})
        </span>
      </h2>
      <hr />
      <FetchBoundary fetchGoal={'my Contacts'}>
        <ContactList />
      </FetchBoundary>
    </div>
  );
}
