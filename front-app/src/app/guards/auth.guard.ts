import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    const url = segments.map((segment) => segment.path).join('/');
    return this.checkAuth(`/${url}`);
  }

  private checkAuth(url: string): Observable<boolean> {
    // Si ya estamos autenticados, permitir acceso
    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    // Si no estamos autenticados, verificar con el servidor
    return this.authService.checkAuthStatus().pipe(
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.handleUnauthorizedAccess(url);
        }
      }),
      catchError(() => {
        this.handleUnauthorizedAccess(url);
        return of(false);
      }),
    );
  }

  private handleUnauthorizedAccess(attemptedUrl: string): void {
    console.log(`Access denied to: ${attemptedUrl}`);

    // Save the URL they were trying to access for redirect after login
    if (attemptedUrl !== '/login') {
      sessionStorage.setItem('redirectUrl', attemptedUrl);
    }

    // Redirigir al login SIN queryParams
    this.router.navigate(['/login']);
  }
}

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          // If already authenticated, redirect to dashboard or home
          const redirectUrl =
            sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
          return false;
        }
        return true;
      }),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _state: RouterStateSnapshot,
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return of(true);
    }

    return this.authService.user$.pipe(
      map((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Here you would implement role logic according to your user model
        // Example: user.roles?.some(role => requiredRoles.includes(role))
        // For now, return true if the user exists
        return true;
      }),
    );
  }
}
