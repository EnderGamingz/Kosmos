import { useUserState } from '@stores/userStore.ts';
import { useEffect, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useInitializeKeys } from '@hooks/useInitKeys.ts';
import { Role } from '@models/user.ts';
import Header from '@components/header';
import NotificationIndicator from '@components/notifications';
import SystemMessage from '@components/overlay/systemMessage.tsx';
import { DefaultMetadata } from '@components/metadata.tsx';
import Websocket from '@components/socket/Websocket.tsx';
import SocialUpdateOverlay from '@components/notifications/socialUpdate';
import { useServiceWorker } from '@hooks/serviceWorker.tsx';

const Register = lazy(() => import('@pages/register.tsx'));
const Login = lazy(() => import('@pages/login.tsx'));
const AccessWrapper = lazy(() => import('./accessWrapper.tsx'));
const Dashboard = lazy(() => import('@pages/explorer/dashboard.tsx'));
const FileList = lazy(() => import('@pages/explorer/fileList.tsx'));
const Settings = lazy(() => import('@pages/settings/index.tsx'));
const BinPage = lazy(() => import('@pages/explorer/pages/bin.tsx'));
const RecentFiles = lazy(() => import('@pages/explorer/pages/recent.tsx'));
const Preferences = lazy(() => import('@pages/settings/preferences'));
const AccountSettings = lazy(() => import('@pages/settings/account'));
const SharePage = lazy(() => import('@pages/share'));
const SharedItems = lazy(() => import('@pages/explorer/pages/shared.tsx'));
const SecuritySettings = lazy(() => import('@pages/settings/security'));
const AppInfo = lazy(() => import('@pages/settings/appInfo.tsx'));
const UsageReport = lazy(() => import('@pages/usage/report'));
const FileListByType = lazy(() => import('@pages/explorer/fileListByType.tsx'));
const HomePage = lazy(() => import('@pages/home'));
const AdminPage = lazy(() => import('@pages/admin'));
const AdminUserList = lazy(() => import('@pages/admin/user/list.tsx'));
const AdminUser = lazy(() => import('@pages/admin/user/single.tsx'));
const DismissedOverview = lazy(() => import('@pages/settings/dismissed'));
const SearchPage = lazy(() => import('@pages/explorer/pages/search.tsx'));
const FavoritesPage = lazy(() => import('@pages/explorer/pages/favorites.tsx'));
const AlbumsPage = lazy(() => import('@pages/explorer/pages/albums/all'));
const AlbumPage = lazy(() => import('@pages/explorer/pages/albums/single'));
const QuickSharePage = lazy(() => import('@pages/explorer/pages/quick'));
const ProfileSettings = lazy(() => import('@pages/settings/profile'));
const SocialRouter = lazy(() => import('@pages/social/router.tsx'));

export default function Router() {
  const fetchUser = useUserState(s => s.fetchUser);

  useInitializeKeys();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useServiceWorker();

  return (
    <BrowserRouter>
      <DefaultMetadata />
      <Header />
      <main className={'relative flex flex-grow flex-col'}>
        <Routes>
          <Route
            path={'social/*'}
            element={<AccessWrapper el={<SocialRouter />} page={'Social'} />}>
            <Route path={'*'} element={<SocialRouter />} />
          </Route>
          <Route path={'auth/register'} element={<Register />} />
          <Route path={'auth/login'} element={<Login />} />
          <Route
            path={'home'}
            element={<AccessWrapper el={<Dashboard />} page={'Dashboard'} />}>
            <Route path={'quick'} element={<QuickSharePage />} />
            <Route path={'files/:fileType'} element={<FileListByType />} />
            <Route path={'album'} element={<AlbumsPage />} />
            <Route path={'album/:albumId'} element={<AlbumPage />} />

            <Route path={'recent'} element={<RecentFiles />} />
            <Route
              path={'shared'}
              element={<SharedItems itemsForUser={false} />}
            />
            <Route
              path={'shares'}
              element={<SharedItems itemsForUser={true} />}
            />
            <Route path={'bin'} element={<BinPage />} />
            <Route path={'favorites'} element={<FavoritesPage />} />
            <Route path={'search'} element={<SearchPage />} />
            <Route path={'folder/:folder'} element={<FileList />} />
            <Route index element={<FileList />} />
          </Route>
          <Route
            path={'settings'}
            element={<AccessWrapper el={<Settings />} page={'Settings'} />}>
            <Route path={'dismissed'} element={<DismissedOverview />} />
            <Route path={'preferences'} element={<Preferences />} />
            <Route path={'account'} element={<AccountSettings />} />
            <Route path={'security'} element={<SecuritySettings />} />
            <Route path={'profile'} element={<ProfileSettings />} />
            <Route path={'info'} element={<AppInfo />} />
            <Route index element={<AccountSettings />} />
          </Route>
          <Route
            path={'admin'}
            element={
              <AccessWrapper
                el={<AdminPage />}
                page={'Admin'}
                role={Role.Admin}
              />
            }>
            <Route path={'user'} element={<AdminUserList />} />
            <Route path={'user/:id'} element={<AdminUser />} />
          </Route>
          <Route path={'/usage/report'} element={<UsageReport />} />

          {/* Public Share */}
          <Route path={'s/:type/:uuid/*'} element={<SharePage />} />

          <Route path={'/'} element={<HomePage />} />
        </Routes>
      </main>
      <NotificationIndicator />
      <SystemMessage />
      <Websocket />
      <SocialUpdateOverlay />
    </BrowserRouter>
  );
}
