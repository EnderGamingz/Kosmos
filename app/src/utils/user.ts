import { BASE_URL } from '@lib/env.ts';

export function getAvatarUrl(userId: string, reFetch?: unknown) {
  return `${BASE_URL}auth/user/avatar/${userId}${reFetch ? `?${reFetch}` : ''}`;
}
