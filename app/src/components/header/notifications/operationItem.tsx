import { OperationModelDTO } from '@bindings/OperationModelDTO.ts';
import { useMutation } from '@tanstack/react-query';
import { refetchOperations } from '@lib/query.ts';
import {
  getOperationStatusString,
  getOperationTypeString,
  OperationStatus,
} from '@models/operation.ts';
import { OperationStatusIndicator } from '@components/header/notifications/operationStatusIndicator.tsx';
import { UpdatingTimeIndicator } from '@components/updatingTimeIndicator.tsx';
import { api } from '@lib/queries/api.ts';

export function OperationItem({
  data,
  index,
}: {
  data: OperationModelDTO;
  index: number;
}) {
  const retry = useMutation({
    mutationFn: () => api.post(`auth/file/image/retry/operation/${data.id}`),
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
    <div
      className={'py-1 animate-fade-in-top'}
      style={{
        animationDelay: `${index * 50}ms`,
      }}>
      <div className={'flex items-center justify-between gap-5'}>
        <p className={'text-base font-medium'}>
          {getOperationTypeString(data.operation_type)}
        </p>
        <span title={getOperationStatusString(data.operation_status)}>
          <OperationStatusIndicator status={data.operation_status} />
        </span>
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
            className={'text-xs underline'}
            onClick={() => {
              retry.mutate();
            }}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
