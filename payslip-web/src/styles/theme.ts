export const theme = {
  // Advensys Brand Color Palette
  colors: {
    primary: {
      50: '#f0f4ff',
      100: '#e0ecff',
      200: '#c7dcff',
      300: '#a4c4ff',
      400: '#7ca0ff',
      500: '#003ABD',
      600: '#002d96',
      700: '#00226E',
      800: '#001a58',
      900: '#001347',
      main: '#00226E',
      dark: '#001347',
      light: '#003ABD'
    },
    secondary: {
      50: '#fff9f0',
      100: '#fef3e0',
      200: '#fde4b8',
      300: '#fcd078',
      400: '#fbbf47',
      500: '#FFC200',
      600: '#e6ac00',
      700: '#cc9900',
      800: '#b38600',
      900: '#997300',
      main: '#FFC200',
      dark: '#cc9900',
      light: '#fcd078'
    },
    accent: {
      50: '#fff4f2',
      100: '#ffe8e4',
      200: '#ffd0c7',
      300: '#ffb8aa',
      400: '#ff9c87',
      500: '#FF785E',
      600: '#e65a3c',
      700: '#cc3d1f',
      800: '#b3250a',
      900: '#991100',
      main: '#FF785E',
      dark: '#cc3d1f',
      light: '#ff9c87'
    },
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
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      main: '#f59e0b',
      dark: '#b45309',
      light: '#fbbf24'
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
    gray: {
      50: '#fcfcfd',
      100: '#f8f9fb',
      200: '#f2f4f7',
      300: '#e4e7ec',
      400: '#d0d5dd',
      500: '#98a2b3',
      600: '#667085',
      700: '#475467',
      800: '#344054',
      900: '#1d2939',
      950: '#020617'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      disabled: '#cbd5e1',
      inverse: '#ffffff'
    },
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#64748b'
    },
    // Gradient combinations
    gradients: {
      primary: 'linear-gradient(135deg, #00226E 0%, #003ABD 100%)',
      accent: 'linear-gradient(135deg, #FFC200 0%, #FF785E 100%)',
      hero: 'linear-gradient(135deg, #00226E 0%, #003ABD 50%, #FFC200 100%)',
      overlay: 'linear-gradient(135deg, rgba(0, 34, 110, 0.9) 0%, rgba(0, 58, 189, 0.8) 100%)',
      secondary: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      warm: 'linear-gradient(135deg, #FFC200 0%, #FF785E 100%)',
      cool: 'linear-gradient(135deg, #003ABD 0%, #00226E 100%)',
      sunset: 'linear-gradient(135deg, #FF785E 0%, #FFC200 100%)',
      ocean: 'linear-gradient(135deg, #003ABD 0%, #00226E 100%)',
      forest: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    }
  },
  
  // Typography Scale
  typography: {
    fontFamily: {
      primary: "'Barlow', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      secondary: "'Barlow', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace"
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem',  // 72px
      '8xl': '6rem',    // 96px
      '9xl': '8rem'     // 128px
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  
  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem'     // 256px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(0, 34, 110, 0.3)',
    glowLg: '0 0 40px rgba(0, 34, 110, 0.4)',
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
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Components specific styles
  components: {
    card: {
      borderRadius: '1rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hoverShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    button: {
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      padding: '0.75rem 1.5rem'
    },
    input: {
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem'
    }
  }
};

export type Theme = typeof theme;