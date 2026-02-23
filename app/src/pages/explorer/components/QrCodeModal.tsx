import QRCode from 'react-qr-code';
import type { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverTrigger } from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { QrCode } from 'lucide-react';

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
          className={cn(
            'bg-transparent',
            button ? 'border-primary' : 'h-5 w-5 hover:bg-transparent',
          )}
        >
          <QrCode className={'h-5 w-5 text-stone-700 dark:text-stone-300'} />
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={'w-full bg-white dark:bg-stone-800 grid place-items-center'}>
        <QRCode value={value} />
      </PopoverContent>
    </Popover>
  );
}
