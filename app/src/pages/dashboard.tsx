import { useUserState } from '../stores/userStore.ts';
import { FileUpload } from './file/fileUpload.tsx';

export default function Dashboard() {
  const user = useUserState(s => s.user);
  return (
    <div className={'container'}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <FileUpload />
    </div>
  );
}
