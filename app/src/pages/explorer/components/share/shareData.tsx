import { ShareModel } from '@models/share.ts';
import { DataOperationType } from '@models/file.ts';
import { motion } from 'framer-motion';
import { ShareItem } from '@pages/explorer/components/share/shareItem.tsx';

export function ShareData({
  shares,
  type,
  loading,
}: {
  shares?: ShareModel[];
  type: DataOperationType;
  loading?: boolean;
}) {
  const renderMessage = (message: string) => (
    <p className={'text-center text-stone-600'}>{message}</p>
  );

  if (loading) return renderMessage(`Loading ${type} data...`);

  if (!shares || shares.length === 0)
    return renderMessage(`No shares found for this ${type}`);

  return (
    <motion.ul>
      {shares.map(share => (
        <ShareItem key={share.id} share={share} />
      ))}
    </motion.ul>
  );
}
