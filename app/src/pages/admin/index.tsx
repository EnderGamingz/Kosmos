import { ExplorerSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import { Outlet } from 'react-router-dom';
import { AdminPageMetadata } from '@components/metadata.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';

export default function AdminPagesWrapper() {
  return (
    <>
      <AdminPageMetadata />
      <div
        className={
          'flex grow overflow-y-auto max-h-[calc(100dvh-90px)] max-md:max-h-[calc(100dvh-90px-80px)]'
        }
      >
        <div className={'w-64 hidden md:flex'}>
          <ExplorerSideNav source={'admin'} />
        </div>
        <div
          className={
            'grow p-5 bg-primary-foreground/50 rounded-xl md:mb-2 md:mr-2'
          }
        >
          <div className={'pb-10'}>
            <Outlet />
          </div>
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'admin'} />
      </div>
    </>
  );
}
