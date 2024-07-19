import { DetailedHTMLProps, ImgHTMLAttributes, memo } from 'react';

const Image = (
  props: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > & {
    src: string;
    alt: string;
  },
) => {
  return <img {...props} src={props.src} alt={props.alt} />;
};

const NoData = memo(({ className }: { className?: string }) => (
  <Image
    src={'/img/illustrations/no_data.svg'}
    alt={'No data'}
    className={className}
  />
));

const Illustration = { NoData };

export default Illustration;
