import { Outlet } from 'react-router-dom';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { ExplorerSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';

export default function Settings() {
  return (
    <>
      <SettingsPageMetadata />
      <div
        className={
          'flex grow overflow-y-auto max-h-[calc(100dvh-90px)] max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <div className={'w-64 hidden md:flex'}>
          <ExplorerSideNav source={'settings'} />
        </div>
        <div className={'grow p-5 max-w-5xl w-full mx-auto'}>
          <div className={'pb-10'}>
            <Outlet />
          </div>
        </div>
      </div>
      <div className={'sticky bottom-0 hidden max-md:block'}>
        <BottomNav source={'settings'} />
      </div>
    </>
  );
}
export { SettingsTitle } from '@pages/settings/settingsTitle.tsx';
