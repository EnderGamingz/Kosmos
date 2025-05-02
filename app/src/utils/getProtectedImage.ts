import { useEffect, useState } from 'react';
import { JWT_TOKEN_STORAGE_KEY } from '@lib/constants.ts';

export function useProtectedContent(url: string, unprotectedUrl?: boolean) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      if (!url) return;

      setLoading(true);
      setError(null);

      try {
        const fetchFunction = unprotectedUrl
          ? fetchWithout
          : fetchWithAuthentication;

        const response = await fetchFunction(url);
        if (!mounted) return;

        const blob = await response.blob();
        if (!mounted) return;

        objectUrl = URL.createObjectURL(blob);
        if (!mounted) return;

        setBlobUrl(objectUrl);
        setLoading(false);
        setLoaded(true);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to load image'),
          );
          setLoading(false);
        }
      }
    };

    loadImage().then();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return { loading, error, loaded, blobUrl };
}

function fetchWithout(url: string) {
  return fetch(url);
}

function fetchWithAuthentication(url: string) {
  const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
