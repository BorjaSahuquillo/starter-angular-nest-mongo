import { AuthTokensDTO } from '../core/dtos';

export class AuthTokensModel {
  public readonly accessToken: string;
  public readonly refreshToken?: string;
  public readonly expiresIn: number;
  public readonly tokenType: string;
  public readonly expiresAt: Date;

  constructor(dto: AuthTokensDTO) {
    this.accessToken = dto.accessToken;
    this.refreshToken = dto.refreshToken;
    this.expiresIn = dto.expiresIn;
    this.tokenType = dto.tokenType;
    this.expiresAt = new Date(Date.now() + dto.expiresIn * 1000);
  }

  public isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  public isExpiringSoon(minutesThreshold: number = 5): boolean {
    const thresholdMs = minutesThreshold * 60 * 1000;
    return Date.now() >= this.expiresAt.getTime() - thresholdMs;
  }

  public hasRefreshToken(): boolean {
    return !!this.refreshToken;
  }

  public getTimeToExpiry(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }

  public toDTO(): AuthTokensDTO {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresIn: this.expiresIn,
      tokenType: this.tokenType,
    };
  }

  public static fromDTO(dto: AuthTokensDTO): AuthTokensModel {
    return new AuthTokensModel(dto);
  }
}
