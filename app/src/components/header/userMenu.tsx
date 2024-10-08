import { useUserState } from '@stores/userStore';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import {
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import {
  ArrowRightStartOnRectangleIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import useLogout from '@hooks/useLogout.ts';
import tw from '@utils/classMerge.ts';
import MinidentIcon from '@components/MinidentIcon.tsx';
import { UserMenuUsage } from '@components/header/userMenuUsage.tsx';
import { useState } from 'react';
import { Role } from '@models/user.ts';

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
            'rounded-lg p-2 text-stone-700',
            ' flex items-center gap-2 rounded-full sm:p-1',
            'outline-none dark:text-stone-300',
          )}>
          <div
            className={
              'h-6 w-6 overflow-hidden rounded-full bg-stone-50 sm:ml-1 sm:h-8 sm:w-8'
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
      <PopoverContent className={'bg-stone-50 dark:bg-stone-800'}>
        <div className={'space-y-2 px-1 py-1.5'}>
          <div className={'mb-1 text-stone-700 dark:text-stone-300'}>
            <p className={'font-semibold'}>Welcome back</p>
            <p className={'font-light text-stone-600 dark:text-stone-400'}>
              {user.user?.username}
            </p>
          </div>
          <UserMenuUsage onClick={handleClose} />
          <Divider className={'mb-1 mt-2'} />
          <div className={'space-y-1'}>
            {user.user?.role === Role.Admin && (
              <Link
                to={'/admin/user'}
                className={'menu-button'}
                onClick={handleClose}>
                <CodeBracketIcon className={'h-5 w-5'} />
                Admin
              </Link>
            )}
            <Link
              to={'/settings/account'}
              className={'menu-button'}
              onClick={handleClose}>
              <Cog6ToothIcon className={'h-5 w-5'} />
              Settings
            </Link>
            <div
              className={tw(
                'menu-button bg-red-200/30 text-red-700 hover:bg-red-200/50',
                'dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50',
              )}
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
