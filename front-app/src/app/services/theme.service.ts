import { DOCUMENT, Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkModeSelector = '.my-app-dark';
  private readonly storageKey = 'preferred-theme';

  private readonly _currentTheme = new BehaviorSubject<Theme>('system');
  readonly currentTheme$ = this._currentTheme.asObservable();

  private readonly _isDark = new BehaviorSubject<boolean>(false);
  readonly isDark$ = this._isDark.asObservable();

  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Setup media query for system theme detection
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', (e) =>
        this.onSystemThemeChange(e),
      );
    }

    // Get saved theme preference or default to system
    const savedTheme = this.getSavedTheme();
    this.setTheme(savedTheme);
  }

  private getSavedTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'system';

    const saved = localStorage.getItem(this.storageKey) as Theme;
    return saved && ['light', 'dark', 'system'].includes(saved)
      ? saved
      : 'system';
  }

  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private onSystemThemeChange(e: MediaQueryListEvent): void {
    if (this._currentTheme.value === 'system') {
      this.applyTheme(e.matches);
    }
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = this.document.documentElement;

    if (isDark) {
      htmlElement.classList.add(this.darkModeSelector.replace('.', ''));
    } else {
      htmlElement.classList.remove(this.darkModeSelector.replace('.', ''));
    }

    this._isDark.next(isDark);
  }

  setTheme(theme: Theme): void {
    this._currentTheme.next(theme);
    this.saveTheme(theme);

    let shouldBeDark = false;

    switch (theme) {
      case 'dark':
        shouldBeDark = true;
        break;
      case 'light':
        shouldBeDark = false;
        break;
      case 'system':
        shouldBeDark = this.mediaQuery?.matches ?? false;
        break;
    }

    this.applyTheme(shouldBeDark);
  }

  toggleTheme(): void {
    const currentTheme = this._currentTheme.value;

    switch (currentTheme) {
      case 'light':
        this.setTheme('dark');
        break;
      case 'dark':
        this.setTheme('system');
        break;
      case 'system':
        this.setTheme('light');
        break;
    }
  }

  getCurrentTheme(): Theme {
    return this._currentTheme.value;
  }

  getIsDark(): boolean {
    return this._isDark.value;
  }
}
