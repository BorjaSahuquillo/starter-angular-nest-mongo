import { Component, inject, OnInit, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, InputTextModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('front-app');
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    // Theme is already automatically initialized in the service constructor
    // but we can force initialization here if necessary
    console.log('🎨 Theme initialized:', this.themeService.getCurrentTheme());
  }
}
