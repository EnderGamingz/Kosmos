import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className={'container'}>
      <Outlet />
    </div>
  );
}
