import { HttpInterceptorFn } from '@angular/common/http';

import { AUTH_ENDPOINTS, TOKEN_STORAGE_KEYS } from '../../utils/auth.config';

/**
 * Interceptor to automatically add authorization token
 * to HTTP requests that require it
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // List of endpoints that do NOT require automatic authorization token
  const publicEndpoints = [
    AUTH_ENDPOINTS.LOGIN,
    AUTH_ENDPOINTS.REGISTER,
    AUTH_ENDPOINTS.GOOGLE_AUTH,
    AUTH_ENDPOINTS.REFRESH, // Refresh handles its own token
  ];

  // Check if it's a public endpoint
  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    req.url.includes(endpoint),
  );

  // If it's a public endpoint, continue without modifying
  if (isPublicEndpoint) {
    return next(req);
  }

  // 🔑 Get token directly from localStorage (avoids circular dependency)
  const token = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);

  // If no token, continue without modifying
  if (!token) {
    return next(req);
  }

  // Clone the request and add authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
