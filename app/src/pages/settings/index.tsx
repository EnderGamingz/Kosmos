import { Outlet } from 'react-router-dom';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { ExplorerSideNav } from '@pages/explorer/nav/side/sideNav.tsx';
import BottomNav from '@pages/explorer/nav/bottom/bottomNav.tsx';
import { cn } from '@lib/utils.ts';

export default function SettingsPagesWrapper() {
  return (
    <>
      <SettingsPageMetadata />
      <div className={'flex grow'}>
        <div className={'w-64 hidden md:flex'}>
          <ExplorerSideNav source={'settings'} />
        </div>
        <div
          className={cn(
            'grow p-5 max-w-5xl w-full mx-auto overflow-y-auto max-h-[calc(100dvh-90px)] max-md:max-h-[calc(100dvh-90px-80px)]',
            'bg-primary-foreground/50 rounded-xl md:mb-2 md:mr-2',
          )}
        >
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
