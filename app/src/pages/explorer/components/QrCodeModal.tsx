import QRCode from 'react-qr-code';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { QrCodeIcon } from '@heroicons/react/24/outline';

export default function QrCodeModal({ value }: { value: string }) {
  return (
    <Popover>
      <PopoverTrigger>
        <button>
          <QrCodeIcon className={'h-5 w-5 text-stone-700'} />
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
