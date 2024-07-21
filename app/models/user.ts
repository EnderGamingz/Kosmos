export enum Role {
  User,
  Admin,
}

export function roleToString(role: Role) {
  switch (role) {
    case Role.User:
      return 'User';
    case Role.Admin:
      return 'Admin';
  }
}

export type UserModel = {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  storage_limit: number;
  role: Role;
  created_at: string;
  updated_at: string;
};
