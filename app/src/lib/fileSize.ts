import {
  Unit,
  usePreferenceStore as PreferenceStore,
} from '@stores/preferenceStore.ts';

export function formatBytes(bytes: number, precision = 1) {
  const useSI = PreferenceStore(s => s.unit.type === Unit.SI);
  const unitSize = useSI ? 1000 : 1024;

  if (Math.abs(bytes) < unitSize) {
    return bytes + ' B';
  }

  const units = useSI
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let iteration = -1;
  const scale = 10 ** precision;

  do {
    bytes /= unitSize;
    ++iteration;
  } while (
    Math.round(Math.abs(bytes) * scale) / scale >= unitSize &&
    iteration < units.length - 1
  );

  return bytes.toFixed(precision) + ' ' + units[iteration];
}
