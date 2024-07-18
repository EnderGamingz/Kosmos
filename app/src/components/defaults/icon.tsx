import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';

const ApplicationIcon = (
  props: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
) => {
  return (
    <img {...props} src={'/img/logo_outline_full.svg'} alt={'Kosmos Logo'} />
  );
};

export default ApplicationIcon;
