export function formatBytes(bytes: number, useSIUnits = false, precision = 1) {
  const unitSize = useSIUnits ? 1000 : 1024;

  if (Math.abs(bytes) < unitSize) {
    return bytes + ' B';
  }

  const units = useSIUnits
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
