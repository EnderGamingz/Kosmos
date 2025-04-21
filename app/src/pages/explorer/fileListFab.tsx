import { cn } from '@lib/utils.ts';
import { type MouseEvent, useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backdrop } from '@components/overlay/backdrop.tsx';
import { FileWindowContextMenu } from '@components/contextMenu/menus/fileWindowContextMenu.tsx';
import { Link } from 'react-router-dom';

export function FileListFab({ hide }: { hide: boolean }) {
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
          hide && '!opacity-0 !pointer-events-none',
        )}>
        <AnimatePresence>
          <motion.div layout key={'fab-social'}>
            <Link
              to={'/social'}
              className={
                'flex bg-popover shadow-md hover:shadow-lg border p-3 rounded-md hover:bg-border transition-colors cursor-pointer'
              }>
              <MessageSquare className={'w-5 h-5'} />
            </Link>
          </motion.div>
          {create ? (
            <motion.div
              key={'fab-create'}
              layoutId={'fab-create'}
              className={
                'bg-popover shadow-lg p-3 rounded-md flex flex-col gap-1'
              }>
              <FileWindowContextMenu onClose={() => setCreate(false)} />
            </motion.div>
          ) : (
            <motion.button
              key={'fab-create'}
              layoutId={'fab-create'}
              onClick={() => setCreate(true)}
              className={
                'bg-popover shadow-md hover:shadow-lg border-2 p-6 rounded-md hover:bg-border transition-colors cursor-pointer'
              }>
              <Plus className={'w-7 h-7'} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
