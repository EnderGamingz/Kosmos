import { Severity } from '@stores/notificationStore.ts';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export function getSeverityIcon(severity: Severity) {
  switch (severity) {
    case Severity.SUCCESS:
      return <CheckCircleIcon className={'text-green-400'} />;
    case Severity.ERROR:
      return <ExclamationCircleIcon className={'text-red-400'} />;
    case Severity.WARN:
      return <ExclamationTriangleIcon className={'text-amber-500'} />;
    case Severity.INFO:
    default:
      return <InformationCircleIcon />;
  }
}