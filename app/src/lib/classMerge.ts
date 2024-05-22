import { twMerge } from 'tailwind-merge';
import cx from 'classnames';

export default function cn(...args: (string | boolean)[]) {
  return twMerge(cx(args));
}
