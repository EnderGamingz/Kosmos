import { create } from 'zustand';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { UserModel } from '@models/user.ts';

export type UserState = {
  user?: UserModel;
  error?: string;
  fetchUser: () => void;
  setUser: (user: UserModel) => void;
  logout: () => void;
  initialized: boolean;
};

export const useUserState = create<UserState>(set => ({
  user: undefined,
  initialized: false,
  error: undefined,
  fetchUser: async () => {
    set({ initialized: false, error: undefined });
    const user = await axios
      .get(`${BASE_URL}auth`)
      .then(({ data }) => data)
      .catch(e => {
        if (e.response?.status === 401) {
          set({ initialized: true, user: undefined });
          return;
        }
        set({ error: e.response?.data?.message ?? e.message });
      })
      .finally(() => {
        set({ initialized: true });
      });

    if (user) set({ user });
  },
  setUser: (data: UserModel) => {
    set({ user: data, initialized: true, error: undefined });
  },
  logout: () => {
    set({ user: undefined });
  },
}));
