import { Outlet } from 'react-router-dom';
import { SideNav } from './sideNav.tsx';

export default function Dashboard() {
  return (
    <div className={'grid flex-grow grid-cols-6'}>
      <div className={'col-span-1 flex'}>
        <SideNav />
      </div>
      <div className={'col-span-5'}>
        <Outlet />
      </div>
    </div>
  );
}
