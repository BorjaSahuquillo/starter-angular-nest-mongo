import { Observable } from 'rxjs';
import { GoogleAuthRequestDTO, RegisterRequestDTO } from '../core/dtos';
import { LoginCredentialsModel } from '../models/login-credentials.model';
import { UserModel } from '../models/user.model';

export interface IAuthService {
  // Authentication state
  isAuthenticated(): boolean;
  getCurrentUser(): UserModel | null;
  getToken(): string | null;

  // Authentication
  login(credentials: LoginCredentialsModel): Observable<boolean>;
  register(data: RegisterRequestDTO): Observable<boolean>;
  loginWithGoogle(googleResponse: GoogleAuthRequestDTO): Observable<boolean>;
  logout(): void;

  // Session management
  refreshToken(): Observable<boolean>;
  checkAuthStatus(): Observable<boolean>;

  // Observables para reactive programming
  user$: Observable<UserModel | null>;
  isAuthenticated$: Observable<boolean>;
  loading$: Observable<boolean>;
}
