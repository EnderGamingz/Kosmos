import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@lib/query.ts';
import { UserModelDTO } from '@bindings/UserModelDTO.ts';
import { DiskUsageStats } from '@bindings/DiskUsageStats.ts';
import { api } from '@lib/queries/api.ts';

export type AdminUserUpdate = {
  username?: string;
  email?: string;
  full_name?: string;
  new_password?: string;
  storage_limit?: number;
  new_role?: number;
};

export class AdminQuery {
  public static useUsers = () => {
    return useQuery({
      queryFn: () =>
        api.get(`auth/admin/user`).then(res => res.data as UserModelDTO[]),
      queryKey: ['admin', 'user'],
    });
  };

  public static invalidateUsers = () => {
    return queryClient.invalidateQueries({
      queryKey: ['admin', 'user'],
    });
  };

  public static invalidateUser = (id: string) => {
    return queryClient.invalidateQueries({
      queryKey: ['admin', 'user', id],
    });
  };

  public static useUser = (id?: string) => {
    return useQuery({
      queryFn: () =>
        api.get(`auth/admin/user/${id}`).then(res => res.data as UserModelDTO),
      queryKey: ['admin', 'user', id],
    });
  };

  public static createUserFn = async (
    username: string,
    password: string,
    limit: number,
  ) => {
    return api
      .post(`auth/admin/user`, {
        username,
        password,
        storage_limit: limit,
      })
      .then(res => res.data as UserModelDTO);
  };

  public static deleteUserFn = async (id: string) => {
    return api.delete(`auth/admin/user/${id}`);
  };

  public static updateUserFn = async (id: string, data: AdminUserUpdate) => {
    return api
      .patch(`auth/admin/user/${id}`, data)
      .then(() => AdminQuery.invalidateUser(id));
  };

  public static useUserUsage = (id?: string) => {
    return useQuery({
      queryFn: () =>
        api
          .get(`auth/admin/user/${id}/usage`)
          .then(res => res.data as DiskUsageStats),
      queryKey: ['admin', 'user', id, 'usage'],
    });
  };
}
