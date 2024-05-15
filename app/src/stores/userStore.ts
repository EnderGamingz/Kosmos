import { create } from 'zustand';
import axios from 'axios';
import { BASE_URL } from '../vars.ts';
import { UserModel } from '../type/user.ts';

export interface UserState {
  user?: UserModel;
  fetchUser: () => void;
  setUser: (user: UserModel) => void;
  initialized: boolean;
}

export const useUserState = create<UserState>(set => ({
  user: undefined,
  initialized: false,
  fetchUser: async () => {
    const user = await axios
      .get(BASE_URL + 'auth')
      .then(({ data }) => data)
      .catch()
      .finally(() => {
        set({ initialized: true });
      });

    if (user) set({ user });
  },
  setUser: (data: UserModel) => {
    set({ user: data, initialized: true });
  },
}));
