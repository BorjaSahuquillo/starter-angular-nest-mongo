export interface AuthTokensDTO {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}
