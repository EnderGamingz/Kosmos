import { SettingsPageMetadata } from '@components/metadata.tsx';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import ProfileInfoSettings from '@pages/settings/profile/profileInfo.tsx';
import ProfilePictureSettings from '@pages/settings/profile/profilePicture.tsx';

export default function ProfileSettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Profile</h1>
      <SettingsPageMetadata title={'Profile'} />
      <ProfilePictureSettings />
      <FetchBoundary fetchGoal={'profile'}>
        <ProfileInfoSettings />
      </FetchBoundary>
    </div>
  );
}
