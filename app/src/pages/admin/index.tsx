import { SideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default function AdminPage() {
  return (
    <div className={'grid flex-grow grid-cols-6 lg:grid-cols-7 xl:grid-cols-6'}>
      <Helmet titleTemplate={'%s | Admin'}>
        <title>Admin</title>
      </Helmet>
      <div className={'col-span-2 flex xl:col-span-1'}>
        <SideNav admin />
      </div>
      <div
        className={
          'col-span-4 flex flex-col p-5 md:col-span-4 lg:col-span-5 xl:col-span-5'
        }>
        <Outlet />
      </div>
    </div>
  );
}
