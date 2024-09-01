import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react';
import { BackspaceIcon, EyeDropperIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import tw from '@utils/classMerge.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateFolder } from '@lib/query.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';

const definedColors = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#2196f3',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#ffe325',
  '#ff9800',
  '#795548',
];

export function FolderColorChange({
  folderId,
  parent,
  color,
}: {
  folderId: string;
  parent?: string;
  color?: string;
}) {
  const { isOpen, onOpenChange, onClose } = useDisclosure();
  const [selected, setSelected] = useState('');
  const notification = useNotifications(s => s.actions);

  const recolorAction = useMutation({
    mutationFn: async ({
      override,
      remove,
    }: {
      override?: string;
      remove?: boolean;
    }) => {
      const recolorId = notification.notify({
        title: 'Recolor folder',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      return axios
        .patch(`${BASE_URL}auth/folder/${folderId}/color`, {
          color: remove ? null : override || selected || color,
        })
        .then(async () => {
          notification.updateNotification(recolorId, {
            severity: Severity.SUCCESS,
            loading: false,
            canDismiss: true,
            timeout: 1000,
          });
          if (remove) setSelected('lightgray');
          invalidateFolder(parent).then();
          onClose();
        })
        .catch(err => {
          notification.updateNotification(recolorId, {
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

  const handleClick = (color: string) => () => {
    setSelected(color);
    recolorAction.mutate({
      override: color,
    });
  };

  return (
    <>
      <Popover
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement={'right-start'}
        offset={20}>
        <PopoverTrigger>
          <button
            className={'h-4 w-4 !rounded-full !p-0 shadow-md transition-colors'}
            style={{
              backgroundColor: selected || color || 'lightgray',
            }}
          />
        </PopoverTrigger>
        <PopoverContent className={'rounded-md p-3'}>
          <div className={'max-w-40'}>
            <div className={'flex flex-wrap gap-2'}>
              {definedColors.map(color => (
                <button
                  onClick={handleClick(color)}
                  key={color}
                  className={'h-5 w-5 !rounded-full !p-0 shadow-md'}
                  style={{
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
            <div className={'mt-4'}>
              <div className={'flex items-center gap-1'}>
                <label
                  htmlFor={'custom-color'}
                  className={tw(
                    'flex flex-grow cursor-pointer items-center gap-1 px-2 py-1.5 text-sm',
                    'rounded-md bg-stone-200 transition-colors hover:bg-stone-300',
                    'outline outline-1',
                  )}
                  style={{
                    outlineColor: selected || color || 'lightgray',
                  }}>
                  <EyeDropperIcon className={'h-4 w-4'} />
                  Custom
                </label>
                {(color || selected) && (
                  <button
                    onClick={() => recolorAction.mutate({ remove: true })}
                    className={'rounded-md bg-stone-200 px-2 py-1.5'}>
                    <BackspaceIcon className={'h-5 w-5'} />
                  </button>
                )}
              </div>
              <input
                id={'custom-color'}
                type={'color'}
                className={'sr-only'}
                defaultValue={selected || color || 'lightgray'}
                onChange={e => setSelected(e.target.value)}
                onBlur={() => recolorAction.mutate({})}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
