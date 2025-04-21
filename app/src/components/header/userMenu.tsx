import { useUserState } from '@stores/userStore';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import useLogout from '@hooks/useLogout.ts';
import { UserMenuUsage } from '@components/header/userMenuUsage.tsx';
import { useMemo, useState } from 'react';
import { Role } from '@models/user.ts';
import { cn } from '@lib/utils.ts';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '@components/ui/button.tsx';
import UserAvatar from '@components/UserAvatar.tsx';
import { usePreferenceStore } from '@stores/preferenceStore.ts';
import { themeChoices } from '@pages/settings/preferences/themePreferences.tsx';
import { Bolt, Code, LogOut } from 'lucide-react';

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
          <UserAvatar
            disabled={!user.user?.has_avatar}
            userId={user.user?.id}
            fetchedAt={user.user?.fetched_at}
            username={user.user?.username}
            className={'h-6 w-6 sm:h-8 sm:w-8'}
          />
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
              <Code className={'h-5 w-5'} />
              Admin
            </Link>
          )}
          <Link
            to={'/settings/account'}
            className={'menu-button animate-fade-in-top delay-200'}
            onClick={handleClose}>
            <Bolt className={'h-5 w-5'} />
            Settings
          </Link>
          <hr className={'my-2 animate-fade-in-top delay-200'} />
          <UserMenuThemeSwitcher />
          <hr className={'my-2 animate-fade-in-top delay-300'} />

          <Button
            variant={'destructive'}
            className={
              'w-full animate-fade-in-top delay-400 justify-start cursor-pointer'
            }
            size={'sm'}
            onClick={() => logoutAction.mutate()}>
            <LogOut className={'h-5 w-5'} />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UserMenuThemeSwitcher() {
  const themePreferences = usePreferenceStore(s => s.theme);

  const current = useMemo(() => {
    return (
      themeChoices.find(c => c.value === themePreferences.type) ||
      themeChoices[0]
    );
  }, [themePreferences.type]);

  const other = useMemo(() => {
    return (
      themeChoices.find(c => c.value !== themePreferences.type) ||
      themeChoices[0]
    );
  }, [themePreferences.type]);

  return (
    <button
      onClick={() => themePreferences.setType(other.value)}
      className={
        'menu-button w-full animate-fade-in-top delay-200 [&_svg]:h-5 [&_svg]:w-5'
      }>
      {current.icon}
      {current.name}
    </button>
  );
}
