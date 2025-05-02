import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryClient } from '@lib/query.ts';
import { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import { ContactRequestsResponse } from '@bindings/ContactRequestsResponse.ts';
import { PresenceSocialUpdate } from '@bindings/PresenceSocialUpdate.ts';
import { api } from '@lib/queries/api.ts';

type UseProfilesSuspenseParams = {
  limit?: number;
  page?: number;
  query?: string;
};

export class ContactQuery {
  public static useRequiresAttention = () => {
    return useQuery({
      queryFn: () =>
        api.get(`auth/social/contact/ping`).then(res => res.data as boolean),
      queryKey: ['social', 'contact', 'ping'],
    });
  };

  public static handlePresenceSocialUpdate = (data: PresenceSocialUpdate) => {
    queryClient.setQueryData(['social', 'contact', 'ping'], data.content);
  };

  public static useProfilesSuspense = (props?: UseProfilesSuspenseParams) => {
    let params: UseProfilesSuspenseParams = {};
    if (props?.query) params.query = props.query;
    if (props?.limit) params.limit = props.limit;
    if (props?.page) params.page = props.page;

    return useSuspenseQuery({
      queryFn: () =>
        api
          .get(`auth/social/contact/profiles`, {
            params,
          })
          .then(res => res.data as ProfileContactModelDTO[]),
      queryKey: ['social', 'contact', 'profiles', params],
    });
  };

  public static useUnhandledSuspense = () => {
    return useSuspenseQuery({
      queryFn: () =>
        api
          .get(`auth/social/contact/unhandled`)
          .then(res => res.data as ContactRequestsResponse),
      queryKey: ['social', 'contact', 'unhandled'],
    });
  };

  public static sendRequest = (username: string) => {
    return api.post(`auth/social/contact/send`, {
      username,
    });
  };

  public static cancelRequest = (id: string) => {
    return api.post(`auth/social/contact/cancel`, {
      id,
    });
  };

  public static answerRequest = (id: string, accept: boolean) => {
    return api.post(`auth/social/contact/answer`, {
      id,
      accept,
    });
  };

  public static removeContactRequest = (user_id: string) => {
    return api.delete(`auth/social/contact`, {
      data: {
        user_id,
      },
    });
  };

  public static invalidateContact = () => {
    return queryClient.invalidateQueries({
      queryKey: ['social', 'contact'],
    });
  };
}
