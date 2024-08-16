export function truncateString(str: string, num: number = 18) {
  if (str.length > num) {
    return str.slice(0, num) + '...';
  } else {
    return str;
  }
}
