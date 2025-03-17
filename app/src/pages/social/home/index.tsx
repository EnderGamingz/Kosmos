import getCurrentTimeSection from '@utils/getCurrentTimeSection.ts';
import { useUserState } from '@stores/userStore.ts';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import {
  UnhandledRequestLoading,
  UnhandledRequests,
} from '@pages/social/home/unhandledRequests.tsx';
import { ChatList } from '../chats';

export default function SocialHomePage() {
  const user = useUserState(s => s.user);

  const name = user?.full_name?.split(' ').at(0);

  return (
    <div className={'space-y-5'}>
      <h1 className={'text-3xl font-bold animate-fade-in-top'}>
        Good {getCurrentTimeSection()}
        {name && ' ' + name}!
      </h1>
      <FetchBoundary
        fetchGoal={'unhandled requests'}
        fallback={<UnhandledRequestLoading />}>
        <UnhandledRequests />
      </FetchBoundary>
      <div>
        <FetchBoundary fetchGoal={'chats'}>
          <ChatList preview />
        </FetchBoundary>
      </div>
    </div>
  );
}
