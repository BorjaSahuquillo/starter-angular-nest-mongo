/**
 * Tipos TypeScript para Google OAuth 2.0 y Google Identity Services
 * Based on official Google documentation
 */

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

// Configuration to initialize Google OAuth
export interface GoogleOAuthConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  use_fedcm_for_prompt?: boolean;
}

// Google button configuration
export interface GoogleButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
  locale?: string;
}

// User information decoded from Google JWT
export interface GoogleUserInfo {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

// API global de Google
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleOAuthConfig) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: GoogleButtonConfig,
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: {
            id: string;
            password: string;
          }) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}
