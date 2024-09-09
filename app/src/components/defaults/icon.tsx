import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import { Theme, usePreferenceStore } from '@stores/preferenceStore.ts';

const ApplicationIcon = (
  props: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
) => {
  const darkMode = usePreferenceStore(s => s.theme.type === Theme.Dark);
  const logoSrc = darkMode
    ? '/img/logo_outline_full_white.svg'
    : '/img/logo_outline_full.svg';
  return <img {...props} src={logoSrc} alt={'Kosmos Logo'} />;
};

export default ApplicationIcon;
