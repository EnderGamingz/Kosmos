import { useIsRouteLoading } from '@hooks/isRouteLoading.ts';
import { Progress } from '@components/ui/progress.tsx';

export function RouterLoading() {
  const isLoading = useIsRouteLoading();

  if (isLoading) {
    return (
      <Progress
        color={'primary'}
        indeterminate
        className={
          'z-[1000] h-[4px] fixed top-0 left-0 right-0 bg-transparent animate-fade-in'
        }
        indicatorClassName={'bg-primary'}
      />
    );
  }

  return null;
}
