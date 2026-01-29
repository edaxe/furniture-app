/**
 * RoomRadar Design System - Colors
 * Premium, sophisticated palette inspired by Airbnb/Apple
 */

export const colors = {
  // Primary text colors
  text: {
    primary: '#1C1B18',    // Headings, primary text, primary buttons
    secondary: '#6B6862',  // Body text, descriptions
    tertiary: '#8A8680',   // Captions, hints
  },

  // Accent colors
  accent: {
    50: '#FDF5F3',
    100: '#F9E8E3',
    200: '#F3D1C7',
    300: '#E9B3A1',
    400: '#D9927A',
    500: '#C4785A',  // Terracotta - primary accent (links, highlights)
    600: '#B06647',
    700: '#93533B',
    800: '#7A4534',
    900: '#663B2E',
  },

  // Success colors (sage green)
  success: {
    50: '#F2F7F4',
    100: '#E4EFE8',
    200: '#C9DFD1',
    300: '#A3C8B3',
    400: '#7AAF93',
    500: '#5A8A6A',  // Sage green - exact matches, success states
    600: '#476F55',
    700: '#3A5945',
    800: '#304839',
    900: '#283C30',
  },

  // Error colors (muted coral)
  error: {
    50: '#FDF5F4',
    100: '#FCE8E6',
    200: '#F9D0CC',
    300: '#F3ABA4',
    400: '#E88178',
    500: '#D4574A',  // Muted coral - delete, errors
    600: '#BC4439',
    700: '#9D382F',
    800: '#82312A',
    900: '#6D2E27',
  },

  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F4',   // Icon backgrounds, subtle fills
    200: '#E8E7E5',   // Borders, skeleton placeholders
    300: '#D4D3D0',
    400: '#A3A19D',
    500: '#737169',   // Icon colors
    600: '#5C5A54',
    700: '#474640',
    800: '#33322D',
    900: '#1C1B18',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',   // Cards, modals
    secondary: '#F5F5F4', // Screen backgrounds
  },

  // Border colors
  border: {
    light: '#E8E7E5',     // Subtle dividers
    medium: '#D4D3D0',
  },

  // Legacy/utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorTheme = typeof colors;
