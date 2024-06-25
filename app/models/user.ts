export type UserModel = {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  storage_limit: number;
  created_at: string;
  updated_at: string;
};

export type UsageResponse = {
  active: number;
  bin: number;
  total: number;
  limit: number;
};
