import { SettingsPageMetadata } from '@components/metadata.tsx';

export default function ProfileSettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Profile</h1>
      <SettingsPageMetadata title={'Profile'} />
    </div>
  );
}
