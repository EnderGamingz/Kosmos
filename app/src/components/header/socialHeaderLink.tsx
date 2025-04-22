import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { AttentionDot } from '@components/header/attentionDot.tsx';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export function SocialHeaderLink() {
  const { data } = ContactQuery.useRequiresAttention();
  return (
    <Link
      to={'/social'}
      className={'max-md:hidden flex p-2.5 sm:p-3 relative cursor-pointer'}>
      {data && <AttentionDot className={'bg-red-400'} />}
      <MessageSquare className={'h-6 w-6'} />
    </Link>
  );
}
