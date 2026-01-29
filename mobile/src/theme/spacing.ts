/**
 * RoomRadar Design System - Spacing
 * 4px-based spacing scale for consistent layouts
 */

export const spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

// Semantic spacing aliases
export const layout = {
  screenPadding: spacing['4'],      // 16px - standard screen padding
  cardPadding: spacing['4'],        // 16px - standard card padding
  cardPaddingSmall: spacing['3'],   // 12px - compact card padding
  sectionGap: spacing['6'],         // 24px - between major sections
  itemGap: spacing['3'],            // 12px - between list items
  elementGap: spacing['2'],         // 8px - between inline elements
};

export type SpacingTheme = typeof spacing;
