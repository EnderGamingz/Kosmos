import { minidenticon } from 'minidenticons';
import { useMemo } from 'react';

type Props = {
  username: string;
  saturation?: number;
  lightness?: number;
};

export function MinidentIcon({
  username,
  saturation = 50,
  lightness = 50,
}: Props) {
  const src = useMemo(
    () => getMinidentIconSrc({ username, saturation, lightness }),
    [username, saturation, lightness],
  );

  return <img src={src} alt={username} />;
}

// noinspection SpellCheckingInspection
export function getMinidentIconSrc({
  username,
  saturation = 50,
  lightness = 50,
}: Props) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(minidenticon(username, saturation, lightness))
  );
}
