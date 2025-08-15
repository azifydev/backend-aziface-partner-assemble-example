export interface AuthenticationRecord {
  id: string;
  user_id: string;
  secret: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  system_users: {
    external_id: string;
  };
}
