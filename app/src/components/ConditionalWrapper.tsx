import { ReactNode } from 'react';

export default function ConditionalWrapper({
  condition,
  wrapper,
  children,
  alt,
}: {
  condition?: boolean;
  wrapper: (x: ReactNode) => ReactNode;
  children: ReactNode;
  alt?: (x: ReactNode) => ReactNode;
}) {
  return condition ? wrapper(children) : alt ? alt(children) : children;
}
