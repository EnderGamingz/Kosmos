import { AdminQuery } from '@lib/queries/adminQuery.ts';
import { roleToString, UserModel } from '@models/user.ts';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { Helmet } from 'react-helmet';

function UserItem({ user }: { user: UserModel }) {
  const navigate = useNavigate();
  return (
    <tr
      className={
        'cursor-pointer transition-colors hover:bg-stone-200 dark:hover:bg-stone-700'
      }
      onClick={() => navigate(`/admin/user/${user.id}`)}>
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
      <div className={'flex items-center justify-between gap-2'}>
        <h1 className={'text-2xl font-semibold'}>Users</h1>
        <CreateUserModal />
      </div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <div className={'flex flex-grow flex-col overflow-x-auto'}>
        <table
          className={
            'w-full whitespace-nowrap text-left [&_td]:p-3 [&_th]:p-3 [&_th]:font-light'
          }>
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
            {users.data?.map(user => <UserItem key={user.id} user={user} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CreateUserModal() {
  const notification = useNotifications(s => s.actions);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  // Default multiplier is set to MB
  const [multiplier, setMultiplier] = useState(1e6);

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const limit = Number(formData.get('limit')) * multiplier || 0;

    createMutation.mutate({ username, password, limit });
  }

  return (
    <>
      <button className={'btn-black'} onClick={onOpen}>
        Create
      </button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Create User</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className={'flex flex-col gap-3'}>
              <input
                className={'input'}
                type={'text'}
                name={'username'}
                id={'username'}
                placeholder={'Username'}
                required
              />
              <input
                className={'input'}
                type={'text'}
                name={'password'}
                id={'password'}
                placeholder={'Password'}
                required
              />
              <div className={'flex gap-3'}>
                <input
                  className={'input'}
                  type={'number'}
                  name={'limit'}
                  id={'limit'}
                  placeholder={'Limit'}
                  required
                />
                <select
                  className={'input'}
                  name={'multi'}
                  id={'multi'}
                  onChange={e => setMultiplier(Number(e.target.value))}
                  defaultValue={multiplier}>
                  <option value={1e6}>MB</option>
                  <option value={1e9}>GB</option>
                  <option value={1e12}>TB</option>
                </select>
              </div>
              <button className={'btn-black'} type={'submit'}>
                Create
              </button>
            </form>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}
