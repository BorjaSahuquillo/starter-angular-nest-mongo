import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  GoogleCredentialResponse,
  GoogleOAuthConfig,
  GoogleUserInfo,
} from '../utils/google-auth.types';

/**
 * Helper service to handle Google OAuth integration
 * Does not handle authentication (AuthService does that), only Google API
 */
@Injectable({
  providedIn: 'root',
})
export class GoogleAuthHelperService {
  private isInitialized = new BehaviorSubject<boolean>(false);
  public readonly isInitialized$ = this.isInitialized.asObservable();

  private isLibraryLoaded = false;

  constructor() {
    this.loadGoogleLibrary();
  }

  /**
   * Checks if Google Library is loaded
   */
  private async loadGoogleLibrary(): Promise<void> {
    if (this.isLibraryLoaded || typeof window === 'undefined') {
      console.log('🔄 Google library already loaded or no window');
      return;
    }

    console.log('📦 Waiting for Google library to load...');

    // Esperar a que el script se cargue
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds maximum

      const checkGoogle = () => {
        attempts++;

        if (window.google?.accounts?.id) {
          console.log(`✅ Google library loaded after ${attempts * 100}ms`);
          this.isLibraryLoaded = true;
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('❌ Timeout loading Google library');
          reject(new Error('Timeout loading Google library'));
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    });
  }

  /**
   * Inicializa Google OAuth con callback
   */
  async initializeGoogleAuth(
    callback: (response: GoogleCredentialResponse) => void,
  ): Promise<void> {
    await this.loadGoogleLibrary();

    if (!window.google?.accounts?.id) {
      throw new Error('Google OAuth library not loaded');
    }

    // 🔍 Debug: Verify configuration
    console.log('🔧 Google OAuth Config:', {
      clientId: environment.auth.googleClientId,
      production: environment.production,
      origin: window.location.origin,
      fedcmEnabled: environment.production,
    });

    const config: GoogleOAuthConfig = {
      client_id: environment.auth.googleClientId,
      callback,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      // ✅ Enable FedCM automatically in production
      use_fedcm_for_prompt: environment.production,
    };

    try {
      // 🧪 Test directo de conectividad con Google
      console.log('🧪 Testing Google connectivity...');

      // Test 1: Verificar que podemos acceder a la API
      if (!window.google.accounts) {
        throw new Error('Google accounts API not available');
      }

      // Test 2: Intentar inicializar
      window.google.accounts.id.initialize(config);
      console.log('✅ Google OAuth inicializado correctamente');

      // Test 3: Verificar que el callback funciona
      setTimeout(() => {
        console.log('🔍 Google OAuth status check:', {
          initialized: !!window.google?.accounts?.id,
          clientId: config.client_id.substring(0, 10) + '...',
          origin: window.location.origin,
        });
      }, 1000);

      this.isInitialized.next(true);
    } catch (error) {
      console.error('❌ Error inicializando Google OAuth:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        google: !!window.google,
        accounts: !!window.google?.accounts,
        id: !!window.google?.accounts?.id,
      });
      throw error;
    }
  }

  /**
   * Renders Google button on a specific element
   */
  renderGoogleButton(element: HTMLElement): void {
    if (!window.google?.accounts?.id) {
      console.error('Google OAuth not initialized');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
    });
  }

  /**
   * Trigger manual de prompt de Google (One Tap)
   */
  promptGoogleSignIn(): void {
    if (!window.google?.accounts?.id) {
      console.error('Google OAuth not initialized');
      return;
    }

    // In production, use prompt() with FedCM enabled
    if (environment.production) {
      console.log('🚀 Production: Using native FedCM');
      window.google.accounts.id.prompt();
      return;
    }

    // In development, use renderButton to avoid FedCM issues
    console.log('🔧 Development: Using rendered button (FedCM disabled)');
    const buttonContainer = document.getElementById('google-signin-button');
    if (buttonContainer) {
      // Clear previous content
      buttonContainer.innerHTML = '';

      // Render native Google button
      window.google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '100%',
      });
    } else {
      // Final fallback to prompt method
      window.google.accounts.id.prompt();
    }
  }

  /**
   * Decodes Google JWT token to get user information
   */
  decodeGoogleToken(credential: string): GoogleUserInfo {
    try {
      // The token has 3 parts separated by dots: header.payload.signature
      const payload = credential.split('.')[1];

      // Decode base64url
      const decoded = this.base64urlDecode(payload);

      return JSON.parse(decoded) as GoogleUserInfo;
    } catch (error) {
      console.error('Error decoding Google token:', error);
      throw new Error('Invalid Google credential token');
    }
  }

  /**
   * Cancels Google authentication flow
   */
  cancel(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }

  /**
   * Revokes access for a specific email
   */
  revoke(email: string): Promise<void> {
    return new Promise((resolve) => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.revoke(email, () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Decodes base64url (used in JWT)
   */
  private base64urlDecode(str: string): string {
    // Convert base64url to base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if necessary
    while (str.length % 4) {
      str += '=';
    }

    // Decode base64
    return atob(str);
  }
}
