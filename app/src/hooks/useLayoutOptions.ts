import { createContext, use } from 'react';
import { MobileViewType, usePreferenceStore } from '@stores/preferenceStore.ts';
import useMediaQuery from '@hooks/useMediaQuery.ts';

type LayoutOptions = {
  isDesktop: boolean;
  isMobile: boolean;
  shouldUseMobileView: boolean;
};

export function useDefaultLayoutOptions(): LayoutOptions {
  const mobileViewEnabled = usePreferenceStore(
    s => s.mobileView.type === MobileViewType.Enabled,
  );
  const isDesktop = useMediaQuery('(width >= 48rem)');
  const isMobile = !isDesktop;

  return {
    isDesktop,
    isMobile,
    shouldUseMobileView: mobileViewEnabled && isMobile,
  };
}

export const LayoutOptionsContext = createContext<LayoutOptions>({} as never);

export default function useLayoutOptions() {
  return use(LayoutOptionsContext);
}
