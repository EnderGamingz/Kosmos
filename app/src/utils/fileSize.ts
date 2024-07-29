import { Unit, usePreferenceStore } from '@stores/preferenceStore.ts';

export const useByteFormatter = () => {
  const useSI = usePreferenceStore(s => s.unit.type === Unit.SI);

  return {
    useSI,
    formatBytes: (bytes: number, precision = 1) =>
      formatBytes(bytes, precision, useSI),
  };
};

export function useFormatBytes(bytes: number, precision = 1) {
  const useSI = usePreferenceStore(s => s.unit.type === Unit.SI);

  return formatBytes(bytes, precision, useSI);
}

export function formatBytes(bytes: number, precision = 1, useSI = false) {
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
