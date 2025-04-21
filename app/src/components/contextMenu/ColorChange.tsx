import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateFolder } from '@lib/query.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { hexToHsva, hsvaToHex, ShadeSlider, Wheel } from '@uiw/react-color';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import useDisclosure from '@/hooks/useDisclosure';
import { Delete, SwatchBook } from 'lucide-react';

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

export function ColorDisplay({ color }: { color: string }) {
  return (
    <div
      className={'h-3.5 w-3.5 !rounded-full !p-0 shadow-md transition-colors'}
      style={{
        backgroundColor: color,
      }}
    />
  );
}

export function FolderColorChange({
  folderId,
  parent,
  color,
}: {
  folderId: string;
  parent?: string | null;
  color?: string | null;
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
          if (remove) setSelected('');
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
  };

  useEffect(() => {
    if (!isOpen && color !== selected && selected !== '') {
      recolorAction.mutate({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <SwatchBook /> Folder Color
      </PopoverTrigger>
      <PopoverContent className={'max-w-52'}>
        <div className={'flex flex-wrap gap-2 justify-center'}>
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
        <div className={'mt-4 grid gap-2 place-items-center'}>
          <Wheel
            width={150}
            height={150}
            color={selected || color || '#ffffff'}
            onChange={color => setSelected(color.hex)}
          />
          <ShadeSlider
            className={'overflow-hidden w-full border !rounded-xs'}
            hsva={hexToHsva(selected || color || '#ffffff')}
            onChange={newShade => {
              const hsva = hexToHsva(selected || color || 'lightgray');
              setSelected(hsvaToHex({ ...hsva, v: newShade.v }));
            }}
          />
          {(color || selected) && (
            <button
              onClick={() => recolorAction.mutate({ remove: true })}
              className={
                'flex items-center gap-2 rounded-md bg-stone-200 px-2 py-1 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600'
              }>
              <Delete className={'h-5 w-5'} />
              Remove
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
