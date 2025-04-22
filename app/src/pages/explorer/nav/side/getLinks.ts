import {
  getAdminLinks,
  getExplorerLinks,
  getSocialLinks,
} from '@pages/explorer/nav/explorerLinks.tsx';
import { getSettingsLinks } from '@pages/settings/links.tsx';

export type LinkSource = 'default' | 'admin' | 'settings' | 'social';

export function getLinks(source: LinkSource, binUsage?: string) {
  switch (source) {
    case 'admin':
      return getAdminLinks();
    case 'settings':
      return getSettingsLinks();
    case 'social':
      return getSocialLinks();
    case 'default':
    default:
      return getExplorerLinks(binUsage);
  }
}
