export const COLORS = {
  // Primary palette - deep dark with precision
  background: {
    primary: '#020617', // Deep near-black
    secondary: '#0F172A', // Slightly lighter for sections
    tertiary: '#1E293B', // For hover states
  },
  text: {
    primary: '#E2E8F0', // Main text, high contrast
    secondary: '#64748B', // Muted, secondary text
    tertiary: '#475569', // Even more muted
  },
  accent: {
    primary: '#3B82F6', // Muted blue - professional
    secondary: '#6366F1', // Subtle violet - optional
    muted: '#1E40AF', // Darker accent for depth
  },
  // Extended accent colors for status and semantic use
  accents: {
    primary: '#3B82F6', // Blue - primary actions
    cyan: '#00D9FF', // Cyan - active/highlight
    success: '#10B981', // Green - success/completed
    warning: '#F59E0B', // Amber - warnings
    error: '#EF4444', // Red - errors/critical
    secondary: '#6366F1', // Violet - secondary
    muted: '#1E40AF', // Dark blue - muted
  },
  borders: {
    light: 'rgba(226, 232, 240, 0.1)',
    lighter: 'rgba(226, 232, 240, 0.05)',
  },
} as const;

export const TYPOGRAPHY = {
  // Typography scales
  heading: {
    h1: {
      size: 'clamp(2.5rem, 5vw, 4rem)',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    h2: {
      size: 'clamp(2rem, 4vw, 3rem)',
      lineHeight: '1.15',
      letterSpacing: '-0.01em',
      fontWeight: 700,
    },
    h3: {
      size: 'clamp(1.5rem, 3vw, 2rem)',
      lineHeight: '1.2',
      letterSpacing: '0',
      fontWeight: 700,
    },
  },
  body: {
    large: {
      size: '1.125rem',
      lineHeight: '1.75',
      fontWeight: 400,
    },
    base: {
      size: '1rem',
      lineHeight: '1.6',
      fontWeight: 400,
    },
    small: {
      size: '0.875rem',
      lineHeight: '1.5',
      fontWeight: 400,
    },
    xsmall: {
      size: '0.75rem',
      lineHeight: '1.4',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
  },
} as const;

export const SPACING = {
  // Precise spacing system
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  xxl: '4rem', // 64px
  xxxl: '6rem', // 96px
  huge: '8rem', // 128px
} as const;

export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultra: '1536px',
} as const;

export const MOTION = {
  // Animation configuration - minimal, purposeful
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
  },
  easing: {
    smooth: 'easeInOut',
    entrance: 'easeOut',
    exit: 'easeIn',
    ease: 'easeInOut',
  },
  delays: {
    none: 0,
    short: 0.1,
    medium: 0.2,
    long: 0.4,
  },
} as const;

export const BLUR = {
  sm: 'blur(4px)',
  md: 'blur(8px)',
  lg: 'blur(16px)',
} as const;

export const Z_INDEX = {
  navbar: 40,
  modal: 50,
  tooltip: 60,
  loading: 70,
} as const;

// CSS-in-JS utility types
export const GLASS_EFFECT = `
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.1);
`;

export const GRAIN_TEXTURE = `
  background-image: 
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect width="100" height="100" fill="%23020617" filter="url(%23noise)" opacity="0.02"/></svg>');
`;

export const SUBTLE_GRADIENT = `
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05) 0%,
    rgba(2, 6, 23, 0) 100%
  );
`;
