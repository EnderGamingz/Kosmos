import { ReactNode } from 'react';

export default function ContextMenu({
  children,
  onClose,
  pos,
}: {
  children: ReactNode;
  onClose: () => void;
  pos: { x: number; y: number };
}) {
  return (
    <>
      <style>
        {`
            .file-list {
              user-select: none;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              overflow: hidden !important;
              padding-right: 4px;
            }
          `}
      </style>
      <div
        className={'absolute z-50'}
        style={{ left: pos.x, top: pos.y }}
        onContextMenu={e => e.preventDefault()}>
        <div onClick={onClose}>close</div>
        {children}
      </div>
    </>
  );
}
