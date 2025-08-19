import { IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  credential: string;

  @IsString()
  clientId: string;
}
