import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { KeyIcon } from '@heroicons/react/24/outline';
import { Chip } from '@pages/explorer/components/share/chip.tsx';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BASE_URL } from '@lib/vars.ts';
import axios from 'axios';
import { invalidateShares } from '@lib/query.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';

function ChangePasswordForm({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const notifications = useNotifications(s => s.actions);

  const action = useMutation({
    mutationFn: async () => {
      const updateId = notifications.notify({
        title: 'Update password',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .patch(`${BASE_URL}auth/share/${id}`, {
          password: value,
        })
        .then(() => {
          invalidateShares().then();
          onClose();
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Success',
            description: 'Password updated',
            canDismiss: true,
            timeout: 1000,
          });
        })
        .catch(e => {
          notifications.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            canDismiss: true,
          });
        });
    },
  });

  return (
    <div className={'p-2'}>
      <form
        onSubmit={e => {
          e.preventDefault();
          action.mutate();
        }}
        className={'flex flex-col gap-2'}>
        <input
          type={'password'}
          placeholder={'New Password'}
          className={'input'}
          value={value}
          onChange={e => setValue(e.target.value)}
          required
        />
        <button
          type={'submit'}
          className={'btn-black justify-center'}
          disabled={action.isPending || !value || value.length < 3}>
          Change
        </button>
      </form>
    </div>
  );
}

export function ChangePassword({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button>
          <Chip
            content={
              <>
                <KeyIcon /> Password
              </>
            }
          />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <ChangePasswordForm id={id} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
