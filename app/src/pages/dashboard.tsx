import { FileUpload } from './file/fileUpload.tsx';
import CreateFolder from './folder/createFolder.tsx';
import { Outlet } from 'react-router-dom';
import { useUserState } from '../stores/userStore.ts';

export default function Dashboard() {
  const user = useUserState(s => s.user);

  return (
    <div className={'container'}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div className={'grid grid-cols-3 gap-5'}>
        <FileUpload />
        <CreateFolder />
      </div>
      <Outlet />
    </div>
  );
}
