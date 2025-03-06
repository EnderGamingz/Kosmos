import { SettingsPageMetadata } from '@components/metadata.tsx';
import FetchBoundary from '@components/wrappers/fetch.tsx';
import ProfileInfoSettings from '@pages/settings/profile/profileInfo.tsx';
import ProfilePictureSettings from '@pages/settings/profile/profilePicture.tsx';
import { SettingsTitle } from '@pages/settings';

export default function ProfileSettings() {
  return (
    <div className={'space-y-3'}>
      <SettingsTitle title={'Profile'} />
      <SettingsPageMetadata title={'Profile'} />
      <ProfilePictureSettings />
      <hr className={'my-5'} />
      <FetchBoundary fetchGoal={'profile'}>
        <ProfileInfoSettings />
      </FetchBoundary>
    </div>
  );
}
