// Advensys Payslip Design System
// Professional, modern, and accessible design tokens

export const theme = {
  // Advensys Brand Color Palette
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f4ff',
      100: '#e0ecff',
      200: '#c7dcff',
      300: '#a4c4ff',
      400: '#7ca0ff',
      500: '#003ABD',  // Secondary brand color
      600: '#002d96',
      700: '#00226E',  // Main brand color
      800: '#001a58',
      900: '#001347',
      main: '#00226E',
      dark: '#001347',
      light: '#003ABD'
    },

    // Accent Colors
    accent: {
      yellow: {
        50: '#fff9f0',
        100: '#fef3e0',
        200: '#fde4b8',
        300: '#fcd078',
        400: '#fbbf47',
        500: '#FFC200',  // Brand yellow
        600: '#e6ac00',
        700: '#cc9900',
        800: '#b38600',
        900: '#997300',
        main: '#FFC200',
        dark: '#cc9900',
        light: '#fcd078'
      },
      orange: {
        50: '#fff4f2',
        100: '#ffe8e4',
        200: '#ffd0c7',
        300: '#ffb8aa',
        400: '#ff9c87',
        500: '#FF785E',  // Brand orange
        600: '#e65a3c',
        700: '#cc3d1f',
        800: '#b3250a',
        900: '#991100',
        main: '#FF785E',
        dark: '#cc3d1f',
        light: '#ff9c87'
      }
    },

    // Semantic Colors
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      main: '#10b981',
      dark: '#047857',
      light: '#34d399'
    },
    warning: {
      50: '#fff9f0',
      100: '#fef3e0',
      200: '#fde4b8',
      300: '#fcd078',
      400: '#fbbf47',
      500: '#FFC200',  // Using brand yellow
      600: '#e6ac00',
      700: '#cc9900',
      800: '#b38600',
      900: '#997300',
      main: '#FFC200',
      dark: '#cc9900',
      light: '#fcd078'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      main: '#ef4444',
      dark: '#b91c1c',
      light: '#f87171'
    },

    // 11-Step Grayscale System
    gray: {
      50: '#fcfcfd',   // Lightest
      100: '#f8f9fb',
      200: '#f2f4f7',
      300: '#e4e7ec',
      400: '#d0d5dd',
      500: '#98a2b3',
      600: '#667085',
      700: '#475467',
      800: '#344054',
      900: '#1d2939',
      950: '#020617'   // Darkest
    },

    // Background Colors
    background: {
      primary: '#ffffff',
      secondary: '#fcfcfd',
      tertiary: '#f8f9fb',
      muted: '#f2f4f7',
      dark: '#020617',
      paper: '#ffffff'
    },

    // Text Colors
    text: {
      primary: '#1d2939',
      secondary: '#475467',
      tertiary: '#667085',
      quaternary: '#98a2b3',
      disabled: '#d0d5dd',
      inverse: '#ffffff',
      accent: '#00226E'
    },

    // Border Colors
    border: {
      light: '#e4e7ec',
      main: '#d0d5dd',
      dark: '#98a2b3',
      focus: '#00226E',
      error: '#f87171',
      success: '#34d399'
    },

    // Brand Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #00226E 0%, #003ABD 100%)',
      secondary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      accent: 'linear-gradient(135deg, #FFC200 0%, #FF785E 100%)',
      hero: 'linear-gradient(135deg, #00226E 0%, #003ABD 50%, #FFC200 100%)',
      overlay: 'linear-gradient(135deg, rgba(0, 34, 110, 0.9) 0%, rgba(0, 58, 189, 0.8) 100%)',
      surface: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(252, 252, 253, 0.9) 100%)',
      glassmorphism: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)'
    }
  },

  // Typography System - Barlow Font Family
  typography: {
    fontFamily: {
      primary: '"Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      secondary: '"Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", monospace'
    },

    // Responsive Font Scale (12px → 72px)
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      md: '1.125rem',     // 18px
      lg: '1.25rem',      // 20px
      xl: '1.5rem',       // 24px
      '2xl': '1.875rem',  // 30px
      '3xl': '2.25rem',   // 36px
      '4xl': '3rem',      // 48px
      '5xl': '3.75rem',   // 60px
      '6xl': '4.5rem',    // 72px
      caption: '0.75rem',
      body: '1rem',
      subtitle: '1.125rem',
      h6: '1.125rem',
      h5: '1.25rem',
      h4: '1.5rem',
      h3: '1.875rem',
      h2: '2.25rem',
      h1: '3rem'
    },

    // Font Weights (300-900)
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },

    // Line Heights (1.25 tight → 2.0 loose)
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2.0
    },

    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // 8px Grid Spacing System
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',    // 2px - micro spacing
    1: '0.25rem',       // 4px - micro spacing for icons/badges
    2: '0.5rem',        // 8px - base grid unit
    3: '0.75rem',       // 12px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    7: '1.75rem',       // 28px
    8: '2rem',          // 32px
    9: '2.25rem',       // 36px
    10: '2.5rem',       // 40px
    11: '2.75rem',      // 44px
    12: '3rem',         // 48px
    14: '3.5rem',       // 56px
    16: '4rem',         // 64px
    20: '5rem',         // 80px
    24: '6rem',         // 96px
    28: '7rem',         // 112px
    32: '8rem',         // 128px
    36: '9rem',         // 144px
    40: '10rem',        // 160px
    44: '11rem',        // 176px
    48: '12rem',        // 192px
    52: '13rem',        // 208px
    56: '14rem',        // 224px
    60: '15rem',        // 240px
    64: '16rem',        // 256px
    72: '18rem',        // 288px
    80: '20rem',        // 320px
    96: '24rem'         // 384px
  },

  // Border Radius Scale
  borderRadius: {
    none: '0',
    xs: '0.125rem',     // 2px
    sm: '0.25rem',      // 4px
    base: '0.5rem',     // 8px
    md: '0.75rem',      // 12px
    lg: '1rem',         // 16px
    xl: '1.5rem',       // 24px
    '2xl': '2rem',      // 32px
    '3xl': '3rem',      // 48px
    full: '9999px'      // pill shape
  },

  // 8-Level Shadow System
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    dramatic: '0 60px 120px -24px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

    // Brand-specific shadows
    glow: '0 0 20px rgba(0, 34, 110, 0.3)',
    glowLg: '0 0 40px rgba(0, 34, 110, 0.4)',
    accentGlow: '0 0 20px rgba(255, 194, 0, 0.3)',

    // Glassmorphism shadows
    glassmorphism: '0 8px 32px rgba(0, 34, 110, 0.1)',
    glassmorphismLight: '0 4px 16px rgba(255, 194, 0, 0.2)'
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // Animation & Transitions
  animation: {
    duration: {
      instant: '0ms',
      ultraFast: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
      glacial: '1000ms'
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
      spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smoothBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      anticipate: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      backOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },

  // Responsive Breakpoints
  breakpoints: {
    xs: '360px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Container Widths
  container: {
    xs: '360px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
    '3xl': '1600px'
  },

  // Component-specific styles
  components: {
    // Button variants
    button: {
      size: {
        xs: {
          height: '24px',
          padding: '0 8px',
          fontSize: '0.75rem',
          borderRadius: '4px'
        },
        sm: {
          height: '32px',
          padding: '0 12px',
          fontSize: '0.875rem',
          borderRadius: '6px'
        },
        md: {
          height: '40px',
          padding: '0 16px',
          fontSize: '0.875rem',
          borderRadius: '8px'
        },
        lg: {
          height: '48px',
          padding: '0 24px',
          fontSize: '1rem',
          borderRadius: '10px'
        },
        xl: {
          height: '56px',
          padding: '0 32px',
          fontSize: '1.125rem',
          borderRadius: '12px'
        }
      }
    },

    // Input variants
    input: {
      size: {
        sm: {
          height: '32px',
          padding: '0 12px',
          fontSize: '0.875rem',
          borderRadius: '6px'
        },
        md: {
          height: '40px',
          padding: '0 16px',
          fontSize: '0.875rem',
          borderRadius: '8px'
        },
        lg: {
          height: '48px',
          padding: '0 20px',
          fontSize: '1rem',
          borderRadius: '10px'
        }
      }
    },

    // Card variants
    card: {
      borderRadius: '16px',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hoverShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '24px'
    },

    // Badge variants
    badge: {
      size: {
        sm: {
          height: '20px',
          padding: '0 8px',
          fontSize: '0.75rem',
          borderRadius: '10px'
        },
        md: {
          height: '24px',
          padding: '0 10px',
          fontSize: '0.75rem',
          borderRadius: '12px'
        },
        lg: {
          height: '28px',
          padding: '0 12px',
          fontSize: '0.875rem',
          borderRadius: '14px'
        }
      }
    },

    // Skeleton variants
    skeleton: {
      size: {
        sm: {
          height: '16px',
          width: '100px'
        },
        md: {
          height: '20px',
          width: '120px'
        },
        lg: {
          height: '24px',
          width: '150px'
        },
        xl: {
          height: '32px',
          width: '200px'
        }
      }
    }
  }
};

// Type exports for TypeScript
export type Theme = typeof theme;
export type ColorScale = typeof theme.colors.primary;
export type FontSize = keyof typeof theme.typography.fontSize;
export type FontWeight = keyof typeof theme.typography.fontWeight;
export type Spacing = keyof typeof theme.spacing;
export type BorderRadius = keyof typeof theme.borderRadius;
export type Shadow = keyof typeof theme.shadows;

// CSS Custom Properties for use in global styles
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: #f0f4ff;
    --color-primary-100: #e0ecff;
    --color-primary-200: #c7dcff;
    --color-primary-300: #a4c4ff;
    --color-primary-400: #7ca0ff;
    --color-primary-500: #003ABD;
    --color-primary-600: #002d96;
    --color-primary-700: #00226E;
    --color-primary-800: #001a58;
    --color-primary-900: #001347;
    --color-primary: #00226E;

    /* Accent Colors */
    --color-accent-yellow: #FFC200;
    --color-accent-orange: #FF785E;

    /* Semantic Colors */
    --color-success: #10b981;
    --color-warning: #FFC200;
    --color-error: #ef4444;

    /* Gray Scale */
    --color-gray-50: #fcfcfd;
    --color-gray-100: #f8f9fb;
    --color-gray-200: #f2f4f7;
    --color-gray-300: #e4e7ec;
    --color-gray-400: #d0d5dd;
    --color-gray-500: #98a2b3;
    --color-gray-600: #667085;
    --color-gray-700: #475467;
    --color-gray-800: #344054;
    --color-gray-900: #1d2939;
    --color-gray-950: #020617;

    /* Text Colors */
    --color-text-primary: #1d2939;
    --color-text-secondary: #475467;
    --color-text-tertiary: #667085;
    --color-text-disabled: #d0d5dd;
    --color-text-inverse: #ffffff;

    /* Background Colors */
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #fcfcfd;
    --color-bg-tertiary: #f8f9fb;
    --color-bg-muted: #f2f4f7;

    /* Border Colors */
    --color-border-light: #e4e7ec;
    --color-border-main: #d0d5dd;
    --color-border-dark: #98a2b3;

    /* Font Family */
    --font-family-primary: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;

    /* Spacing Scale */
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    --spacing-20: 5rem;
    --spacing-24: 6rem;

    /* Border Radius */
    --radius-xs: 0.125rem;
    --radius-sm: 0.25rem;
    --radius-base: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
    --radius-2xl: 2rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg-primary: #020617;
      --color-bg-secondary: #1d2939;
      --color-bg-tertiary: #344054;
      --color-text-primary: #ffffff;
      --color-text-secondary: #d0d5dd;
      --color-text-tertiary: #98a2b3;
    }
  }
`;

export default theme;