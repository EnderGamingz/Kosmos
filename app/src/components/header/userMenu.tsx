import { useUserState } from '@stores/userStore';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import {
  ArrowRightStartOnRectangleIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import useLogout from '@hooks/useLogout.ts';
import { MinidentIcon } from '@components/MinidentIcon.tsx';
import { UserMenuUsage } from '@components/header/userMenuUsage.tsx';
import { useState } from 'react';
import { Role } from '@models/user.ts';
import { cn } from '@lib/utils.ts';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '@components/ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx';

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={
            'cursor-pointer p-2 flex items-center gap-2 rounded-full sm:p-1 outline-none'
          }>
          <Avatar className={'h-6 w-6 sm:h-8 sm:w-8'}>
            {user.user?.has_avatar && (
              <AvatarImage
                className={'object-cover'}
                src={`${BASE_URL}auth/user/avatar/${user.user.id}?${user.user.fetched_at}`}
                alt={user.user.username}
              />
            )}
            <AvatarFallback>
              <MinidentIcon username={user.user?.username || ''} />
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
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
      <PopoverContent className={'max-w-52 px-3 py-3'}>
        <div className={'mb-2 text-stone-700 dark:text-stone-300'}>
          <p className={'font-semibold animate-fade-in-top'}>Welcome back</p>
          <p
            className={
              'font-light text-stone-600 dark:text-stone-400 animate-fade-in-top delay-75'
            }>
            {user.user?.username}
          </p>
        </div>
        <div className={'animate-fade-in-top delay-100'}>
          <UserMenuUsage onClick={handleClose} />
        </div>
        <hr className={'my-3 mt-2 animate-fade-in-top delay-100'} />
        <div className={'space-y-1'}>
          {user.user?.role === Role.Admin && (
            <Link
              to={'/admin/user'}
              className={'menu-button animate-fade-in-top delay-100'}
              onClick={handleClose}>
              <CodeBracketIcon className={'h-5 w-5'} />
              Admin
            </Link>
          )}
          <Link
            to={'/settings/account'}
            className={'menu-button animate-fade-in-top delay-200'}
            onClick={handleClose}>
            <Cog6ToothIcon className={'h-5 w-5'} />
            Settings
          </Link>
          <Button
            variant={'destructive'}
            className={
              'w-full mt-2 animate-fade-in-top delay-300 justify-start cursor-pointer'
            }
            size={'sm'}
            onClick={() => logoutAction.mutate()}>
            <ArrowRightStartOnRectangleIcon className={'h-5 w-5'} />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
