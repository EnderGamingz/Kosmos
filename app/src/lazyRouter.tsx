import { lazy, Suspense } from 'react';
import AppScreen from '@components/overlay/appScreen.tsx';

const Router = lazy(() => import('./router.tsx'));

export default function LazyRouter() {
  return (
    <Suspense fallback={<AppScreen logo loading />}>
      <Router />
    </Suspense>
  );
}
