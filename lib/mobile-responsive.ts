/**
 * Mobile-First Responsive Design Utilities
 * Ensures consistent responsive behavior across all pages
 */

export const responsiveClasses = {
  // Padding - mobile first
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  containerPaddingY: 'py-6 sm:py-8 lg:py-12',
  cardPadding: 'p-3 sm:p-4 lg:p-6',
  sectionPadding: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12',

  // Text sizes - mobile first
  heading1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold',
  heading2: 'text-xl sm:text-2xl lg:text-3xl font-bold',
  heading3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
  heading4: 'text-base sm:text-lg font-semibold',
  bodyLarge: 'text-sm sm:text-base lg:text-lg',
  bodyDefault: 'text-xs sm:text-sm',
  bodySmall: 'text-[10px] sm:text-xs',

  // Grids - mobile first
  grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6',
  grid4: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4',
  grid6: 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 lg:gap-3',

  // Flex layouts - mobile first
  flexBetween: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4',
  flexCenter: 'flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3',
  flexGap: 'flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4',

  // Sidebar responsive
  sidebarHidden: 'hidden lg:flex',
  sidebarResponsive: 'w-full lg:w-64 xl:w-72',

  // Auth layouts
  authLayout: 'grid grid-cols-1 lg:grid-cols-2',
  authLeftPanel: 'flex items-center justify-center bg-black p-4 sm:p-8',
  authRightPanel: 'hidden lg:flex relative bg-gray-950 overflow-hidden items-center justify-center p-8',

  // Dashboard layouts
  dashboardContainer: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen bg-black',
  dashboardCard: 'bg-gradient-to-br from-gray-900/40 to-black backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-800/60',

  // Overflow protection
  contentMax: 'max-w-full overflow-x-hidden',
  truncate: 'truncate',
  truncateLine: 'line-clamp-2',
} as const

export type ResponsiveClass = keyof typeof responsiveClasses

/**
 * Helper to combine responsive classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Breakpoint helpers
 */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Media query builders
 */
export const mq = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  smDown: `@media (max-width: 639px)`,
  mdDown: `@media (max-width: 767px)`,
  lgDown: `@media (max-width: 1023px)`,
} as const
