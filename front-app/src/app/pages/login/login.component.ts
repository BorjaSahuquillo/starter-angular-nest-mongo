import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LoginCredentialsModel } from '../../models/login-credentials.model';
import { AuthService } from '../../services/auth.service';
import { GoogleAuthHelperService } from '../../services/google-auth-helper.service';
import { ThemeService } from '../../services/theme.service';
import { GoogleCredentialResponse } from '../../utils/google-auth.types';

// PrimeNG imports
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// Transloco imports
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    TranslocoPipe,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  loading = false;
  environment = environment;
  private googleAuthTimeout?: ReturnType<typeof setTimeout>;

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private googleAuthHelper = inject(GoogleAuthHelperService);
  private translocoService = inject(TranslocoService);
  private themeService = inject(ThemeService);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Initialize Google OAuth
    this.initializeGoogleAuth();
  }

  login(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    // Create credentials model
    const credentials = LoginCredentialsModel.create(
      this.loginForm.value.email,
      this.loginForm.value.password,
      this.loginForm.value.rememberMe || false,
    );

    // Call authentication service
    this.authService.login(credentials).subscribe({
      next: (success) => {
        if (success) {
          // ✅ Success toast for traditional login
          this.messageService.add({
            severity: 'success',
            summary: this.translocoService.translate('LOGIN.MESSAGES.WELCOME'),
            detail: this.translocoService.translate(
              'LOGIN.MESSAGES.LOGIN_SUCCESS',
            ),
            life: 3000,
          });

          // Get redirect URL or go to dashboard by default
          const redirectUrl =
            sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        }
      },
      error: (error: unknown) => {
        console.error('Login error:', error);
        // Show error message to user
        this.messageService.add({
          severity: 'error',
          summary: this.translocoService.translate('LOGIN.MESSAGES.AUTH_ERROR'),
          detail:
            (error as Error).message ||
            this.translocoService.translate(
              'LOGIN.MESSAGES.INVALID_CREDENTIALS',
            ),
          life: 5000,
        });
      },
      complete: () => {
        this.resetLoadingState();
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return this.translocoService.translate(
          `LOGIN.VALIDATION.${fieldName.toUpperCase()}_REQUIRED`,
        );
      }
      if (field.errors['email']) {
        return this.translocoService.translate(
          'LOGIN.VALIDATION.EMAIL_INVALID',
        );
      }
      if (field.errors['minlength']) {
        return this.translocoService.translate(
          'LOGIN.VALIDATION.PASSWORD_MIN_LENGTH',
        );
      }
    }
    return '';
  }

  private async initializeGoogleAuth(): Promise<void> {
    try {
      await this.googleAuthHelper.initializeGoogleAuth(
        (response: GoogleCredentialResponse) => {
          this.handleGoogleAuthResponse(response);
        },
      );

      // Only render native button in development
      // In production, FedCM will handle this automatically
      if (!environment.production) {
        this.renderGoogleButton();
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translocoService.translate('LOGIN.MESSAGES.CONFIG_ERROR'),
        detail: this.translocoService.translate(
          'LOGIN.MESSAGES.GOOGLE_OAUTH_INIT_ERROR',
        ),
        life: 5000,
      });
    }
  }

  /**
   * Renders native Google button
   */
  private renderGoogleButton(): void {
    const buttonContainer = document.getElementById('google-signin-button');
    if (buttonContainer && window.google?.accounts?.id) {
      // Clear previous content
      buttonContainer.innerHTML = '';

      // Detect if we are in dark mode
      const isDarkMode = this.themeService.getIsDark();

      // Render native Google button
      window.google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: isDarkMode ? 'filled_black' : 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        // No fixed width to make it responsive
      });

      console.log('✅ Native Google button rendered');
    } else {
      console.warn(
        'Container not found or Google not loaded, showing fallback',
      );
      this.showFallbackButton();
    }
  }

  /**
   * Shows alternative fallback button
   */
  private showFallbackButton(): void {
    const fallbackButton = document.querySelector(
      '.google-button',
    ) as HTMLElement;
    if (fallbackButton) {
      fallbackButton.style.display = 'block';
    }
  }

  /**
   * Handles Google OAuth button click
   */
  loginWithGoogle(): void {
    this.loading = true;

    // Use direct Google Sign-In instead of prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();

      // Reset loading after timeout in case user cancels
      this.googleAuthTimeout = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          console.log(
            'Google OAuth timeout - user likely cancelled or closed popup',
          );
        }
      }, 30000); // 30 seconds timeout
    } else {
      console.error(
        'Error triggering Google sign-in: Google OAuth not initialized',
      );
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: this.translocoService.translate(
          'LOGIN.MESSAGES.GOOGLE_OAUTH_ERROR',
        ),
        detail: this.translocoService.translate(
          'LOGIN.MESSAGES.GOOGLE_OAUTH_START_ERROR',
        ),
        life: 5000,
      });
    }
  }

  private handleGoogleAuthResponse(response: GoogleCredentialResponse): void {
    // Clear timeout since we received response
    if (this.googleAuthTimeout) {
      clearTimeout(this.googleAuthTimeout);
      this.googleAuthTimeout = undefined;
    }

    // Decode user information
    const userInfo = this.googleAuthHelper.decodeGoogleToken(
      response.credential,
    );

    console.log('Google user info:', userInfo);

    // Create DTO for backend
    const googleAuthRequest = {
      credential: response.credential,
      clientId: userInfo.aud,
    };

    // Use AuthService to handle login
    this.authService.loginWithGoogle(googleAuthRequest).subscribe({
      next: (success) => {
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: this.translocoService.translate('LOGIN.MESSAGES.WELCOME'),
            detail: this.translocoService.translate(
              'LOGIN.MESSAGES.GOOGLE_LOGIN_SUCCESS',
              { name: userInfo.name },
            ),
            life: 3000,
          });

          // Redirect to dashboard
          const redirectUrl =
            sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        }
      },
      error: (error: unknown) => {
        console.error('Google OAuth error:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translocoService.translate('LOGIN.MESSAGES.AUTH_ERROR'),
          detail:
            (error as Error).message ||
            this.translocoService.translate(
              'LOGIN.MESSAGES.GOOGLE_AUTH_COMPLETE_ERROR',
            ),
          life: 5000,
        });
      },
      complete: () => {
        this.resetLoadingState();
      },
    });
  }

  ngOnDestroy(): void {
    // Clear timeout when destroying component
    if (this.googleAuthTimeout) {
      clearTimeout(this.googleAuthTimeout);
    }
  }

  private resetLoadingState(): void {
    this.loading = false;
    if (this.googleAuthTimeout) {
      clearTimeout(this.googleAuthTimeout);
      this.googleAuthTimeout = undefined;
    }
  }
}
