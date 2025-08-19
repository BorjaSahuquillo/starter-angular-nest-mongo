import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../../services/auth.service';

/**
 * Interceptor to handle HTTP errors in a centralized way
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);
  const translocoService = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error for debugging
      console.error('HTTP Error intercepted:', error);

      // 🚨 DO NOT intercept auth endpoint errors to avoid loops
      const isAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/logout') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh');

      if (isAuthEndpoint) {
        console.log('🔄 Skipping interceptor for auth endpoint:', req.url);
        return throwError(() => error);
      }

      // Handle different types of errors
      switch (error.status) {
        case 401:
          // Expired or invalid token
          handleUnauthorizedError(
            authService,
            router,
            messageService,
            translocoService,
          );
          break;

        case 403:
          // Insufficient permissions
          console.error('Access forbidden - insufficient permissions');
          messageService.add({
            severity: 'error',
            summary: translocoService.translate('ERRORS.ACCESS_DENIED'),
            detail: translocoService.translate('ERRORS.ACCESS_DENIED_DETAIL'),
            life: 5000,
          });
          break;

        case 404:
          // Resource not found
          console.error('Resource not found');
          messageService.add({
            severity: 'warn',
            summary: translocoService.translate('ERRORS.RESOURCE_NOT_FOUND'),
            detail: translocoService.translate(
              'ERRORS.RESOURCE_NOT_FOUND_DETAIL',
            ),
            life: 4000,
          });
          break;

        case 422:
          // Validation error
          console.error('Validation error:', error.error);
          messageService.add({
            severity: 'warn',
            summary: translocoService.translate('ERRORS.VALIDATION_ERROR'),
            detail: translocoService.translate(
              'ERRORS.VALIDATION_ERROR_DETAIL',
            ),
            life: 4000,
          });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('Server error');
          messageService.add({
            severity: 'error',
            summary: translocoService.translate('ERRORS.SERVER_ERROR'),
            detail: translocoService.translate('ERRORS.SERVER_ERROR_DETAIL'),
            life: 6000,
          });
          break;

        case 0:
          // Network/connection error
          if (!navigator.onLine) {
            console.error('No internet connection');
            messageService.add({
              severity: 'error',
              summary: translocoService.translate('ERRORS.NO_CONNECTION'),
              detail: translocoService.translate('ERRORS.NO_CONNECTION_DETAIL'),
              life: 8000,
            });
          } else {
            console.error('Network error');
            messageService.add({
              severity: 'error',
              summary: translocoService.translate('ERRORS.NETWORK_ERROR'),
              detail: translocoService.translate('ERRORS.NETWORK_ERROR_DETAIL'),
              life: 5000,
            });
          }
          break;

        default:
          console.error('Unknown error occurred');
          messageService.add({
            severity: 'error',
            summary: translocoService.translate('ERRORS.UNEXPECTED_ERROR'),
            detail: translocoService.translate(
              'ERRORS.UNEXPECTED_ERROR_DETAIL',
            ),
            life: 5000,
          });
          break;
      }

      // Re-throw the error so components can handle it too
      return throwError(() => error);
    }),
  );
};

/**
 * Handles 401 (Unauthorized) errors
 */
// Variable to prevent logout loops
let isHandlingLogout = false;

function handleUnauthorizedError(
  authService: AuthService,
  router: Router,
  messageService: MessageService,
  translocoService: TranslocoService,
): void {
  console.log('Unauthorized request - clearing auth state');

  // 🚨 PREVENT INFINITE LOOP
  if (isHandlingLogout) {
    console.log('🛑 Already handling logout, skipping...');
    return;
  }

  isHandlingLogout = true;

  // Clear authentication state
  authService.logout();

  // Save current URL for redirect after login
  const currentUrl = router.url;
  if (currentUrl !== '/login') {
    sessionStorage.setItem('redirectUrl', currentUrl);
  }

  // ✅ Toast notification ONLY if we are not on login page
  if (currentUrl !== '/login') {
    // 🧹 Clear previous notifications to avoid spam
    messageService.clear();

    messageService.add({
      severity: 'warn',
      summary: translocoService.translate('ERRORS.SESSION_EXPIRED'),
      detail: translocoService.translate('ERRORS.SESSION_EXPIRED_DETAIL'),
      life: 6000,
    });
  }

  // Redirect to login WITHOUT queryParams
  router.navigate(['/login']).then(() => {
    // Reset the flag after redirection
    setTimeout(() => {
      isHandlingLogout = false;
    }, 1000);
  });
}
