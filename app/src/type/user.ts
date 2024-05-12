export interface UserModel {
  id: number;
  username: string;
  password_hash: string;
  full_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}
