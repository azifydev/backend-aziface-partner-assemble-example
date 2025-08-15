export interface JwtPayload {
  sub: string; // subject (user id)
  name?: string;
  assemble_user_id?: string;
  iat: number; // issued at
  exp: number; // expiration time
}
