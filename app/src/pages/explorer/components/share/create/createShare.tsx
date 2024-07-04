import { useState } from 'react';
import { getShareTypeString, ShareType } from '@models/share.ts';
import { motion } from 'framer-motion';
import tw from '@lib/classMerge.ts';
import { TypeButton } from '@pages/explorer/components/share/create/typeButton.tsx';
import { Collapse } from 'react-collapse';
import {
  CheckIcon,
  ClockIcon,
  CursorArrowRippleIcon,
  KeyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Chip } from '@pages/explorer/components/share/chip.tsx';
import { DatePicker } from '@nextui-org/react';
import { DateValue, getLocalTimeZone, now } from '@internationalized/date';
import { useMutation } from '@tanstack/react-query';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { DataOperationType } from '@models/file.ts';
import { refetchShareData } from '@lib/query.ts';

export function CreateShare({
  dataType,
  id,
  onDone,
}: {
  dataType: DataOperationType;
  id: string;
  onDone: () => void;
}) {
  const notifications = useNotifications(s => s.actions);
  const [type, setType] = useState<ShareType>(ShareType.Public);
  const [privateUsername, setPrivateUsername] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState<DateValue | undefined>(undefined);
  const [limit, setLimit] = useState<number | undefined>(undefined);

  const createAction = useMutation({
    mutationFn: async () => {
      const createId = notifications.notify({
        title: 'Share',
        canDismiss: false,
        severity: Severity.INFO,
        loading: true,
      });
      await axios
        .post(
          `${BASE_URL}auth/share/${dataType}/${getShareTypeString(type, true)}`,
          {
            [`${dataType}_id`]: id,
            password: password || undefined,
            limit: limit,
            expires_at:
              expiresAt?.toDate(getLocalTimeZone()).toISOString() || undefined,
            target_username: privateUsername || undefined,
          },
        )
        .then(() => {
          refetchShareData().then();
          onDone();

          notifications.updateNotification(createId, {
            severity: Severity.SUCCESS,
            status: 'Created',
            timeout: 1000,
            canDismiss: true,
          });
        })
        .catch(e => {
          notifications.updateNotification(createId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            canDismiss: true,
          });
        });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={'flex flex-col gap-2 overflow-hidden p-1'}>
      <h2 className={'text-lg font-medium'}>
        Create {getShareTypeString(type)} share
      </h2>
      <div
        className={tw(
          'grid grid-cols-1 rounded-xl bg-stone-200/50 p-1 sm:grid-cols-2',
        )}>
        <TypeButton
          type={ShareType.Public}
          selected={type === ShareType.Public}
          onSelect={() => setType(ShareType.Public)}
        />
        <TypeButton
          type={ShareType.Private}
          selected={type === ShareType.Private}
          onSelect={() => setType(ShareType.Private)}
        />
      </div>
      <div
        className={tw(
          'grid [&>div]:overflow-hidden [&>div]:rounded-xl [&>div]:bg-stone-200/50 [&>div]:p-2',
          'gap-2 [&_input]:mt-1 [&_input]:w-full [&_input]:py-1.5 [&_label]:text-sm [&_svg]:w-4',
          '[&_label]:flex [&_label]:items-center [&_label]:gap-1 [&_label]:font-medium [&_label]:text-stone-600',
        )}>
        <div className={'!p-0'}>
          <Collapse isOpened={type === ShareType.Private}>
            <div className={'p-2'}>
              <label htmlFor={'username'}>
                <UserIcon />
                User to share with*
                {privateUsername && (
                  <div className={'ml-auto text-sm'}>Active</div>
                )}
              </label>
              <input
                className={'input'}
                type={'text'}
                id={'username'}
                name={'username'}
                required={type === ShareType.Private}
                value={privateUsername}
                onChange={e => setPrivateUsername(e.target.value)}
                placeholder={'Username'}
              />
            </div>
          </Collapse>
        </div>
        <div>
          <label htmlFor={'password'}>
            <KeyIcon />
            Password
            {password && <div className={'ml-auto text-sm'}>Active</div>}
          </label>
          <input
            className={'input'}
            type={'password'}
            id={'password'}
            name={'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={'Password'}
          />
        </div>
        <div>
          <label htmlFor={'custom-expires'}>
            <ClockIcon />
            Expiration
          </label>
          <div className={'flex gap-2 p-2 [&_div]:text-sm'}>
            <Chip content={'Never'} onClick={() => setExpiresAt(undefined)} />
            <Chip
              content={'5 min'}
              onClick={() =>
                setExpiresAt(now(getLocalTimeZone()).add({ minutes: 5 }))
              }
            />
            <Chip
              content={'1 hour'}
              onClick={() =>
                setExpiresAt(now(getLocalTimeZone()).add({ hours: 1 }))
              }
            />
            <Chip
              content={'1 day'}
              onClick={() =>
                setExpiresAt(now(getLocalTimeZone()).add({ days: 1 }))
              }
            />
            <Chip
              content={'1 week'}
              onClick={() =>
                setExpiresAt(now(getLocalTimeZone()).add({ days: 7 }))
              }
            />
            <Chip
              content={'Custom'}
              onClick={() =>
                setExpiresAt(now(getLocalTimeZone()).add({ days: 7 }))
              }
            />
          </div>
          <Collapse isOpened={!!expiresAt}>
            <DatePicker
              label={'Expires at'}
              variant={'flat'}
              hideTimeZone
              hourCycle={24}
              showMonthAndYearPickers
              value={expiresAt ?? now(getLocalTimeZone())}
              onChange={setExpiresAt}
              minValue={now(getLocalTimeZone())}
            />
          </Collapse>
        </div>
        <div>
          <label htmlFor={'limit'}>
            <CursorArrowRippleIcon />
            Access limit
            {limit && <div className={'ml-auto text-sm'}>Active</div>}
          </label>
          <p className={'text-xs text-stone-600'}>
            Every access like download and preview counts as one.
          </p>
          <input
            className={'input'}
            type={'number'}
            min={1}
            max={1000}
            pattern={'[0-9]*'}
            datatype={'number'}
            id={'limit'}
            name={'limit'}
            value={limit ?? ''}
            onChange={e => {
              const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');

              if (sanitizedValue === '') {
                setLimit(undefined);
              } else {
                const parsedNumber = Number(sanitizedValue);
                setLimit(
                  parsedNumber > 0 && parsedNumber < 1000
                    ? parsedNumber
                    : parsedNumber < 1000
                      ? 0
                      : 1000,
                );
              }
            }}
            placeholder={'Limit'}
          />
        </div>

        <button
          disabled={
            createAction.isPending ||
            (type === ShareType.Private && !privateUsername)
          }
          className={'btn-black w-full justify-center'}
          onClick={() => createAction.mutate()}>
          <CheckIcon />
          Create
        </button>
      </div>
    </motion.div>
  );
}
