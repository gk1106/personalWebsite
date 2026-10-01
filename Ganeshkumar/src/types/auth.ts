/** Shapes for POST /api/auth/login, matching the backend exactly. */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  /** Seconds. */
  expiresIn: number;
}
