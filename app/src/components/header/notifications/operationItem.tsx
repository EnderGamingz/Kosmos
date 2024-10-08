import { OperationModelDTO } from '@bindings/OperationModelDTO.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { refetchOperations } from '@lib/query.ts';
import {
  getOperationStatusString,
  getOperationTypeString,
  OperationStatus,
} from '@models/operation.ts';
import { motion } from 'framer-motion';
import { itemTransitionVariant } from '@components/defaults/transition.ts';
import { Tooltip } from '@nextui-org/react';
import { OperationStatusIndicator } from '@components/header/notifications/operationStatusIndicator.tsx';
import { UpdatingTimeIndicator } from '@components/updatingTimeIndicator.tsx';

export function OperationItem({ data }: { data: OperationModelDTO }) {
  const retry = useMutation({
    mutationFn: () =>
      axios.post(`${BASE_URL}auth/file/image/retry/operation/${data.id}`),
    onSuccess: () => {
      setTimeout(() => {
        refetchOperations().then();
      }, 2_000);
    },
  });

  const hasEnded = !!data.ended_at;
  const canRetry =
    data.operation_status === OperationStatus.Failed ||
    data.operation_status === OperationStatus.Interrupted;

  return (
    <motion.div variants={itemTransitionVariant}>
      <div className={'flex items-center justify-between gap-5'}>
        <p
          className={
            'text-base font-medium text-stone-800 dark:text-stone-300'
          }>
          {getOperationTypeString(data.operation_type)}
        </p>
        <Tooltip content={getOperationStatusString(data.operation_status)}>
          <span>
            <OperationStatusIndicator status={data.operation_status} />
          </span>
        </Tooltip>
      </div>
      <div className={'flex justify-between gap-3'}>
        <p className={'text-xs text-stone-500'}>
          {hasEnded ? 'Ended ' : 'Started '}
          <UpdatingTimeIndicator
            time={(hasEnded ? data.ended_at : data.started_at) || 0}
          />
        </p>
        {canRetry && !retry.isSuccess && (
          <button
            disabled={retry.isPending}
            className={'text-xs text-stone-800 underline dark:text-stone-300'}
            onClick={() => {
              retry.mutate();
            }}>
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}