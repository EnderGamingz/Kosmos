import { FormEvent, ReactNode } from 'react';
import { HeaderBranding } from '@components/header/headerBranding.tsx';
import { Link } from 'react-router-dom';
import { cn } from '@lib/utils.ts';
import { PageMetadata } from '@components/metadata.tsx';
import { RouterLoading } from '@components/header/routerLoading.tsx';

export function AuthScreen({
  children,
  title,
  subtitle,
  secondaryAction,
  onSubmit,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  secondaryAction?: {
    condition: boolean;
    text: string;
    actionText: string;
    link: string;
  };
}) {
  return (
    <div
      className={
        'fixed inset-0 isolate z-50 grid flex-grow grid-cols-1 md:grid-cols-5 bg-background'
      }>
      <RouterLoading />
      <PageMetadata title={title} />
      <div
        className={
          'z-10 col-span-3 flex flex-col gap-5 bg-background p-10 shadow-[0_10px_10px_10px_rgba(255,255,255,0.3)] dark:shadow-[0_10px_10px_10px_rgba(0,0,0,0.3)]'
        }>
        <div className={'flex'}>
          <HeaderBranding />
        </div>
        <div className={'mx-auto mt-10 w-full max-w-sm space-y-2'}>
          <h1
            className={
              'text-4xl font-bold lg:text-5xl animate-fade-in-top delay-100'
            }>
            {title}
          </h1>
          <p
            className={
              'text-muted-foreground lg:text-lg animate-fade-in-top delay-200'
            }>
            {subtitle}
          </p>
          <form
            onSubmit={onSubmit}
            className={cn(
              'mt-10 flex flex-col gap-4 group',
              '[&>label>svg]:absolute [&>label>svg]:h-5 [&>label>svg]:w-5 [&_input]:pl-8 [&_label]:relative',
              '[&>label>svg]:left-2 [&>label>svg]:top-1/2 [&>label>svg]:-translate-y-1/2 [&>label>svg]:text-stone-700',
              '[&_button]:justify-center [&_input]:w-full lg:[&_label]:text-lg',
              'dark:[&>label>svg]:text-stone-300',
            )}>
            {children}
          </form>
        </div>
        {secondaryAction && secondaryAction.condition && (
          <div className={'mt-auto animate-fade-in-left delay-500'}>
            <p className={'text-muted-foreground'}>
              {secondaryAction.text}{' '}
              <Link
                to={secondaryAction.link}
                className={'text-blue-500 underline'}>
                {secondaryAction.actionText}
              </Link>
            </p>
          </div>
        )}
      </div>
      <img
        className={
          'col-span-2 hidden h-full max-h-[100dvh] w-full object-cover md:block'
        }
        src={'/img/pictures/stone.jpg'}
        alt={'Stone background'}
      />
    </div>
  );
}
