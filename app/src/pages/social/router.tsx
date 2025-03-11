import { Route, Routes } from 'react-router-dom';
import { AdminPageMetadata } from '@components/metadata.tsx';
import { SocialSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import ContactsPage from '@pages/social/contacts';

export default function SocialRouter() {
  return (
    <div className={'max-w-6xl w-full mx-auto p-5 grow flex flex-col'}>
      <AdminPageMetadata />
      <div className={'flex grow'}>
        <div className={'w-64 hidden md:flex'}>
          <SocialSideNav />
        </div>
        <div className={'grow'}>
          <Routes>
            <Route path={'contacts'} element={<ContactsPage />} />
            <Route index element={<div>Home</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
