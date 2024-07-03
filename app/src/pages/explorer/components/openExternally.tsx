import { Link } from 'react-router-dom';
import { BASE_URL } from '@lib/vars.ts';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function OpenExternally({
  id,
  overwriteUrl,
}: {
  id: string;
  overwriteUrl?: string;
}) {
  return (
    <button>
      <Link
        target={'_blank'}
        to={overwriteUrl || `${BASE_URL}auth/file/${id}/action/Serve`}>
        <ArrowTopRightOnSquareIcon />
        Open
      </Link>
    </button>
  );
}
