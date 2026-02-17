import {
  getAdminTitle,
  getSettingsTitle,
  getSocialTitle,
  getTitle,
} from '@utils/metadata.ts';

export function DefaultMetadata() {
  return <title>{getTitle()}</title>;
}

export function PageMetadata({ title }: { title: string }) {
  return <title>{getTitle(title)}</title>;
}

export function AdminPageMetadata({ title }: { title?: string }) {
  return <title>{getAdminTitle(title)}</title>;
}

export function SettingsPageMetadata({ title }: { title?: string }) {
  return <title>{getSettingsTitle(title)}</title>;
}

export function SocialPageMetadata({ title }: { title?: string }) {
  return <title>{getSocialTitle(title)}</title>;
}
