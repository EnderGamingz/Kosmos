import { Severity } from '@stores/notificationStore.ts';
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react';

export function getSeverityIcon(severity: Severity) {
  switch (severity) {
    case Severity.SUCCESS:
      return <CircleCheck className={'text-green-400'} />;
    case Severity.ERROR:
      return <OctagonAlert className={'text-red-400'} />;
    case Severity.WARN:
      return <TriangleAlert className={'text-amber-500'} />;
    case Severity.INFO:
    default:
      return <Info />;
  }
}
