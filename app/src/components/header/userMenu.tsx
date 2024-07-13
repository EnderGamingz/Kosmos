import { useUserState } from '@stores/userStore';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import {
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import {
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import useLogout from '@hooks/useLogout.ts';
import tw from '@lib/classMerge.ts';
import MinidentIcon from '@components/MinidentIcon.tsx';
import { UserMenuUsage } from '@components/header/userMenuUsage.tsx';

export function UserMenu() {
  const user = useUserState();
  const navigate = useNavigate();
  const logout = useLogout();

  const logoutAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/logout`),
    onSuccess: () => {
      logout();
    },
  });

  return (
    <Dropdown>
      <DropdownTrigger>
        <button
          className={tw(
            'rounded-lg p-2 text-stone-700 hover:bg-stone-700/5',
            'flex items-center gap-2 rounded-full p-1 sm:rounded-lg',
            'outline-none transition-all',
          )}>
          <div
            className={
              'h-9 w-9 overflow-hidden rounded-full bg-stone-50 sm:ml-1'
            }>
            <MinidentIcon
              username={user.user?.username || ''}
              className={'h-full w-full'}
            />
          </div>
          <div
            className={tw(
              'hidden max-w-32 flex-col overflow-hidden whitespace-nowrap pr-2 text-left sm:flex',
              '[&_*]:overflow-hidden [&_*]:overflow-ellipsis',
            )}>
            <p className={'text-sm font-semibold'}>
              {user.user?.full_name?.split(' ')[0] || user.user?.username}
            </p>
            <span className={'text-xs font-light'}>@{user.user?.username}</span>
          </div>
        </button>
      </DropdownTrigger>
      <DropdownMenu
        disabledKeys={['signIn', 'account-usage']}
        aria-label={'User actions'}>
        <DropdownItem key={'signIn'} textValue={user.user?.username}>
          <p className='font-semibold'>Welcome back</p>
          <p className='font-light'>{user.user?.username}</p>
        </DropdownItem>
        <DropdownItem
          className={'py-0 opacity-100'}
          key={'account-usage'}
          textValue={'usage'}>
          <UserMenuUsage />
          <Divider className={'mb-1 mt-2'} />
        </DropdownItem>
        <DropdownItem
          onClick={() => navigate('/settings')}
          key={'settings'}
          startContent={<Cog6ToothIcon className={'h-5 w-5'} />}>
          Settings
        </DropdownItem>
        <DropdownItem
          textValue={'Logout'}
          onClick={() => logoutAction.mutate()}
          key={'signOut'}
          color={'danger'}
          className={'text-danger-400'}
          startContent={
            <ArrowRightStartOnRectangleIcon className={'h-5 w-5'} />
          }>
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
