/**
 * RoomRadar Design System - Border Radius
 * Softer, more refined corner radiuses
 */

export const borderRadius = {
  none: 0,
  xs: 4,    // Small elements, badges
  sm: 8,    // Buttons, input fields
  md: 12,   // Cards, containers
  lg: 16,   // Large cards, modals
  xl: 20,   // Featured elements
  '2xl': 24,
  full: 9999, // Circular elements
} as const;

export type BorderRadiusTheme = typeof borderRadius;
