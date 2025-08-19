import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { RegisterRequestDTO } from '../../core/dtos/register-request.dto';
import { AuthService } from '../../services/auth.service';

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

// Custom validator for password confirmation
function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);

  // Public properties - using signals for state management
  readonly loading = signal(false);

  // Computed properties
  readonly isFormValid = computed(() => this.registerForm?.valid ?? false);

  // Form setup
  registerForm: FormGroup = this.formBuilder.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator },
  );

  /**
   * Handles traditional registration form submission
   */
  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      // Model validation error
      const firstError = this.getFirstFormError();
      if (firstError) {
        // Show validation error message
        this.messageService.add({
          severity: 'warn',
          summary: this.translocoService.translate(
            'REGISTER.MESSAGES.VALIDATION_ERROR',
          ),
          detail: firstError,
          life: 5000,
        });
      }
      return;
    }

    this.loading.set(true);

    const registerData: RegisterRequestDTO = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    // Call authentication service
    this.authService.register(registerData).subscribe({
      next: (success) => {
        if (success) {
          // ✅ Success toast for traditional registration
          this.messageService.add({
            severity: 'success',
            summary: this.translocoService.translate(
              'REGISTER.MESSAGES.SUCCESS',
            ),
            detail: this.translocoService.translate(
              'REGISTER.MESSAGES.ACCOUNT_CREATED',
            ),
            life: 5000,
          });

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: unknown) => {
        console.error('Registration error:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translocoService.translate(
            'REGISTER.MESSAGES.REGISTRATION_FAILED',
          ),
          detail:
            (error as Error).message ||
            this.translocoService.translate(
              'REGISTER.MESSAGES.REGISTRATION_FAILED_DETAIL',
            ),
          life: 5000,
        });
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  /**
   * Form validation helpers
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (
      fieldName === 'confirmPassword' &&
      this.registerForm.errors?.['passwordMismatch']
    ) {
      return 'Passwords do not match';
    }

    return 'Invalid value';
  }

  private getFirstFormError(): string | null {
    const controls = this.registerForm.controls;

    for (const [fieldName, control] of Object.entries(controls)) {
      if (control.invalid) {
        return this.getFieldError(fieldName);
      }
    }

    // Check form-level errors
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return null;
  }
}
