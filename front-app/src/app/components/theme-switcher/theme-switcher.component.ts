import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

import { Theme, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    RippleModule,
    TranslocoPipe,
  ],
  template: `
    <p-button
      [icon]="themeIcon()"
      [severity]="'secondary'"
      [text]="true"
      [rounded]="true"
      [pTooltip]="themeTooltip() | transloco"
      tooltipPosition="bottom"
      (onClick)="toggleTheme()"
      class="theme-switcher-button"
      [attr.aria-label]="'THEME.TOGGLE' | transloco"
      pRipple
    />
  `,
  styles: [
    `
      .theme-switcher-button {
        width: 2.5rem;
        height: 2.5rem;
        transition: all 0.2s ease;

        ::ng-deep .p-button-icon {
          font-size: 1.125rem;
        }

        &:hover {
          transform: scale(1.05);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  private readonly themeService = inject(ThemeService);

  readonly currentTheme = signal<Theme>('system');
  readonly isDark = signal(false);

  readonly themeIcon = computed(() => {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light':
        return 'pi pi-sun';
      case 'dark':
        return 'pi pi-moon';
      case 'system':
        return 'pi pi-desktop';
      default:
        return 'pi pi-desktop';
    }
  });

  readonly themeTooltip = computed(() => {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light':
        return 'THEME.SWITCH_TO_DARK';
      case 'dark':
        return 'THEME.SWITCH_TO_SYSTEM';
      case 'system':
        return 'THEME.SWITCH_TO_LIGHT';
      default:
        return 'THEME.TOGGLE';
    }
  });

  constructor() {
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme.set(theme);
    });

    this.themeService.isDark$.subscribe((isDark) => {
      this.isDark.set(isDark);
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
