import { useNavigate, useParams } from 'react-router-dom';
import { AdminQuery, AdminUserUpdate } from '@lib/queries/adminQuery.ts';
import { Role, roleToString } from '@models/user.ts';
import { UsageReportStats } from '@pages/usage/report/usageReportStats.tsx';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { FormEvent } from 'react';
import { UserModelDTO } from '@bindings/UserModelDTO.ts';
import useDisclosure from '@/hooks/useDisclosure';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { PageMetadata } from '@components/metadata.tsx';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import { Pen, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select.tsx';

export default function AdminUser() {
  const { id } = useParams();

  const { data } = AdminQuery.useUser(id);
  const storageUsage = AdminQuery.useUserUsage(id);

  if (!id || !data) return <>Not Found</>;

  return (
    <div>
      <PageMetadata title={`${data.username} | User`} />
      <div className={'grid grid-cols-2 gap-5'}>
        <UserInfoItem label={'ID'} value={data.id} />
        <UserInfoItem label={'Username'} value={data.username} />
        <UserInfoItem label={'Email'} value={data.email} />
        <UserInfoItem label={'Role'} value={roleToString(data.role)} />
        <UserInfoItem label={'Full Name'} value={data.full_name} />
        <UserInfoItem label={'Created At'} value={data.created_at} />
        <UserInfoItem label={'Updated At'} value={data.updated_at} />
      </div>
      {storageUsage.data && <UsageReportStats usage={storageUsage.data} />}
      <div className={'mt-5 flex gap-2'}>
        <AdminDeleteUser user={data} />
        <AdminUpdateUserModal user={data} />
      </div>
    </div>
  );
}

function AdminDeleteUser({ user }: { user: UserModelDTO }) {
  const notification = useNotifications(s => s.actions);
  const navigate = useNavigate();

  const deleteAction = useMutation({
    mutationFn: async () => {
      const deleteId = notification.notify({
        title: 'Delete user',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await AdminQuery.deleteUserFn(user.id)
        .then(() => {
          navigate('/admin/user');
          AdminQuery.invalidateUsers().then();
          notification.updateNotification(deleteId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            description: 'User deleted',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(err => {
          notification.updateNotification(deleteId, {
            severity: Severity.ERROR,
            status: 'Error',
            description:
              err.response?.data?.error || err.response?.data || 'Error',
            canDismiss: true,
          });
        });
    },
  });

  return (
    <Button
      className={'cursor-pointer'}
      onClick={() => deleteAction.mutate()}
      variant={'destructive'}>
      <Trash2 />
      Delete User
    </Button>
  );
}

function UserInfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div
      className={
        'space-y-2 rounded-xl bg-stone-300 p-2 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
      }>
      <p className={'text-lg'}>{label}</p>
      <span>{value ?? 'N/A'}</span>
    </div>
  );
}

export function AdminUpdateUserModal({ user }: { user: UserModelDTO }) {
  const notification = useNotifications(s => s.actions);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const updateMutation = useMutation({
    mutationFn: async (data: AdminUserUpdate) => {
      const updateId = notification.notify({
        title: 'Update user',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await AdminQuery.updateUserFn(user.id, data)
        .then(() => {
          AdminQuery.invalidateUser(user.id).then();
          onClose();
          notification.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            description: 'User updated',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(err => {
          notification.updateNotification(updateId, {
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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const new_password = formData.get('new_password') as string;
    const limit = Number(formData.get('limit'));
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const new_role = Number(formData.get('new_role'));

    updateMutation.mutate({
      username,
      new_password: new_password.length > 0 ? new_password : undefined,
      storage_limit: limit,
      email,
      full_name,
      new_role,
    });
  }

  return (
    <>
      <Button className={'cursor-pointer'} onClick={onOpen}>
        <Pen />
        Update User
      </Button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              defaultValue={user.username}
            />
            <Input
              type={'text'}
              name={'new_password'}
              id={'new_password'}
              placeholder={'New Password '}
            />
            <Input
              type={'number'}
              name={'limit'}
              id={'limit'}
              placeholder={'Limit'}
              defaultValue={user.storage_limit}
            />
            <Input
              type={'text'}
              name={'full_name'}
              id={'full_name'}
              placeholder={'Full name'}
              defaultValue={user.full_name ?? ''}
            />
            <Input
              type={'text'}
              name={'email'}
              id={'email'}
              placeholder={'Email'}
              defaultValue={user.email ?? ''}
            />
            <Select name={'new_role'} defaultValue={user.role.toString()}>
              <SelectTrigger>
                <SelectValue placeholder={"Select User's Role"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={Role.User.toString()}>User</SelectItem>
                  <SelectItem value={Role.Admin.toString()}>Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button type={'submit'}>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
