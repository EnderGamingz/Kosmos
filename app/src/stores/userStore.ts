import { create } from 'zustand';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';

export type User = UserModelDTO & { fetched_at: number };
export type UserState = {
  user?: User;
  error?: string;
  fetchUser: (props?: { background: boolean }) => void;
  setUser: (user: UserModelDTO) => void;
  logout: () => void;
  initialized: boolean;
};

export const useUserState = create<UserState>(set => ({
  user: undefined,
  initialized: false,
  error: undefined,
  fetchUser: async props => {
    if (!props?.background) set({ initialized: false, error: undefined });

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

    if (user) set({ user: { ...user, fetched_at: Date.now() } });
  },
  setUser: (data: UserModelDTO) => {
    set({
      user: { ...data, fetched_at: Date.now() },
      initialized: true,
      error: undefined,
    });
  },
  logout: () => {
    set({ user: undefined });
  },
}));
