import { AdminQuery } from '@lib/queries/adminQuery.ts';
import { roleToString } from '@models/user.ts';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { type SubmitEventHandler, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';
import useDisclosure from '@hooks/useDisclosure.ts';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog.tsx';
import { AdminPageMetadata } from '@components/metadata.tsx';
import { Button } from '@components/ui/button.tsx';
import { Plus } from 'lucide-react';
import { Input } from '@components/ui/input.tsx';
import { StorageLimitSelector } from '@pages/admin/user/storageLimitSelector.tsx';

function UserItem({ user }: { user: UserModelDTO }) {
  const navigate = useNavigate();
  return (
    <tr
      className={'transition-colors hover:bg-stone-200 dark:hover:bg-stone-700'}
      onClick={() => navigate(`/admin/user/${user.id}`)}
    >
      <td>{user.username}</td>
      <td>{user.full_name}</td>
      <td>{user.email}</td>
      <td>{roleToString(user.role)}</td>
      <td>{formatDistanceToNow(user.created_at)}</td>
      <td>{formatDistanceToNow(user.updated_at)}</td>
    </tr>
  );
}

export default function AdminUserList() {
  const users = AdminQuery.useUsers();
  return (
    <>
      <AdminPageMetadata title={'Users'} />
      <div className={'flex items-center justify-between gap-2'}>
        <h1 className={'text-2xl font-semibold'}>Users</h1>
        <CreateUserModal />
      </div>
      <div className={'flex grow flex-col overflow-x-auto'}>
        <table
          className={
            'w-full whitespace-nowrap text-left [&_td]:p-3 [&_th]:p-3 [&_th]:font-light'
          }
        >
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {users.data?.map(user => (
              <UserItem key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CreateUserModal() {
  const notification = useNotifications(s => s.actions);
  const { isOpen, onClose, onOpenChange } = useDisclosure();
  const [limit, setLimit] = useState<number>(0);

  const createMutation = useMutation({
    mutationFn: async ({
      username,
      password,
      limit,
    }: {
      username: string;
      password: string;
      limit: number;
    }) => {
      const createId = notification.notify({
        title: 'Create user',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await AdminQuery.createUserFn(username, password, limit)
        .then(() => {
          AdminQuery.invalidateUsers().then();
          onClose();
          notification.updateNotification(createId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            description: 'User created',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(err => {
          notification.updateNotification(createId, {
            severity: Severity.ERROR,
            status: 'Error',
            description:
              err.response?.data?.error || err.response?.data || 'Error',
            timeout: 2000,
            canDismiss: true,
          });
        });
    },
  });

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    createMutation.mutate({ username, password, limit });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={'flex flex-col gap-3'}>
          <Input
            type={'text'}
            name={'username'}
            id={'username'}
            placeholder={'Username'}
            required
          />
          <Input
            type={'text'}
            name={'password'}
            id={'password'}
            placeholder={'Password'}
            required
          />
          <StorageLimitSelector limit={limit} onChange={setLimit} />
          <DialogFooter className={'mt-2'}>
            <Button type={'submit'}>
              <Plus />
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
