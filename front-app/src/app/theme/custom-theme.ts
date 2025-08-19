// src/app/orange-aura.preset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const CustomTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#EF8354', // base naranja
      600: '#ea580c', // hover
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    secondary: {
      50: '#f0f9fa',
      100: '#dae9ec',
      200: '#b8d8dd',
      300: '#8fc0c7',
      400: '#5f9ca3',
      500: '#3C6E71', // base verde azulado
      600: '#315a5c',
      700: '#2a4a4c',
      800: '#223b3d',
      900: '#1a2d2e',
      950: '#101a1b',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#F5F5F5', // gris claro casi blanco
          50: '#EDEDED',
          100: '#E0E0E0',
          200: '#D6D6D6',
          300: '#C2C2C2',
          400: '#A6A6A6',
          500: '#8C8C8C',
          600: '#737373',
          700: '#5C5C5C',
          800: '#404040',
          900: '#262626',
          950: '#1A1A1A',
        },
      },
      dark: {
        surface: {
          0: '#262626', // fondo principal
          50: '#404040', // superficie secundaria
          100: '#5C5C5C', // componentes
          200: '#737373', // bordes
          300: '#8C8C8C', // bordes activos
          400: '#A6A6A6', // texto muted
          500: '#C2C2C2', // texto secundario
          600: '#D6D6D6', // texto normal
          700: '#E0E0E0', // texto hover
          800: '#EDEDED', // cards/componentes principales
          900: '#F0F0F0', // superficies destacadas
          950: '#F5F5F5', // maximum contrast
        },
        primary: {
          color: '#D6D6D6', // texto principal claro
          contrastColor: '#262626', // contraste
        },
        content: {
          background: '#404040', // fondo de contenido
          hoverBackground: '#5C5C5C', // hover
          borderColor: '#737373', // bordes
          color: '#D6D6D6', // texto de contenido
          hoverColor: '#E0E0E0', // texto hover
        },
        text: {
          color: '#D6D6D6',
          hoverColor: '#E0E0E0',
          mutedColor: '#A6A6A6',
        },
        formField: {
          background: '#262626',
          filledBackground: '#262626',
          filledHoverBackground: '#262626',
          filledFocusBackground: '#262626',
          disabledBackground: '#737373',
          borderColor: '#8C8C8C',
          hoverBorderColor: '#A6A6A6',
          focusBorderColor: '#D6D6D6',
          color: '#FFFFFF',
          placeholderColor: '#A6A6A6',
          disabledColor: '#A6A6A6',
          invalidBorderColor: '#ff4d4f',
          invalidPlaceholderColor: '#ff7875',
        },
        components: {
          inputtext: {
            root: {
              background: '#262626',
              filledBackground: '#262626',
              filledHoverBackground: '#262626',
              filledFocusBackground: '#262626',
              disabledBackground: '#737373',
              borderColor: '#8C8C8C',
              hoverBorderColor: '#A6A6A6',
              focusBorderColor: '#D6D6D6',
              color: '#FFFFFF',
              placeholderColor: '#A6A6A6',
              disabledColor: '#A6A6A6',
              invalidBorderColor: '#ff4d4f',
              invalidPlaceholderColor: '#ff7875',
            },
          },
          textarea: {
            root: {
              background: '#262626',
              filledBackground: '#262626',
              filledHoverBackground: '#262626',
              filledFocusBackground: '#262626',
              disabledBackground: '#737373',
              borderColor: '#8C8C8C',
              hoverBorderColor: '#A6A6A6',
              focusBorderColor: '#D6D6D6',
              color: '#FFFFFF',
              placeholderColor: '#A6A6A6',
              disabledColor: '#A6A6A6',
              invalidBorderColor: '#ff4d4f',
              invalidPlaceholderColor: '#ff7875',
            },
          },

          autocomplete: {
            root: {
              background: '#262626',
              filledBackground: '#262626',
              filledHoverBackground: '#262626',
              filledFocusBackground: '#262626',
              disabledBackground: '#737373',
              borderColor: '#8C8C8C',
              hoverBorderColor: '#A6A6A6',
              focusBorderColor: '#D6D6D6',
              color: '#FFFFFF',
              placeholderColor: '#A6A6A6',
              disabledColor: '#A6A6A6',
              invalidBorderColor: '#ff4d4f',
              invalidPlaceholderColor: '#ff7875',
            },
            dropdown: {
              background: '#262626',
              borderColor: '#8C8C8C',
              color: '#FFFFFF',
            },
          },
          dropdown: {
            root: {
              background: '#262626',
              borderColor: '#8C8C8C',
              color: '#FFFFFF',
              hoverBackground: '#5C5C5C',
              hoverColor: '#E0E0E0',
              hoverBorderColor: '#A6A6A6',
              focusBackground: '#5C5C5C',
              focusColor: '#E0E0E0',
              focusBorderColor: '#A6A6A6',
              disabledBackground: '#737373',
            },
          },
          multiselect: {
            root: {
              background: '#262626',
              filledBackground: '#262626',
              filledHoverBackground: '#262626',
              filledFocusBackground: '#262626',
              disabledBackground: '#737373',
              borderColor: '#8C8C8C',
              hoverBorderColor: '#A6A6A6',
              focusBorderColor: '#D6D6D6',
              color: '#FFFFFF',
              placeholderColor: '#A6A6A6',
              disabledColor: '#A6A6A6',
              invalidBorderColor: '#ff4d4f',
              invalidPlaceholderColor: '#ff7875',
            },
          },
          calendar: {
            root: {
              background: '#262626',
              filledBackground: '#262626',
              filledHoverBackground: '#262626',
              filledFocusBackground: '#262626',
              disabledBackground: '#737373',
              borderColor: '#8C8C8C',
              hoverBorderColor: '#A6A6A6',
              focusBorderColor: '#D6D6D6',
              color: '#FFFFFF',
              placeholderColor: '#A6A6A6',
              disabledColor: '#A6A6A6',
              invalidBorderColor: '#ff4d4f',
              invalidPlaceholderColor: '#ff7875',
            },
          },
          chips: {
            root: {
              background: '#262626',
              filledBackground: '#262626',
              filledHoverBackground: '#262626',
              filledFocusBackground: '#262626',
              disabledBackground: '#737373',
              borderColor: '#8C8C8C',
              hoverBorderColor: '#A6A6A6',
              focusBorderColor: '#D6D6D6',
              color: '#FFFFFF',
              placeholderColor: '#A6A6A6',
              disabledColor: '#A6A6A6',
              invalidBorderColor: '#ff4d4f',
              invalidPlaceholderColor: '#ff7875',
            },
          },
          checkbox: {
            root: {
              background: '#262626',
              disabledBackground: '#737373',
            },
          },
        },
      },
    },
  },
});
