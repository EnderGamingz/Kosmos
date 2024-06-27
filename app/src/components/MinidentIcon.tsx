import { minidenticon } from 'minidenticons';
import { useMemo } from 'react';

type Props = {
  username: string;
  saturation?: number;
  lightness?: number;
  [key: string]: unknown;
};

const MinidenticonImg = ({
  username,
  saturation = 50,
  lightness = 50,
  ...props
}: Props) => {
  const svgURI = useMemo(
    () =>
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness],
  );

  return <img src={svgURI} alt={username} {...props} />;
};

export default MinidenticonImg;
