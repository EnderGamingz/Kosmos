import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { AttentionDot } from '@components/header/attentionDot.tsx';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export function SocialHeaderLink() {
  const { data } = ContactQuery.useRequiresAttention();
  return (
    <Link to={'/social'}>
      <button className={'flex p-2 relative cursor-pointer'}>
        {data && <AttentionDot className={'bg-red-400'} />}
        <MessageSquare className={'h-6 w-6'} />
      </button>
    </Link>
  );
}
