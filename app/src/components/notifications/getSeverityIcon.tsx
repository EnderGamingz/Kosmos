import { Severity } from '@stores/notificationStore.ts';
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react';

export function getSeverityIcon(severity: Severity) {
  switch (severity) {
    case Severity.SUCCESS:
      return CircleCheck;
    case Severity.ERROR:
      return OctagonAlert;
    case Severity.WARN:
      return TriangleAlert;
    case Severity.INFO:
    default:
      return Info;
  }
}

export function getSeverityBorderColor(severity: Severity) {
  switch (severity) {
    case Severity.SUCCESS:
      return 'border-r-green-400';
    case Severity.ERROR:
      return 'border-r-red-400';
    case Severity.WARN:
      return 'border-r-amber-400';
    case Severity.INFO:
    default:
      return 'border-r-blue-300';
  }
}
