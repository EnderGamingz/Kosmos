import { motion } from 'framer-motion';

export function ShareMessage({
  text,
  loading,
  subText,
}: {
  text: string;
  loading?: boolean;
  subText?: string;
}) {
  return (
    <div className={'flex flex-grow items-center justify-center'}>
      <div
        className={'flex flex-col items-center gap-2 text-xl text-stone-600'}>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={'app-loading-indicator !h-7 !w-7 !border-t-stone-700'}
          />
        )}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}>
          {text}
        </motion.p>
        {subText && (
          <motion.p
            className={'text-sm'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}>
            {subText}
          </motion.p>
        )}
      </div>
    </div>
  );
}
