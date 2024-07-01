import { ShareModel } from '@models/share.ts';

export function ShareItem({ share }: { share: ShareModel }) {
  return (
    <li className={'flex gap-2'}>
      <pre>{JSON.stringify(share, null, 2)}</pre>
    </li>
  );
}