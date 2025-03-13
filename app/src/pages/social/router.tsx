import { Route, Routes } from 'react-router-dom';
import { SocialPageMetadata } from '@components/metadata.tsx';
import { SocialSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import ContactsPage from '@pages/social/contacts';
import SocialHomePage from '@pages/social/home';

export default function SocialRouter() {
  return (
    <div className={'max-w-6xl w-full mx-auto p-5 grow flex flex-col'}>
      <SocialPageMetadata />
      <div className={'flex grow'}>
        <div className={'w-64 hidden md:flex'}>
          <SocialSideNav />
        </div>
        <div className={'grow'}>
          <Routes>
            <Route path={'contacts'} element={<ContactsPage />} />
            <Route index element={<SocialHomePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
