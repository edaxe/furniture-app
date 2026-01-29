/**
 * RoomRadar Design System - Typography
 * Premium Inter font family with refined type scale
 */

// Font family names (loaded via expo-font)
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const typography = {
  // Display - for hero text
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 40,
  },

  // Headlines
  h1: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 26,
  },
  h5: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 24,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 26,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 24,
  },

  // Labels & UI elements
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 16,
  },

  // Captions
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 16,
  },

  // Overline - for section headers
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },

  // Buttons
  buttonLarge: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    letterSpacing: 0.2,
    lineHeight: 18,
  },

  // Numbers/Prices
  price: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  priceSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
};

export type TypographyTheme = typeof typography;
