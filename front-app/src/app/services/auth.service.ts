import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { GoogleAuthRequestDTO, RegisterRequestDTO } from '../core/dtos';
import { AuthRepository } from '../core/repositories/auth.repository';
import { IAuthService } from '../interfaces';
import { AuthTokensModel } from '../models/auth-tokens.model';
import { LoginCredentialsModel } from '../models/login-credentials.model';
import { UserModel } from '../models/user.model';
import { AUTH_ERRORS, TOKEN_STORAGE_KEYS } from '../utils/auth.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {
  private userSubject = new BehaviorSubject<UserModel | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly user$ = this.userSubject.asObservable();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();

  private authRepository = inject(AuthRepository);
  private translocoService = inject(TranslocoService);

  constructor() {
    this.initializeAuthState();
  }

  // Synchronous getters
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): UserModel | null {
    return this.userSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Traditional authentication
  login(credentials: LoginCredentialsModel): Observable<boolean> {
    this.setLoading(true);

    return this.authRepository.login(credentials.toDTO()).pipe(
      tap((authResponse) => {
        const user = UserModel.fromDTO(authResponse.user);
        const tokens = AuthTokensModel.fromDTO(authResponse.tokens);
        this.handleSuccessfulAuth(user, tokens);
      }),
      map(() => true),
      catchError((error) => this.handleAuthError(error)),
      tap(() => this.setLoading(false)),
    );
  }

  register(data: RegisterRequestDTO): Observable<boolean> {
    this.setLoading(true);

    return this.authRepository.register(data).pipe(
      tap((authResponse) => {
        const user = UserModel.fromDTO(authResponse.user);
        const tokens = AuthTokensModel.fromDTO(authResponse.tokens);
        this.handleSuccessfulAuth(user, tokens);
      }),
      map(() => true),
      catchError((error) => this.handleAuthError(error)),
      tap(() => this.setLoading(false)),
    );
  }

  // OAuth Google
  loginWithGoogle(googleResponse: GoogleAuthRequestDTO): Observable<boolean> {
    this.setLoading(true);

    return this.authRepository.loginWithGoogle(googleResponse).pipe(
      tap((authResponse) => {
        const user = UserModel.fromDTO(authResponse.user);
        const tokens = AuthTokensModel.fromDTO(authResponse.tokens);
        this.handleSuccessfulAuth(user, tokens);
      }),
      map(() => true),
      catchError((error) => this.handleAuthError(error)),
      tap(() => this.setLoading(false)),
    );
  }

  // Silent logout (does not wait for response)
  logout(): void {
    // 📡 Optional backend logout (completely silent)
    this.authRepository.logout().subscribe({
      next: () => {
        console.log('📡 Backend logout successful');
      },
      error: (error) => {
        console.log("📡 Backend logout failed (doesn't matter):", error.status);
        // Doesn't matter if it fails, frontend is already cleaned
      },
    });
  }

  // Secure logout with local fallback
  logoutSecure(): Observable<void> {
    return this.authRepository.logout().pipe(
      tap(() => {
        // Backend successful: clear state
        this.clearAuthState();
        console.log('🛡️ Logout exitoso: backend y frontend limpios');
      }),
      catchError((error) => {
        console.warn('🚨 Backend logout failed:', error);

        // 🔍 Evaluate error type and decide
        if (error.status === 401) {
          // Token already invalid - local logout OK
          console.log('🔑 Token already invalid, doing local logout');
          this.clearAuthState();
          return of(void 0);
        } else if (
          error.status === 500 ||
          error.status === 503 ||
          error.status === 0
        ) {
          // Server/network error - local logout for security
          console.log('🌐 Error de conectividad, forzando logout local');
          this.clearAuthState();
          return of(void 0);
        } else {
          // Other errors (403, 422, etc.) - local logout too
          console.log(
            '⚠️ Error inesperado, haciendo logout local por seguridad',
          );
          this.clearAuthState();
          return of(void 0);
        }
      }),
    );
  }

  // Refresh token
  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      this.clearAuthState();
      return of(false);
    }

    return this.authRepository.refreshToken(refreshToken).pipe(
      tap((authResponse) => {
        const user = UserModel.fromDTO(authResponse.user);
        const tokens = AuthTokensModel.fromDTO(authResponse.tokens);
        this.handleSuccessfulAuth(user, tokens);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Refresh token failed:', error);
        this.clearAuthState();
        return of(false);
      }),
    );
  }

  // Verify authentication state
  checkAuthStatus(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      this.clearAuthState();
      return of(false);
    }

    // Verify if the token has expired
    if (this.isTokenExpired()) {
      return this.refreshToken();
    }

    // Verify token with the server
    return this.authRepository.verifyToken(token).pipe(
      tap((userDTO) => {
        const user = UserModel.fromDTO(userDTO);
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(() => true),
      catchError(() => {
        // If verification fails, try refresh
        return this.refreshToken();
      }),
    );
  }

  // Private methods
  private initializeAuthState(): void {
    const token = this.getToken();
    const userData = localStorage.getItem(TOKEN_STORAGE_KEYS.USER_DATA);

    // 🚀 SIMPLE: If there is a token and user data, load state
    if (token && userData) {
      try {
        const userDTO = JSON.parse(userData);
        const user = UserModel.fromDTO(userDTO);
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('✅ Usuario cargado desde localStorage');
      } catch (error) {
        console.error('Error parseando usuario:', error);
        this.clearAuthState();
      }
    } else {
      // 🧹 Si no hay datos completos, limpiar todo
      this.clearAuthState();
    }
  }

  private handleSuccessfulAuth(user: UserModel, tokens: AuthTokensModel): void {
    // Save tokens
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);

    if (tokens.hasRefreshToken()) {
      localStorage.setItem(
        TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
        tokens.refreshToken!,
      );
    }

    // Calculate expiration time
    const expiresAt = tokens.expiresAt.getTime();
    localStorage.setItem(TOKEN_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    // Save user data
    localStorage.setItem(
      TOKEN_STORAGE_KEYS.USER_DATA,
      JSON.stringify(user.toDTO()),
    );

    // Update state
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  clearAuthState(): void {
    Object.values(TOKEN_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRES_AT);

    if (!expiresAt) {
      return true;
    }

    return Date.now() >= parseInt(expiresAt);
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private handleAuthError(error: Error): Observable<never> {
    console.error('Auth Service error:', error);

    // Map error messages to Transloco keys
    let translationKey = 'ERRORS.UNEXPECTED_ERROR';

    switch (error.message) {
      case AUTH_ERRORS.INVALID_CREDENTIALS:
        translationKey = 'LOGIN.MESSAGES.INVALID_CREDENTIALS';
        break;
      case AUTH_ERRORS.NETWORK_ERROR:
        translationKey = 'ERRORS.NETWORK_ERROR';
        break;
      case AUTH_ERRORS.TOKEN_EXPIRED:
        translationKey = 'ERRORS.AUTH.EXPIRED_TOKEN';
        break;
      case AUTH_ERRORS.UNAUTHORIZED:
        translationKey = 'ERRORS.AUTH.UNAUTHORIZED';
        break;
      case AUTH_ERRORS.SERVER_ERROR:
        translationKey = 'ERRORS.SERVER_ERROR';
        break;
      case AUTH_ERRORS.VALIDATION_ERROR:
        translationKey = 'ERRORS.VALIDATION_ERROR';
        break;
      case AUTH_ERRORS.GOOGLE_AUTH_ERROR:
        translationKey = 'LOGIN.MESSAGES.GOOGLE_AUTH_COMPLETE_ERROR';
        break;
    }

    const errorMessage = this.translocoService.translate(translationKey);
    return throwError(() => new Error(errorMessage));
  }
}
