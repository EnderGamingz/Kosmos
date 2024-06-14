export enum OperationType {
  General,
  ImageProcessing,
}

export function normalizeOperationType(id: number): OperationType {
  return id in OperationType ? id : OperationType.General;
}

export function getOperationTypeString(type: OperationType | number) {
  const typeId = normalizeOperationType(type);
  switch (typeId) {
    case OperationType.General:
      return 'General Operation';
    case OperationType.ImageProcessing:
      return 'Image Processing';
  }
}

export enum OperationStatus {
  Pending,
  Success,
  Failed,
  Interrupted,
  Unrecoverable,
  Recovered,
}

export function getOperationStatusString(status: OperationStatus | number) {
  const statusId = normalizeOperationStatus(status);
  switch (statusId) {
    case OperationStatus.Pending:
      return 'Pending';
    case OperationStatus.Success:
      return 'Success';
    case OperationStatus.Failed:
      return 'Failed';
    case OperationStatus.Interrupted:
      return 'Interrupted';
    case OperationStatus.Unrecoverable:
      return 'Unrecoverable';
    case OperationStatus.Recovered:
      return 'Recovered';
  }
}

export function normalizeOperationStatus(id: number): OperationStatus {
  return id in OperationStatus ? id : OperationStatus.Pending;
}

export type OperationModel = {
  id: string;
  user_id: string;
  operation_type: number;
  operation_status: number;
  metadata?: never;
  started_at: string;
  ended_at?: string;
  updated_at: string;
};
