import { useUserState } from '@stores/userStore';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import {
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import {
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import useLogout from '@hooks/useLogout.ts';
import tw from '@lib/classMerge.ts';
import MinidentIcon from '@components/MinidentIcon.tsx';
import { UserMenuUsage } from '@components/header/userMenuUsage.tsx';
import { useState } from 'react';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const user = useUserState();
  const logout = useLogout();

  const logoutAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/logout`),
    onSuccess: () => {
      handleClose();
      logout();
    },
  });

  const handleClose = () => setOpen(false);

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <PopoverTrigger>
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
      </PopoverTrigger>
      <PopoverContent>
        <div className={'space-y-2 px-1 py-1.5'}>
          <div className={'text-stone-700'}>
            <p className={'font-semibold'}>Welcome back</p>
            <p className={'font-light text-stone-600'}>{user.user?.username}</p>
          </div>
          <UserMenuUsage onClick={handleClose} />
          <Divider className={'mb-1 mt-2'} />
          <div className={'space-y-1'}>
            <Link
              to={'/settings'}
              className={'user-menu-link'}
              onClick={handleClose}>
              <Cog6ToothIcon className={'h-5 w-5'} />
              Settings
            </Link>
            <div
              className={
                'user-menu-link bg-red-200/30 text-red-700 hover:bg-red-200/50'
              }
              onClick={() => logoutAction.mutate()}>
              <ArrowRightStartOnRectangleIcon className={'h-5 w-5'} />
              Logout
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
