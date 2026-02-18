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
            'grow flex flex-col bg-primary-foreground/50 rounded-xl md:mb-2 md:mr-2'
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
