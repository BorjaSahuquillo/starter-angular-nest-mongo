import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { IAuthRepository } from '../../interfaces';
import { AUTH_ENDPOINTS, AUTH_ERRORS } from '../../utils/auth.config';
import {
  ApiResponseDTO,
  AuthResponseDTO,
  GoogleAuthRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  UserDTO,
} from '../dtos';

@Injectable({
  providedIn: 'root',
})
export class AuthRepository implements IAuthRepository {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}${environment.api.prefix}`;

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  login(credentials: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.http
      .post<
        ApiResponseDTO<AuthResponseDTO>
      >(this.buildUrl(AUTH_ENDPOINTS.LOGIN), credentials)
      .pipe(
        map((response) => this.handleApiResponse(response)),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.INVALID_CREDENTIALS),
        ),
      );
  }

  register(data: RegisterRequestDTO): Observable<AuthResponseDTO> {
    return this.http
      .post<
        ApiResponseDTO<AuthResponseDTO>
      >(this.buildUrl(AUTH_ENDPOINTS.REGISTER), data)
      .pipe(
        map((response) => this.handleApiResponse(response)),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.VALIDATION_ERROR),
        ),
      );
  }

  loginWithGoogle(
    googleResponse: GoogleAuthRequestDTO,
  ): Observable<AuthResponseDTO> {
    return this.http
      .post<ApiResponseDTO<AuthResponseDTO>>(
        this.buildUrl(AUTH_ENDPOINTS.GOOGLE_AUTH),
        {
          credential: googleResponse.credential,
          clientId: googleResponse.clientId,
        },
      )
      .pipe(
        map((response) => this.handleApiResponse(response)),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.GOOGLE_AUTH_ERROR),
        ),
      );
  }

  refreshToken(refreshToken: string): Observable<AuthResponseDTO> {
    // The authInterceptor should not add token to this endpoint
    // because we are sending the refreshToken explicitly
    const headers = new HttpHeaders({
      Authorization: `Bearer ${refreshToken}`,
    });

    return this.http
      .post<
        ApiResponseDTO<AuthResponseDTO>
      >(this.buildUrl(AUTH_ENDPOINTS.REFRESH), {}, { headers })
      .pipe(
        map((response) => this.handleApiResponse(response)),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.TOKEN_EXPIRED),
        ),
      );
  }

  logout(): Observable<void> {
    // The authInterceptor will handle adding the token automatically
    return this.http
      .post<ApiResponseDTO<void>>(this.buildUrl(AUTH_ENDPOINTS.LOGOUT), {})
      .pipe(
        map(() => void 0),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.SERVER_ERROR),
        ),
      );
  }

  verifyToken(_token: string): Observable<UserDTO> {
    // The authInterceptor will handle adding the token automatically
    return this.http
      .get<ApiResponseDTO<UserDTO>>(this.buildUrl(AUTH_ENDPOINTS.VERIFY))
      .pipe(
        map((response) => this.handleApiResponse(response)),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.TOKEN_EXPIRED),
        ),
      );
  }

  getCurrentUser(): Observable<UserDTO> {
    // The authInterceptor will handle adding the token automatically
    return this.http
      .get<ApiResponseDTO<UserDTO>>(this.buildUrl(AUTH_ENDPOINTS.ME))
      .pipe(
        map((response) => this.handleApiResponse(response)),
        catchError((error) =>
          this.handleError(error, AUTH_ERRORS.UNAUTHORIZED),
        ),
      );
  }

  private handleApiResponse<T>(response: ApiResponseDTO<T>): T {
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error en la respuesta del servidor');
    }
    return response.data;
  }

  private handleError(
    error: HttpErrorResponse,
    defaultError: string,
  ): Observable<never> {
    let errorType = defaultError;

    if (error.status === 401) {
      errorType = AUTH_ERRORS.UNAUTHORIZED;
    } else if (error.status === 422) {
      errorType = AUTH_ERRORS.VALIDATION_ERROR;
    } else if (error.status >= 500) {
      errorType = AUTH_ERRORS.SERVER_ERROR;
    } else if (!navigator.onLine) {
      errorType = AUTH_ERRORS.NETWORK_ERROR;
    }

    console.error('Auth Repository Error:', error);
    return throwError(() => new Error(errorType));
  }
}
