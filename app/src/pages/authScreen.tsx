import { FormEvent, ReactNode } from 'react';
import { HeaderBranding } from '@components/header/headerBranding.tsx';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import tw from '@utils/classMerge.ts';

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
        'fixed inset-0 isolate z-50 grid flex-grow grid-cols-1 bg-stone-50 md:grid-cols-5'
      }>
      <div
        className={
          'z-10 col-span-3 flex flex-col gap-5 bg-stone-50 p-10 shadow-[0_10px_10px_10px_rgba(255,255,255,0.3)]'
        }>
        <div className={'flex'}>
          <HeaderBranding />
        </div>
        <div className={'mx-auto mt-10 w-full max-w-sm'}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={'text-4xl font-bold lg:text-5xl'}>
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={'text-stone-500 lg:text-lg'}>
            {subtitle}
          </motion.p>
          <form
            onSubmit={onSubmit}
            className={tw(
              'mt-10 flex flex-col gap-4',
              '[&_input]:pl-8 [&_label]:relative [&_svg]:absolute [&_svg]:h-5 [&_svg]:w-5',
              '[&_svg]:left-2 [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:text-stone-700',
              '[&_input]:w-full lg:[&_label]:text-lg',
            )}>
            {children}
          </form>
        </div>
        {secondaryAction && secondaryAction.condition && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={'mt-auto'}>
            <p className={'text-stone-500'}>
              {secondaryAction.text}{' '}
              <Link
                to={secondaryAction.link}
                className={'text-blue-500 underline'}>
                {secondaryAction.actionText}
              </Link>
            </p>
          </motion.div>
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
