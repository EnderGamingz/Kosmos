import FetchBoundary from '@components/wrappers/fetch.tsx';
import { ContactList } from '@pages/social/contacts/contactList.tsx';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { AddContact } from '@pages/social/contacts/addContact.tsx';
import { SocialPageMetadata } from '@components/metadata.tsx';
import { ContactRequestListItem } from '@pages/social/contacts/answerRequest.tsx';
import { cn } from '@lib/utils.ts';
import { AnimatePresence } from 'framer-motion';

export default function ContactsPage() {
  return (
    <div className={'space-y-4'}>
      <SocialPageMetadata title={'Contacts'} />
      <div className={'flex items-center gap-2 justify-between'}>
        <h1 className={'text-3xl animate-fade-in-top'}>Contacts</h1>
        <AddContact />
      </div>
      <FetchBoundary fetchGoal={'unhandled requests'}>
        <UnhandledRequests />
      </FetchBoundary>
      <hr />
      <FetchBoundary fetchGoal={'my contacts'}>
        <ContactList />
      </FetchBoundary>
    </div>
  );
}

function UnhandledRequests() {
  const { data } = ContactQuery.useUnhandledSuspense();

  return (
    <>
      <div className={cn(data.requests_received.length === 0 && 'opacity-40')}>
        <h2 className={'text-xl animate-fade-in-top delay-200'}>
          Contact Request{data.requests_received.length !== 1 && 's'}{' '}
          <span className={'text-sm text-muted-foreground'}>
            ({data.requests_received.length})
          </span>
        </h2>
        <ul className={'animate-fade-in-top delay-300'}>
          <AnimatePresence>
            {data.requests_received.map(request => (
              <ContactRequestListItem
                key={request.user_id}
                request={request}
                type={'received'}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <hr />
      <div className={cn(data.requests_sent.length === 0 && 'opacity-40')}>
        <h2 className={'text-xl animate-fade-in-top delay-200'}>
          Request{data.requests_sent.length !== 1 && 's'} Pending{' '}
          <span className={'text-sm text-muted-foreground'}>
            ({data.requests_sent.length})
          </span>
        </h2>
        <ul className={'animate-fade-in-top delay-300'}>
          <AnimatePresence>
            {data.requests_sent.map(request => (
              <ContactRequestListItem
                key={request.user_id}
                request={request}
                type={'sent'}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </>
  );
}
