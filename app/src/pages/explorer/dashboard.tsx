import { Outlet } from 'react-router-dom';
import { SideNav } from './sideNav.tsx';

export default function Dashboard() {
  return (
    <div
      className={
        'grid flex-grow grid-cols-6 flex-col lg:grid-cols-7 xl:grid-cols-6'
      }>
      <div
        className={
          'absolute flex w-4/5 sm:w-1/2 md:relative md:col-span-2 md:w-[unset] lg:col-span-2 xl:col-span-1'
        }>
        <SideNav />
      </div>
      <div className={'col-span-6 md:col-span-4 lg:col-span-5 xl:col-span-5'}>
        <Outlet />
      </div>
    </div>
  );
}
