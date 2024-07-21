import { BASE_URL } from '@lib/env.ts';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function OpenExternally({
  id,
  overwriteUrl,
}: {
  id: string;
  overwriteUrl?: string;
}) {
  const openInNew = () =>
    window.open(
      overwriteUrl || `${BASE_URL}auth/file/${id}/action/Serve`,
      '_blank',
    );

  return (
    <button onClick={openInNew}>
      <ArrowTopRightOnSquareIcon />
      Open
    </button>
  );
}
