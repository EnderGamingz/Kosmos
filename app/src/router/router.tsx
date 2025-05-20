import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import AppScreen from '@components/overlay/appScreen.tsx';
import { DefaultMetadata } from '@components/metadata.tsx';
import Header from '@components/header';
import SystemMessage from '@components/overlay/systemMessage.tsx';
import Websocket from '@components/socket/Websocket.tsx';
import AccessWrapper from '@/accessWrapper.tsx';
import { Role } from '@models/user.ts';

const NotificationIndicator = lazy(() => import('@components/notifications'));
const SocialUpdateOverlay = lazy(
  () => import('@components/notifications/socialUpdate'),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<AppScreen loading showText logo />}>
        <DefaultMetadata />
        <Header />
        <main className={'relative flex flex-grow flex-col'}>
          <Outlet />
        </main>
        <NotificationIndicator />
        <SystemMessage />
        <Websocket />
        <SocialUpdateOverlay />
      </Suspense>
    ),
    children: [
      {
        path: '/',
        lazy: {
          Component: async () => (await import('@pages/home')).default,
        },
      },
      {
        path: 'auth',
        children: [
          {
            path: 'register',
            lazy: {
              Component: async () =>
                (await import('@pages/register.tsx')).default,
            },
          },
          {
            path: 'login',
            lazy: {
              Component: async () => (await import('@pages/login.tsx')).default,
            },
          },
        ],
      },
      {
        path: 'home',
        lazy: {
          element: async () => {
            const Dashboard = (await import('@pages/explorer/dashboard.tsx'))
              .default;
            return <AccessWrapper el={<Dashboard />} page={'Dashboard'} />;
          },
        },
        children: [
          {
            index: true,
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/fileList.tsx')).default,
            },
          },
          {
            path: 'recent',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/recent.tsx')).default,
              loader: async () =>
                (await import('@lib/query')).prefetchRecentFiles,
            },
          },
          {
            path: 'bin',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/bin.tsx')).default,
              loader: async () =>
                (await import('@lib/query')).prefetchDeletedFiles,
            },
          },
          {
            path: 'favorites',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/favorites.tsx')).default,
            },
          },
          {
            path: 'search',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/search.tsx')).default,
            },
          },
          {
            path: 'album',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/albums/all')).default,
            },
          },
          {
            path: 'album/:albumId',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/albums/single')).default,
            },
          },
          {
            path: 'quick',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/quick')).default,
            },
          },
          {
            path: 'files/:fileType',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/fileListByType.tsx')).default,
            },
          },
          {
            path: 'folder/:folder',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/fileList.tsx')).default,
            },
          },
          {
            path: 'share/*',
            lazy: {
              Component: async () =>
                (await import('@pages/explorer/pages/shared.tsx')).default,
            },
          },
        ],
      },
      {
        path: 'social',
        lazy: {
          element: async () => {
            const Wrapper = (await import('@pages/social/router.tsx')).default;
            return <AccessWrapper el={<Wrapper />} page={'Social'} />;
          },
        },
        children: [
          {
            index: true,
            lazy: {
              Component: async () =>
                (await import('@pages/social/home')).default,
            },
          },
          {
            path: 'contacts',
            lazy: {
              Component: async () =>
                (await import('@pages/social/contacts')).default,
            },
          },
          {
            path: 'chats',
            lazy: {
              Component: async () =>
                (await import('@pages/social/chats')).default,
            },
            children: [
              {
                index: true,
                lazy: {
                  Component: async () =>
                    (await import('@pages/social/chats')).ChatsHome,
                },
              },
              {
                path: 'user/:userId',
                lazy: {
                  element: async () => {
                    const ChatPage = (await import('@pages/social/chats/chat'))
                      .default;
                    return <ChatPage personalChat />;
                  },
                },
              },
              {
                path: 'group/:chatId',
                lazy: {
                  element: async () => {
                    const ChatPage = (await import('@pages/social/chats/chat'))
                      .default;
                    return <ChatPage personalChat={false} />;
                  },
                },
              },
            ],
          },
        ],
      },
      {
        path: 'settings',
        lazy: {
          element: async () => {
            const Wrapper = (await import('@pages/settings')).default;
            return <AccessWrapper el={<Wrapper />} page={'Settings'} />;
          },
        },
        children: [
          {
            index: true,
            lazy: {
              Component: async () =>
                (await import('@pages/settings/account')).default,
            },
          },
          {
            path: 'info',
            lazy: {
              Component: async () =>
                (await import('@pages/settings/appInfo.tsx')).default,
            },
          },
          {
            path: 'notifications',
            lazy: {
              Component: async () =>
                (await import('@pages/settings/notifications')).default,
            },
          },
          {
            path: 'security',
            lazy: {
              Component: async () =>
                (await import('@pages/settings/security')).default,
            },
          },
          {
            path: 'profile',
            lazy: {
              Component: async () =>
                (await import('@pages/settings/profile')).default,
              loader: async () =>
                (await import('@lib/queries/profileQuery.ts')).ProfileQuery
                  .prefetchProfileSelf,
            },
          },
          {
            path: 'preferences',
            lazy: {
              Component: async () =>
                (await import('@pages/settings/preferences')).default,
            },
          },
          {
            path: 'account',
            lazy: {
              Component: async () =>
                (await import('@pages/settings/account')).default,
            },
          },
        ],
      },
      {
        path: 'admin',
        lazy: {
          element: async () => {
            const Wrapper = (await import('@pages/admin')).default;
            return (
              <AccessWrapper
                el={<Wrapper />}
                page={'Admin'}
                role={Role.Admin}
              />
            );
          },
        },
        children: [
          {
            path: 'user',
            lazy: {
              Component: async () =>
                (await import('@pages/admin/user/list.tsx')).default,
            },
          },
          {
            path: 'user/:id',
            lazy: {
              Component: async () =>
                (await import('@pages/admin/user/single.tsx')).default,
            },
          },
        ],
      },
      {
        path: 'usage',
        children: [
          {
            path: 'report',
            lazy: {
              Component: async () =>
                (await import('@pages/usage/report')).default,
            },
          },
        ],
      },
      {
        path: 's/:type/:uuid/*',
        lazy: {
          Component: async () => (await import('@pages/share')).default,
        },
      },
    ],
  },
  {
    path: '*',
    lazy: {
      Component: async () => (await import('@pages/NotFound.tsx')).default,
    },
  },
]);
