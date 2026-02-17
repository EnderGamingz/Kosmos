import { cn } from '@lib/utils.ts';
import { type MouseEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backdrop } from '@components/overlay/backdrop.tsx';
import { FileWindowContextMenu } from '@components/contextMenu/menus/fileWindowContextMenu.tsx';

export default function FileListFab({ hide }: { hide: boolean }) {
  const [create, setCreate] = useState(false);

  function handleClick(event: MouseEvent<HTMLDivElement>): void {
    if (!hide) event.stopPropagation();
  }

  return (
    <AnimatePresence>
      {create && (
        <Backdrop key={'fab-backdrop'} onClose={() => setCreate(false)} />
      )}
      <div
        key={'fab-container'}
        onClick={handleClick}
        className={cn(
          'z-50 hidden pointer-events-none max-md:flex flex-col max-md:pointer-events-auto',
          'absolute bottom-5 right-5 opacity-100 transition-all duration-200 items-end gap-3',
          hide && '!opacity-0 !pointer-events-none scale-70',
        )}
      >
        <AnimatePresence>
          <div
            key={'fab-create'}
            className={'animate-fade-in-bottom delay-100'}
          >
            <CreateFab open={create} onOpenChange={setCreate} />
          </div>
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

function CreateFab({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (open) {
    return (
      <motion.div
        key={'fab-create'}
        layoutId={'fab-create'}
        className={
          'bg-popover shadow-lg p-3 rounded-md flex flex-col gap-1 border border-primary/30'
        }
      >
        <FileWindowContextMenu onClose={() => onOpenChange(false)} />
      </motion.div>
    );
  }

  return (
    <motion.button
      key={'fab-create'}
      layoutId={'fab-create'}
      onClick={() => onOpenChange(true)}
      className={cn(
        'bg-popover bg-gradient-to-br from-popover to-stone-200 dark:to-stone-800 shadow-md hover:shadow-lg border border-primary/30 p-6 rounded-md hover:from-secondary transition-colors',
      )}
    >
      <Plus className={'w-8 h-8'} />
    </motion.button>
  );
}
