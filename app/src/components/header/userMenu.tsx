import { useUserState } from '../../stores/userStore.ts';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

export function UserMenu() {
  const user = useUserState();
  const navigate = useNavigate();

  const logoutAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/logout`),
    onSuccess: () => {
      user.logout();
      navigate('/auth/login');
    },
  });

  return (
    <Dropdown>
      <DropdownTrigger>
        <div>
          <Avatar
            name={user.user?.username}
            color={'default'}
            as='button'
            className={'ml-2'}
          />
        </div>
      </DropdownTrigger>
      <DropdownMenu disabledKeys={['signIn']} aria-label={'User actions'}>
        <DropdownItem key={'signIn'} textValue={user.user?.username}>
          <p className='font-semibold'>Signed in as</p>
          <p className='font-light'>{user.user?.username}</p>
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
