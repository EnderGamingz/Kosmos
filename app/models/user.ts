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
