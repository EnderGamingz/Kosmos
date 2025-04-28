import {
  ExplorerLink,
  getAdditionalLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';
import { useAppState } from '@stores/appStateStore.ts';
import { useEffect } from 'react';

export function useHeaderMenu({ links }: { links: ExplorerLink[] }) {
  const { clearHeaderLinks, setHeaderLinks } = useAppState();

  useEffect(() => {
    const explorerLinks = getAdditionalLinks(links);
    setHeaderLinks(explorerLinks);
    return () => {
      clearHeaderLinks();
    };
  }, [links]);
}
