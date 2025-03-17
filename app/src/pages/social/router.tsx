import { Route, Routes } from 'react-router-dom';
import { SocialPageMetadata } from '@components/metadata.tsx';
import { SocialSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import ContactsPage from '@pages/social/contacts';
import SocialHomePage from '@pages/social/home';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';
import ChatsRouter from '@pages/social/chats';

export default function SocialRouter() {
  return (
    <>
      <div className={'max-w-6xl w-full mx-auto p-5 grow flex flex-col'}>
        <SocialPageMetadata />
        <div className={'flex grow gap-5'}>
          <div className={'max-w-64 w-full hidden md:flex'}>
            <SocialSideNav />
          </div>
          <div className={'flex flex-col grow'}>
            <Routes>
              <Route path={'chats/*'} element={<ChatsRouter />} />
              <Route path={'contacts'} element={<ContactsPage />} />
              <Route index element={<SocialHomePage />} />
            </Routes>
          </div>
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'social'} />
      </div>
    </>
  );
}
