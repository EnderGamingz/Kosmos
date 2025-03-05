import { SideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import { Outlet } from 'react-router-dom';
import { AdminPageMetadata } from '@components/metadata.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';

export default function AdminPage() {
  return (
    <>
      <AdminPageMetadata />
      <div className={'flex grow'}>
        <div className={'w-64 hidden md:flex'}>
          <SideNav source={'admin'} />
        </div>
        <div className={'grow p-5'}>
          <Outlet />
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'admin'} />
      </div>
    </>
  );
}
