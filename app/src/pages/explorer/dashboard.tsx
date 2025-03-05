import { Outlet } from 'react-router-dom';
import { SideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';
import { PageMetadata } from '@components/metadata.tsx';

export default function Dashboard() {
  return (
    <>
      <PageMetadata title={'Dashboard'} />
      <div className={'flex grow'}>
        <div className={'w-64 hidden md:flex'}>
          <SideNav source={'default'} />
        </div>
        <div className={'grow'}>
          <Outlet />
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'default'} />
      </div>
    </>
  );
}
