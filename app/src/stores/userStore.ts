import { create } from 'zustand';
import axios from 'axios';
import { BASE_URL } from '../vars.ts';

export interface UserModel {
  id: number;
  username: string;
  password_hash: string;
  full_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserState {
  user?: UserModel;
  fetchUser: () => void;
  setUser: (user: UserModel) => void;
}

export const useUserState = create<UserState>(set => ({
  user: undefined,
  fetchUser: async () => {
    const user = await axios
      .get(BASE_URL + 'auth')
      .then(({ data }) => data)
      .catch();

    if (user) set({ user });
  },
  setUser: (data: UserModel) => {
    set({ user: data });
  },
}));
