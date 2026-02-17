import { useEffect, useState } from 'react';

export function useDebounce(
  value: unknown,
  delay = 500,
  initial?: unknown,
  initialFetch = true,
) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [loading, setLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we intentionally don't want to include initial or initialFetch in the dependencies, as we only want to use them on the first render
  useEffect(() => {
    setLoading(initialFetch ? true : value !== debouncedValue);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setLoading(false);
    }, delay);

    return () => {
      clearTimeout(handler);
      setLoading(false);
    };
  }, [value, delay]);

  return {
    debouncedValue,
    loading,
    noValue: !value,
    isInitial: initial === debouncedValue,
  };
}
