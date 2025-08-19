import { AuthTokensDTO } from './auth-tokens.dto';
import { UserDTO } from './user.dto';

export interface AuthResponseDTO {
  user: UserDTO;
  tokens: AuthTokensDTO;
  message?: string;
}
