/**
 * RoomRadar Design System
 * Premium, minimal theme inspired by Airbnb/Apple
 */

export { colors } from './colors';
export { typography, fontFamily } from './typography';
export { spacing, layout } from './spacing';
export { shadows } from './shadows';
export { borderRadius } from './borderRadius';

// Re-export types
export type { ColorTheme } from './colors';
export type { TypographyTheme } from './typography';
export type { SpacingTheme } from './spacing';
export type { ShadowTheme } from './shadows';
export type { BorderRadiusTheme } from './borderRadius';

// Combined theme object for convenience
import { colors } from './colors';
import { typography, fontFamily } from './typography';
import { spacing, layout } from './spacing';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

export const theme = {
  colors,
  typography,
  fontFamily,
  spacing,
  layout,
  shadows,
  borderRadius,
} as const;

export type Theme = typeof theme;
