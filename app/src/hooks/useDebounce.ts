import { useEffect, useState } from 'react';

export function useDebounce(
  value: unknown,
  delay = 500,
  initial?: unknown,
  initialFetch = true,
) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [loading, setLoading] = useState(false);

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
