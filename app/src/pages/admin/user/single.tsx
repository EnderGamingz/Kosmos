import { useNavigate, useParams } from 'react-router-dom';
import { AdminQuery, type AdminUserUpdate } from '@lib/queries/adminQuery.ts';
import { Role, roleToString } from '@models/user.ts';
import { UsageReportStats } from '@pages/usage/report/usageReportStats.tsx';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { type ReactNode, type SubmitEventHandler, useState } from 'react';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';
import useDisclosure from '@/hooks/useDisclosure';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { AdminPageMetadata } from '@components/metadata.tsx';
import { Button } from '@components/ui/button.tsx';
import { Input } from '@components/ui/input.tsx';
import {
  Calendar,
  Hash,
  Mail,
  Pen,
  Shield,
  Trash2,
  User,
  UserCircle,
} from 'lucide-react';
import { Badge } from '@components/ui/badge.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select.tsx';
import { StorageLimitSelector } from '@pages/admin/user/storageLimitSelector.tsx';

export default function AdminUser() {
  const { id } = useParams();

  const { data } = AdminQuery.useUser(id);
  const storageUsage = AdminQuery.useUserUsage(id);

  if (!id || !data) return <>Not Found</>;

  return (
    <div className={'p-4 sm:p-6 max-w-5xl mx-auto'}>
      <AdminPageMetadata title={`${data.username} | User`} />

      {/* Header */}
      <div
        className={
          'rounded-2xl bg-linear-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 p-6 sm:p-8 shadow-sm border border-stone-300 dark:border-stone-700'
        }
      >
        <div
          className={
            'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'
          }
        >
          <div className={'flex items-start gap-4'}>
            <div className={'p-3 rounded-full bg-stone-300 dark:bg-stone-700'}>
              <UserCircle className={'w-8 h-8 sm:w-10 sm:h-10'} />
            </div>
            <div className={'-space-y-1'}>
              <h1
                className={
                  'text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100'
                }
              >
                {data.full_name || data.username}
              </h1>
              {data.full_name && (
                <p
                  className={
                    'text-sm sm:text-base text-stone-600 dark:text-stone-400'
                  }
                >
                  @{data.username}
                </p>
              )}
              <div className={'mt-3'}>
                <Badge
                  variant={data.role === Role.Admin ? 'default' : 'secondary'}
                  className={'text-xs sm:text-sm'}
                >
                  <Shield className={'w-3 h-3 mr-1'} />
                  {roleToString(data.role)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className={'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6'}>
        <div
          className={
            'rounded-xl bg-stone-100 dark:bg-stone-800 p-5 sm:p-6 shadow-sm border border-stone-200 dark:border-stone-700'
          }
        >
          <h2
            className={
              'text-lg font-semibold mb-4 text-stone-800 dark:text-stone-100'
            }
          >
            Account Information
          </h2>
          <div className={'space-y-4'}>
            <InfoRow
              icon={<Hash className={'w-4 h-4'} />}
              label={'User ID'}
              value={data.id}
            />
            <InfoRow
              icon={<User className={'w-4 h-4'} />}
              label={'Username'}
              value={data.username}
            />
            <InfoRow
              icon={<Mail className={'w-4 h-4'} />}
              label={'Email'}
              value={data.email || 'Not set'}
            />
          </div>
        </div>

        {/* Metadata */}
        <div
          className={
            'rounded-xl bg-stone-100 dark:bg-stone-800 p-5 sm:p-6 shadow-sm border border-stone-200 dark:border-stone-700'
          }
        >
          <h2
            className={
              'text-lg font-semibold mb-4 text-stone-800 dark:text-stone-100'
            }
          >
            Metadata
          </h2>
          <div className={'space-y-4'}>
            <InfoRow
              icon={<Calendar className={'w-4 h-4'} />}
              label={'Created'}
              value={formatDate(data.created_at)}
            />
            <InfoRow
              icon={<Calendar className={'w-4 h-4'} />}
              label={'Last Updated'}
              value={formatDate(data.updated_at)}
            />
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      {storageUsage.data && (
        <div className={'mt-6'}>
          <UsageReportStats usage={storageUsage.data} />
        </div>
      )}

      {/* Actions */}
      <div className={'mt-6 flex flex-col sm:flex-row gap-3 sm:gap-3'}>
        <AdminUpdateUserModal user={data} />
        <AdminDeleteUser user={data} />
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
      onClick={() => deleteAction.mutate()}
      variant={'destructive'}
      className={'w-full sm:w-auto'}
    >
      <Trash2 className={'w-4 h-4'} />
      Delete User
    </Button>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className={'flex items-start gap-3'}>
      <div className={'mt-0.5 text-stone-500 dark:text-stone-400'}>{icon}</div>
      <div className={'flex-1 min-w-0'}>
        <p
          className={
            'text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 mb-0.5'
          }
        >
          {label}
        </p>
        <p
          className={
            'text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-200 wrap-break-word'
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function AdminUpdateUserModal({ user }: { user: UserModelDTO }) {
  const notification = useNotifications(s => s.actions);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [limit, setLimit] = useState<number>(user.storage_limit);

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

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const new_password = formData.get('new_password') as string;
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
  };

  return (
    <>
      <Button className={'cursor-pointer w-full sm:w-auto'} onClick={onOpen}>
        <Pen className={'w-4 h-4'} />
        Update User
      </Button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className={'max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto'}
        >
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className={'flex flex-col gap-4'}>
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
            <StorageLimitSelector limit={limit} onChange={setLimit} />
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
