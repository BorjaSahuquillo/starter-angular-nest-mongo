import { UserDTO } from '../core/dtos';

export class UserModel {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly picture?: string;
  public readonly givenName?: string;
  public readonly familyName?: string;
  public readonly locale?: string;
  public readonly verifiedEmail?: boolean;

  constructor(dto: UserDTO) {
    this.id = dto.id;
    this.email = dto.email;
    this.name = dto.name;
    this.picture = dto.picture;
    this.givenName = dto.given_name;
    this.familyName = dto.family_name;
    this.locale = dto.locale;
    this.verifiedEmail = dto.verified_email;
  }

  public getDisplayName(): string {
    return this.name || this.email;
  }

  public getInitials(): string {
    if (this.givenName && this.familyName) {
      return `${this.givenName.charAt(0)}${this.familyName.charAt(0)}`.toUpperCase();
    }
    return this.name.charAt(0).toUpperCase();
  }

  public hasProfilePicture(): boolean {
    return !!this.picture;
  }

  public isEmailVerified(): boolean {
    return this.verifiedEmail === true;
  }

  public toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      picture: this.picture,
      given_name: this.givenName,
      family_name: this.familyName,
      locale: this.locale,
      verified_email: this.verifiedEmail,
    };
  }

  public static fromDTO(dto: UserDTO): UserModel {
    return new UserModel(dto);
  }
}
