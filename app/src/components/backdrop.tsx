import { motion } from 'framer-motion';

export function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onContextMenu={e => {
          e.preventDefault();
          onClose();
        }}
        onClick={onClose}
        className={
          'fixed inset-0 z-50 !m-0 h-screen w-screen bg-overlay/30 !p-0 backdrop-blur-sm backdrop-saturate-150'
        }
      />
    </>
  );
}
