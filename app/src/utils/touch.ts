export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error Compatibility
    navigator.msMaxTouchPoints > 0
  );
}
