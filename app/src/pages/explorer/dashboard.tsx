import { Outlet } from 'react-router-dom';
import { ExplorerSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';
import { PageMetadata } from '@components/metadata.tsx';

export default function Dashboard() {
  return (
    <>
      <PageMetadata title={'Dashboard'} />
      <div className={'flex grow'}>
        <div className={'w-64 hidden md:flex'}>
          <ExplorerSideNav source={'default'} />
        </div>
        <div
          className={
            'grow flex flex-col bg-background-end/60 rounded-xl shadow-[inset_0_2px_8px_-3px_rgba(0,0,0,0.2)]'
          }
        >
          <Outlet />
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'default'} />
      </div>
    </>
  );
}
