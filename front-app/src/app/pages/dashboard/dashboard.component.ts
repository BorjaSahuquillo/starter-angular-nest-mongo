import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeSwitcherComponent } from '../../components/theme-switcher/theme-switcher.component';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

// Transloco imports
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TranslocoPipe,
    ThemeSwitcherComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  currentUser: UserModel | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    console.log('🚪 Init logout...');

    this.authService.logoutSecure().subscribe({
      next: () => {
        console.log('✅ Logout completed successfully');
        this.router.navigate(['/login']);
      },
      error: () => {
        console.error('💥 Unexpected critical error in logout');
        this.router.navigate(['/login']);
      },
    });
  }
}
