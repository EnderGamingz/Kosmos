import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className={
        'p-3 space-y-6 grow flex flex-col justify-center max-w-lg w-full mx-auto'
      }>
      <div className={'space-y-2'}>
        <h1 className={'text-5xl font-bold'}>404</h1>
        <p className={'text-lg'}>This page does not exist.</p>
      </div>
      <Link to={'/'} className={buttonVariants()}>
        <ArrowLeft className={'mr-2'} />
        Back to home
      </Link>
    </div>
  );
}
