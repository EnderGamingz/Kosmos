import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { Skeleton } from '@components/ui/skeleton.tsx';
import { cn } from '@lib/utils.ts';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@components/ui/button.tsx';
import { ArrowUpRight } from 'lucide-react';

export function UnhandledRequests() {
  const { data } = ContactQuery.useUnhandledSuspense();

  if (!data.requests_received.length && !data.requests_sent.length) {
    return (
      <div>
        <h2 className={'text-xl animate-fade-in-top'}>No pending requests</h2>
        <p className={'text-muted-foreground animate-fade-in-top delay-50'}>
          Everyone is caught up!
        </p>
      </div>
    );
  }

  return (
    <div className={'space-y-3'}>
      <h2 className={'text-xl animate-fade-in-top'}>Pending Requests</h2>
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
        {!!data.requests_received.length && (
          <div className={'animate-fade-in-top delay-100'}>
            <UnhandledCard
              title={`Request${data.requests_received.length > 1 ? 's' : ''} waiting for a response`}
              requests={data.requests_received.length}
              buttonText={'View received requests'}
              attention={true}
            />
          </div>
        )}
        {!!data.requests_sent.length && (
          <div className={'animate-fade-in-top delay-200'}>
            <UnhandledCard
              title={`Request${data.requests_sent.length > 1 ? 's' : ''} is pending...`}
              requests={data.requests_sent.length}
              buttonText={'View sent requests'}
              attention={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function UnhandledRequestLoading() {
  return (
    <div className={'space-y-3'}>
      <div className={'animate-fade-in'}>
        <Skeleton className={'h-7 w-40'} />
      </div>
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
        <div className={'animate-fade-in delay-50'}>
          <Skeleton className={'h-24'} />
        </div>
        <div className={'animate-fade-in delay-100'}>
          <Skeleton className={'h-24'} />
        </div>
      </div>
    </div>
  );
}

function UnhandledCard({
  title,
  requests,
  buttonText,
  attention,
}: {
  title: string;
  requests: number;
  buttonText: string;
  attention: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-md border p-3 flex flex-col gap-2',
        attention
          ? 'isolate relative after:content-[""] after:rounded-md after:absolute after:inset-0 after:z-[-1] after:border after:animate-pulse after:opacity-10'
          : 'text-muted-foreground',
      )}>
      <div className={'flex gap-4'}>
        <span className={'text-7xl font-bold'}>{requests}</span>
        <div className={'grow py-1'}>
          <p className={'text-lg'}>{title}</p>
          <Link
            to={'/social/contacts'}
            className={cn(
              buttonVariants({ size: 'sm', variant: 'outline' }),
              'px-5',
            )}>
            {buttonText}
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
