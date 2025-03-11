import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { queryClient } from '@lib/query.ts';
import { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import { ContactRequestsResponse } from '@bindings/ContactRequestsResponse.ts';

export class ContactQuery {
  public static useRequiresAttention = () => {
    return useQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/social/contact/ping`)
          .then(res => res.data as boolean),
      queryKey: ['social', 'contact', 'ping'],
      // Refetch every 1 minute
      refetchInterval: 60 * 1000,
    });
  };

  public static useProfilesSuspense = () => {
    return useSuspenseQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/social/contact/profiles`)
          .then(res => res.data as ProfileContactModelDTO[]),
      queryKey: ['social', 'contact', 'profiles'],
    });
  };
  public static useUnhandledSuspense = () => {
    return useSuspenseQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/social/contact/unhandled`)
          .then(res => res.data as ContactRequestsResponse),
      queryKey: ['social', 'contact', 'unhandled'],
    });
  };

  public static invalidateContact = () => {
    return queryClient.invalidateQueries({
      queryKey: ['social', 'contact'],
    });
  };
}
