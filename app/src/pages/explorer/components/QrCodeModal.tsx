import QRCode from 'react-qr-code';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

import { cn } from '@lib/utils.ts';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverTrigger } from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';

export default function QrCodeModal({
  value,
  children,
  button = false,
}: {
  value: string;
  children?: ReactNode;
  button?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={button ? 'outline' : 'ghost'}
          className={cn(button && 'bg-transparent border-primary')}>
          <QrCodeIcon
            className={'h-5 w-5 text-stone-700 dark:text-stone-300'}
          />
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={'w-full bg-white'}>
        <QRCode value={value} />
      </PopoverContent>
    </Popover>
  );
}
