import { Observable } from 'rxjs';
import {
  AuthResponseDTO,
  GoogleAuthRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  UserDTO,
} from '../core/dtos';

export interface IAuthRepository {
  login(credentials: LoginRequestDTO): Observable<AuthResponseDTO>;
  register(data: RegisterRequestDTO): Observable<AuthResponseDTO>;
  loginWithGoogle(
    googleResponse: GoogleAuthRequestDTO,
  ): Observable<AuthResponseDTO>;
  refreshToken(refreshToken: string): Observable<AuthResponseDTO>;
  logout(): Observable<void>;
  verifyToken(token: string): Observable<UserDTO>;
  getCurrentUser(): Observable<UserDTO>;
}
