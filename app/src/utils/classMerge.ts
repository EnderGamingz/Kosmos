import { twMerge } from 'tailwind-merge';
import { cn } from '@nextui-org/react';

export default function tw(...args: (string | boolean)[]) {
  return twMerge(cn(args));
}
