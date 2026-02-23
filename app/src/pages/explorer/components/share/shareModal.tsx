import { useExplorerStore } from '@stores/explorerStore.ts';
import { AnimatePresence } from 'framer-motion';
import type { ShareOperationType } from '@models/file.ts';
import { useEffect, useState } from 'react';
import { useUserShareData } from '@lib/query.ts';
import { ShareData } from '@pages/explorer/components/share/shareData.tsx';
import { CreateShare } from '@pages/explorer/components/share/create/createShare.tsx';
import { cn } from '@lib/utils.ts';
import { Plus, X } from 'lucide-react';
import {
  Sheet,
  SheetBodyTransform,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet.tsx';
import { Button } from '@components/ui/button.tsx';

export default function ShareModal() {
  const { shareElementId, shareElementType, clearShareElement } =
    useExplorerStore(s => s.share);
  const hasShare = !!shareElementId && !!shareElementType;

  return (
    <>
      {hasShare && <SheetBodyTransform />}
      <Sheet open={hasShare} onOpenChange={clearShareElement}>
        <SheetContent className={'gap-0'}>
          <ShareSheetContent
            shareElementId={shareElementId!}
            shareElementType={shareElementType!}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ShareSheetContent({
  shareElementId,
  shareElementType,
}: {
  shareElementId: string;
  shareElementType: ShareOperationType;
}) {
  const data = useUserShareData(shareElementId, shareElementType);
  const [create, setCreate] = useState(data.data?.length === 0);

  useEffect(() => {
    if (data.data?.length === 0) {
      setCreate(true);
    }
  }, [data.data]);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{`Share ${shareElementType}`}</SheetTitle>
        <SheetDescription>
          {data.data?.length
            ? `${data.data.length} share${data.data.length > 1 ? 's' : ''} created`
            : 'No share yet'}
        </SheetDescription>
      </SheetHeader>
      <div className={'px-3'}>
        <Button
          variant={'outline'}
          onClick={() => setCreate(prev => !prev)}
          className={'w-full'}
        >
          <Plus
            className={cn('h-4 w-4  transition-all', create && 'rotate-45')}
          />
          {create ? 'Cancel creation' : 'Create new'}
        </Button>
        <div
          className={
            'mb-3 flex h-full flex-col overflow-y-auto px-1 py-3 scrollbar-hide'
          }
        >
          <AnimatePresence>
            {create ? (
              <CreateShare
                onDone={() => setCreate(false)}
                dataType={shareElementType}
                id={shareElementId}
              />
            ) : (
              <ShareData
                shares={data.data}
                type={shareElementType}
                loading={data.isLoading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant={'ghost'}>
            <X />
            Close
          </Button>
        </SheetClose>
      </SheetFooter>
    </>
  );
}
