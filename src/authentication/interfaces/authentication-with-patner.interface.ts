export interface AuthenticationRecord {
  id: string;
  user_id: string;
  secret: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  users: {
    assemble_user_id: string;
  };
}
