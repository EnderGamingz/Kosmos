import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateFolder } from '@lib/query.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { colord } from 'colord';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import useDisclosure from '@/hooks/useDisclosure';
import { Delete, Pointer, SwatchBook } from 'lucide-react';
import { cn } from '@lib/utils.ts';

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
      className={'h-3.5 w-3.5 rounded-full! p-0! shadow-md transition-colors'}
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

  const handleBrightnessChange = (e: ChangeEvent<HTMLInputElement>) => {
    const brightness = parseInt(e.target.value, 10);
    const col = colord(selected || color || '#ffffff');
    setSelected(col.lighten(brightness / 100 - col.toHsl().l / 100).toHex());
  };

  useEffect(() => {
    if (!isOpen && color !== selected && selected !== '') {
      recolorAction.mutate({});
    }
  }, [isOpen, color, recolorAction.mutate, selected]);

  const lightnessValue = useMemo(
    () => colord(selected || color || '#ffffff').toHsl().l,
    [selected, color],
  );

  const pointerColor = useMemo(() => {
    const col = colord(selected || color || '#ffffff');
    return col.isDark() ? 'white' : 'black';
  }, [selected, color]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <SwatchBook /> Folder Color
      </PopoverTrigger>
      <PopoverContent className={'max-w-72'}>
        <div className={'flex flex-wrap gap-2 justify-center'}>
          {definedColors.map(c => (
            <button
              type={'button'}
              onClick={handleClick(c)}
              key={c}
              className={cn(
                'h-5 w-5 rounded-full! p-0! shadow-md transition-all',
                selected === c &&
                  'ring-2 ring-offset-2 ring-blue-500 scale-110',
              )}
              style={{
                backgroundColor: c,
              }}
              title={c}
            />
          ))}
        </div>
        <div className={'mt-4 space-y-3'}>
          <div>
            <label
              htmlFor={'color'}
              className={'block text-sm font-medium mb-2'}
            >
              Custom Color
            </label>
            <div className={'overflow-hidden border h-10 rounded-md relative'}>
              <input
                id={'color'}
                name={'color'}
                type={'color'}
                value={selected || color || '#ffffff'}
                onChange={e => setSelected(e.target.value)}
                className={'w-full h-10 cursor-pointer'}
              />
              <Pointer
                className={
                  'opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors'
                }
                style={{ color: pointerColor }}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={'brightness'}
              className={'block text-sm font-medium mb-2'}
            >
              Brightness
            </label>
            <input
              name={'brightness'}
              id={'brightness'}
              type={'range'}
              min={'0'}
              max={'100'}
              value={lightnessValue}
              onChange={handleBrightnessChange}
              className={
                'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
              }
            />
          </div>
          {(color || selected) && (
            <button
              type={'button'}
              onClick={() => recolorAction.mutate({ remove: true })}
              className={
                'w-full flex items-center justify-center gap-2 rounded-md bg-stone-200 px-2 py-1 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600'
              }
            >
              <Delete className={'h-5 w-5'} />
              Remove
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
