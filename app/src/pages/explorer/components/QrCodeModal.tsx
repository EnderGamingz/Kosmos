import QRCode from 'react-qr-code';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import tw from '@utils/classMerge.ts';

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
      <PopoverTrigger>
        <button className={tw(button && 'btn-white')}>
          <QrCodeIcon className={'h-5 w-5 text-stone-700'} />
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className={'w-full bg-white p-4'}>
          <QRCode value={value} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
