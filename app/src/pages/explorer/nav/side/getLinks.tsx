import {
  getAdminLinks,
  getExplorerLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';
import { getSettingsLinks } from '@pages/settings/links.tsx';

export type LinkSource = 'default' | 'admin' | 'settings';

export function getLinks(source: LinkSource, binUsage?: string) {
  switch (source) {
    case 'admin':
      return getAdminLinks();
    case 'settings':
      return getSettingsLinks();
    default:
      return getExplorerLinks(binUsage);
  }
}
