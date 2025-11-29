/**
 * Responsive Design Utility Classes
 * 
 * This file contains reusable responsive class combinations
 * Copy and paste these into your components for consistent responsive design
 */

export const responsiveClasses = {
    // Container classes
    container: {
        default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
        wide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
    },

    // Padding classes
    padding: {
        page: 'p-4 sm:p-6 lg:p-8',
        card: 'p-4 sm:p-6',
        section: 'py-6 sm:py-8 lg:py-12',
    },

    // Margin classes
    margin: {
        bottom: 'mb-6 sm:mb-8',
        top: 'mt-6 sm:mt-8',
        section: 'mb-8 sm:mb-10 lg:mb-12',
    },

    // Grid layouts
    grid: {
        // 1 column mobile, 2 tablet, 3 desktop
        cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
        // 1 column mobile, 2 tablet, 4 desktop
        cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
        // Always 2 columns on desktop
        cols2: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
        // 3 columns on tablet and desktop
        cols3md: 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6',
    },

    // Typography
    typography: {
        h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
        h2: 'text-xl sm:text-2xl lg:text-3xl font-bold',
        h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
        h4: 'text-base sm:text-lg lg:text-xl font-semibold',
        body: 'text-sm sm:text-base',
        small: 'text-xs sm:text-sm',
    },

    // Spacing
    spacing: {
        stack: 'space-y-4 sm:space-y-6',
        stackTight: 'space-y-2 sm:space-y-3',
        stackLoose: 'space-y-6 sm:space-y-8 lg:space-y-10',
    },

    // Flex layouts
    flex: {
        responsive: 'flex flex-col lg:flex-row',
        center: 'flex items-center justify-center',
        between: 'flex items-center justify-between',
    },

    // Card styles
    card: {
        default: 'bg-white rounded-lg shadow p-4 sm:p-6',
        hover: 'bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6',
        bordered: 'bg-white rounded-lg border border-gray-200 p-4 sm:p-6',
    },

    // Button sizes
    button: {
        sm: 'px-3 py-1.5 sm:px-4 sm:py-2 text-sm',
        md: 'px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base',
        lg: 'px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg',
    },

    // Icon sizes
    icon: {
        sm: 'w-4 h-4 sm:w-5 sm:h-5',
        md: 'w-5 h-5 sm:w-6 sm:h-6',
        lg: 'w-6 h-6 sm:w-7 sm:h-7',
    },

    // Visibility helpers
    visibility: {
        mobileOnly: 'block lg:hidden',
        desktopOnly: 'hidden lg:block',
        tabletUp: 'hidden md:block',
        tabletOnly: 'hidden md:block lg:hidden',
    },
};

/**
 * Example Usage in Components:
 * 
 * import { responsiveClasses } from '../utils/responsiveClasses';
 * 
 * // Page container
 * <div className={responsiveClasses.container.default}>
 *   <h1 className={responsiveClasses.typography.h1}>Dashboard</h1>
 *   
 *   // Grid of cards
 *   <div className={responsiveClasses.grid.cols4}>
 *     <div className={responsiveClasses.card.default}>
 *       Card content
 *     </div>
 *   </div>
 * </div>
 */

// Helper function to combine classes
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

/**
 * Breakpoint values for reference
 */
export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

/**
 * Media query helper for JavaScript
 */
export const useBreakpoint = (breakpoint) => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints[breakpoint];
};

export default responsiveClasses;
