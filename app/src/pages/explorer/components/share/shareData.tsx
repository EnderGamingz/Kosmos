import type { ShareOperationType } from '@models/file.ts';
import { ShareItem } from '@pages/explorer/components/share/shareItem.tsx';
import type { ExtendedShareModelDTO } from '@bindings/ExtendedShareModelDTO.ts';

const renderMessage = (message: string) => (
  <p className={'text-center text-stone-600 dark:text-stone-400'}>{message}</p>
);

export function ShareData({
  shares,
  type,
  loading,
}: {
  shares?: ExtendedShareModelDTO[];
  type: ShareOperationType;
  loading?: boolean;
}) {
  if (loading) return renderMessage(`Loading ${type} data...`);

  if (!shares || shares.length === 0)
    return renderMessage(`No shares found for this ${type}`);

  return (
    <ul className={'space-y-2'}>
      {shares.map((share, i) => (
        <ShareItem key={share.id} type={type} share={share} index={i} />
      ))}
    </ul>
  );
}
