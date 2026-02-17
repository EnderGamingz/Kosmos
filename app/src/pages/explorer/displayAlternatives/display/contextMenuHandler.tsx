import type { ContextMenuType } from '@hooks/useContextMenu.ts';
import { AnimatePresence } from 'framer-motion';
import { Backdrop } from '@components/overlay/backdrop.tsx';
import ExplorerContextMenu, {
  ContextMenuExplorerContent,
} from '@components/contextMenu/contextMenu.tsx';
import { createPortal } from 'react-dom';

type ContextMenuHandlerProps = {
  scrollControlMissing?: boolean;
  context: ContextMenuType;
  onClose: () => void;
};

function ContextMenuContent({
  context,
  onClose,
  scrollControlMissing,
}: ContextMenuHandlerProps) {
  return (
    <AnimatePresence>
      {context.clicked && (
        <>
          <Backdrop key={'context-backdrop'} onClose={onClose} />
          <ExplorerContextMenu
            key={'context-menu'}
            pos={context.pos}
            scrollControlMissing={scrollControlMissing}
          >
            <ContextMenuExplorerContent data={context.data} onClose={onClose} />
          </ExplorerContextMenu>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ContextMenuHandler(props: ContextMenuHandlerProps) {
  return createPortal(<ContextMenuContent {...props} />, document.body);
}
