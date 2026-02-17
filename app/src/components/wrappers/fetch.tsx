import { Button } from '@/components/ui/button.tsx';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { LoaderCircle, RefreshCcw } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { cn } from '@/lib/utils.ts';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog.tsx';

export default function FetchBoundary({
  children,
  fetchGoal,
  fallback,
}: {
  children: ReactNode;
  fetchGoal?: string;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback ?? <QueryLoading goal={fetchGoal} />}>
      <QueryErrorBoundary>{children}</QueryErrorBoundary>
    </Suspense>
  );
}

export function QueryLoading({ goal }: { goal?: string }) {
  return (
    <div className={cn('flex flex-col p-2 border text-on-primary rounded-md')}>
      <div className={'flex items-center gap-1'}>
        <p>Loading {goal ?? 'data'}...</p>
        <LoaderCircle className={'animate-spin h-4 w-4 inline'} />
      </div>
      <p className={'text-muted-foreground'}>
        Please wait while data is being fetched.
      </p>
    </div>
  );
}

function QueryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <div className={'mx-auto p-5 space-y-3'}>
              <ErrorDisplay error={error} />
              <Button onClick={() => resetErrorBoundary()}>
                <RefreshCcw />
                Retry
              </Button>
            </div>
          )}
          fallback={undefined}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className={'space-y-2'}>
      <div>
        <div className={'flex items-center gap-2 justify-between'}>
          <h2 className={'font-semibold'}>An error occurred</h2>
          <p
            className={'text-sm text-muted-foreground'}
            title={new Date().toISOString()}
          >
            {format(new Date(), 'pp')}
          </p>
        </div>
        <p className={'text-muted-foreground'}>
          Something went wrong while loading.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type={'button'}
              className={
                'flex flex-col gap-1 text-left relative px-2 my-2 border-l-4 border-red-500'
              }
            >
              {error.message && (
                <span className={'text-red-500 truncate'}>
                  &quot;
                  {error.message}
                  &quot;
                </span>
              )}
              <span className={'underline'}>See error details</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error Details</DialogTitle>
              <DialogDescription>{error.message}</DialogDescription>
            </DialogHeader>
            <pre className={'max-h-[50vh] overflow-auto p-2 border rounded-md'}>
              {error.stack?.toString()}
            </pre>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
