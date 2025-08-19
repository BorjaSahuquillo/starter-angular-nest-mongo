import { LoginRequestDTO } from '../core/dtos';

export class LoginCredentialsModel {
  public readonly email: string;
  public readonly password: string;
  public readonly rememberMe: boolean;

  constructor(email: string, password: string, rememberMe: boolean = false) {
    // Simple data model - validation is handled by reactive forms
    this.email = email?.trim()?.toLowerCase() || '';
    this.password = password || '';
    this.rememberMe = rememberMe;
  }

  public toDTO(): LoginRequestDTO {
    return {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    };
  }

  public static fromDTO(dto: LoginRequestDTO): LoginCredentialsModel {
    return new LoginCredentialsModel(dto.email, dto.password, dto.rememberMe);
  }

  public static create(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): LoginCredentialsModel {
    return new LoginCredentialsModel(email, password, rememberMe);
  }
}
