import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { UserModel } from '@models/user.ts';
import { UsageStats } from '@models/usage.ts';
import { queryClient } from '@lib/query.ts';

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
        axios
          .get(`${BASE_URL}auth/admin/user`)
          .then(res => res.data as UserModel[]),
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
        axios
          .get(`${BASE_URL}auth/admin/user/${id}`)
          .then(res => res.data as UserModel),
      queryKey: ['admin', 'user', id],
    });
  };

  public static createUserFn = async (
    username: string,
    password: string,
    limit: number,
  ) => {
    return axios
      .post(`${BASE_URL}auth/admin/user`, {
        username,
        password,
        storage_limit: limit,
      })
      .then(res => res.data as UserModel);
  };

  public static deleteUserFn = async (id: string) => {
    return axios.delete(`${BASE_URL}auth/admin/user/${id}`);
  };

  public static updateUserFn = async (id: string, data: AdminUserUpdate) => {
    return axios
      .patch(`${BASE_URL}auth/admin/user/${id}`, data)
      .then(() => AdminQuery.invalidateUser(id));
  };

  public static useUserUsage = (id?: string) => {
    return useQuery({
      queryFn: () =>
        axios
          .get(`${BASE_URL}auth/admin/user/${id}/usage`)
          .then(res => res.data as UsageStats),
      queryKey: ['admin', 'user', id, 'usage'],
    });
  };
}
