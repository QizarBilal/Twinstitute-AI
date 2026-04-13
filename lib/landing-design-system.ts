/**
 * PREMIUM LANDING PAGE DESIGN SYSTEM
 * Inspired by: Apple, Stripe, OpenAI
 * Theme: Dark, minimal, high-impact
 *
 * Color Palette:
 * - Background: Pure black (#000000)
 * - Surface: Dark gray with transparency
 * - Accent: Cyan (#00D9FF) with glow effect
 * - Text: White with gray hierarchy
 */

export const LANDING_DESIGN_SYSTEM = {
  // ============================================================================
  // COLOR TOKENS
  // ============================================================================
  colors: {
    // Backgrounds
    background: {
      primary: '#000000',
      surface: '#0A0A0A',
      hover: '#151515',
      card: 'rgba(15, 15, 15, 0.5)',
    },

    // Text
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1A1',
      tertiary: '#707070',
      muted: '#4A4A4A',
    },

    // Accents
    accent: {
      cyan: '#00D9FF',
      cyandim: '#00B8D4',
      cyanglow: 'rgba(0, 217, 255, 0.2)',
    },

    // Borders
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      lighter: 'rgba(255, 255, 255, 0.05)',
      cyan: 'rgba(0, 217, 255, 0.3)',
    },

    // Status
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },

  // ============================================================================
  // TYPOGRAPHY SYSTEM
  // ============================================================================
  typography: {
    // Headings with tight tracking for premium feel
    h1: {
      size: 'clamp(2.5rem, 6vw, 4.5rem)',
      weight: 700,
      lineHeight: '1.15',
      letterSpacing: '-0.025em',
      className:
        'font-bold tracking-tighter leading-tight text-white',
    },
    h2: {
      size: 'clamp(2rem, 4.5vw, 3.5rem)',
      weight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.015em',
      className:
        'font-bold tracking-tight leading-snug text-white',
    },
    h3: {
      size: 'clamp(1.5rem, 3vw, 2.5rem)',
      weight: 600,
      lineHeight: '1.3',
      letterSpacing: '-0.005em',
      className: 'font-semibold tracking-normal leading-relaxed text-white',
    },
    h4: {
      size: '1.25rem',
      weight: 600,
      lineHeight: '1.4',
      className: 'font-semibold text-white',
    },

    // Body text with comfortable reading
    bodyLg: {
      size: '1.125rem',
      weight: 400,
      lineHeight: '1.7',
      className: 'text-lg leading-relaxed text-gray-300',
    },
    body: {
      size: '1rem',
      weight: 400,
      lineHeight: '1.65',
      className: 'text-base leading-relaxed text-gray-400',
    },
    bodySm: {
      size: '0.875rem',
      weight: 400,
      lineHeight: '1.6',
      className: 'text-sm leading-relaxed text-gray-500',
    },
    caption: {
      size: '0.75rem',
      weight: 500,
      lineHeight: '1.5',
      letterSpacing: '0.05em',
      className:
        'text-xs uppercase tracking-widest text-gray-600 font-medium',
    },
  },

  // ============================================================================
  // SPACING SYSTEM (based on 4px unit)
  // ============================================================================
  spacing: {
    /** 4px - minimal padding */
    xs: '0.25rem',

    /** 8px - small gaps */
    sm: '0.5rem',

    /** 12px - small spacing */
    smMd: '0.75rem',

    /** 16px - standard padding */
    md: '1rem',

    /** 24px - medium gaps */
    lg: '1.5rem',

    /** 32px - large sections */
    xl: '2rem',

    /** 48px - section padding */
    xxl: '3rem',

    /** 64px - major sections */
    xxxl: '4rem',

    /** 96px - hero spacing */
    huge: '6rem',
  },

  // ============================================================================
  // SECTION PADDING (vertical rhythm)
  // ============================================================================
  sections: {
    /** Normal section vertical padding */
    default: 'py-24',

    /** Large section vertical padding */
    large: 'py-32',

    /** Hero section vertical padding */
    hero: 'py-40 lg:py-56',

    /** Compact section */
    compact: 'py-16',
  },

  // ============================================================================
  // MOTION / ANIMATION
  // ============================================================================
  motion: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      verySlow: '800ms',
      cinematic: '1200ms',
    },

    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // ============================================================================
  // EFFECTS & FILTERS
  // ============================================================================
  effects: {
    // Glass morphism
    glass: 'backdrop-blur-sm bg-white/5 border border-white/10',
    glassStrong: 'backdrop-blur-md bg-white/10 border border-white/20',

    // Glow effects
    glowCyan: 'shadow-lg shadow-cyan-500/20',
    glowCyanSmall: 'shadow-md shadow-cyan-500/10',

    // Hover states
    hoverGlow: 'hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow',
    hoverBorder: 'hover:border-cyan-500/50 transition-colors',

    // Border gradients
    borderGradient: 'border border-transparent bg-clip-padding',

    // Grain overlay (subtle noise)
    grain: 'bg-[url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="4" /%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23noiseFilter)" opacity="0.03"/%3E%3C/svg%3E")] opacity-50',
  },

  // ============================================================================
  // COMPONENT SIZES
  // ============================================================================
  sizes: {
    // Max container widths
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      max: '1440px',
    },

    // Button sizes
    button: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-base',
    },

    // Border radius
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
  },

  // ============================================================================
  // BREAKPOINTS
  // ============================================================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

/**
 * Helper: Get responsive value
 * Usage: getResponsiveValue('h1', 'size')
 */
export const getResponsiveValue = (
  component: keyof typeof LANDING_DESIGN_SYSTEM.typography,
  property: keyof (typeof LANDING_DESIGN_SYSTEM.typography)[typeof component]
) => {
  const comp = LANDING_DESIGN_SYSTEM.typography[component] as any
  return comp?.[property] || null
}

/**
 * Helper: Glow effect for cyan accent
 */
export const getCyanGlow = (opacity = 0.3) => ({
  boxShadow: `0 0 40px rgba(0, 217, 255, ${opacity})`,
})

/**
 * Helper: Create cyan border with glow
 */
export const getCyanBorderGlow = () => ({
  border: '1px solid rgba(0, 217, 255, 0.4)',
  boxShadow: `inset 0 0 20px rgba(0, 217, 255, 0.1)`,
})
