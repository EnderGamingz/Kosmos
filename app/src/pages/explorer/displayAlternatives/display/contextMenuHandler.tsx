import { ContextMenuType } from '@hooks/useContextMenu.ts';
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

function ContextMenuContent(
  props: Omit<ContextMenuHandlerProps, 'scrollControlMissing'>,
) {
  let { context, onClose } = props;
  if (!context.clicked) return null;

  return (
    <AnimatePresence>
      <Backdrop onClose={onClose} />
      <ExplorerContextMenu pos={context.pos}>
        <ContextMenuExplorerContent data={context.data} onClose={onClose} />
      </ExplorerContextMenu>
    </AnimatePresence>
  );
}

export default function ContextMenuHandler({
  scrollControlMissing,
  context,
  onClose,
}: ContextMenuHandlerProps) {
  if (scrollControlMissing) return null;

  return createPortal(
    <ContextMenuContent context={context} onClose={onClose} />,
    document.body,
  );
}
