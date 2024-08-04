import { ShareModel } from '@models/share.ts';
import { ShareOperationType } from '@models/file.ts';
import { motion } from 'framer-motion';
import { ShareItem } from '@pages/explorer/components/share/shareItem.tsx';
import { containerVariant } from '@components/defaults/transition.ts';

const renderMessage = (message: string) => (
  <p className={'text-center text-stone-600'}>{message}</p>
);

export function ShareData({
  shares,
  type,
  loading,
}: {
  shares?: ShareModel[];
  type: ShareOperationType;
  loading?: boolean;
}) {
  if (loading) return renderMessage(`Loading ${type} data...`);

  if (!shares || shares.length === 0)
    return renderMessage(`No shares found for this ${type}`);

  return (
    <motion.ul
      className={'space-y-2'}
      variants={containerVariant()}
      initial={'hidden'}
      animate={'show'}>
      {shares.map(share => (
        <ShareItem key={share.id} type={type} share={share} />
      ))}
    </motion.ul>
  );
}
