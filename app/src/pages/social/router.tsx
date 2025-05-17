import { Outlet } from 'react-router-dom';
import { SocialPageMetadata } from '@components/metadata.tsx';
import { SocialSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';

export default function SocialRoutesWrapper() {
  return (
    <>
      <div className={'max-w-6xl w-full mx-auto p-5 grow flex flex-col'}>
        <SocialPageMetadata />
        <div className={'flex grow gap-5'}>
          <div className={'max-w-64 w-full hidden md:flex'}>
            <SocialSideNav />
          </div>
          <div className={'flex flex-col grow'}>
            <Outlet />
          </div>
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'social'} />
      </div>
    </>
  );
}
