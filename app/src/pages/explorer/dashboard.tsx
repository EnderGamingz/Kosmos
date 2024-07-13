import { Outlet } from 'react-router-dom';
import { SideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';

export default function Dashboard() {
  return (
    <>
      <div
        className={'grid flex-grow grid-cols-6 lg:grid-cols-7 xl:grid-cols-6'}>
        <div className={'col-span-2 hidden md:flex xl:col-span-1'}>
          <SideNav />
        </div>
        <div className={'col-span-6 md:col-span-4 lg:col-span-5 xl:col-span-5'}>
          <Outlet />
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav />
      </div>
    </>
  );
}
