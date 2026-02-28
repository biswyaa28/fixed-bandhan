/**
 * Bandhan AI — Comic Book / Retro 8-Bit Design System
 * Pixel-perfect: strict 8px grid, production-ready tokens.
 */

// ── Color Palette (Monochromatic Comic — 7 canonical values) ─────────────
export const colors = {
  white: "#FFFFFF",
  offWhite: "#F8F8F8",
  lightGray: "#E0E0E0",
  mediumGray: "#9E9E9E",
  darkGray: "#424242",
  charcoal: "#212121",
  black: "#000000",

  text: {
    heading: "#000000",
    primary: "#212121",
    secondary: "#424242",
    tertiary: "#9E9E9E",
    disabled: "#9E9E9E",
  },

  border: {
    primary: "#000000", // 3px thick
    secondary: "#424242", // 2px
    divider: "#E0E0E0", // 1px
  },

  background: {
    surface: "#FFFFFF",
    card: "#F8F8F8",
    input: "#FFFFFF",
    hover: "#E0E0E0",
    active: "#9E9E9E",
    disabled: "#F8F8F8",
  },

  // Verification badge tiers
  badge: {
    bronze: { bg: "#E0E0E0", text: "#000000", letter: "B" },
    silver: { bg: "#9E9E9E", text: "#000000", letter: "S" },
    gold: { bg: "#424242", text: "#FFFFFF", letter: "G" },
  },

  // Legacy compatibility shims
  ink: {
    50: "#F8F8F8",
    100: "#F0F0F0",
    200: "#E0E0E0",
    300: "#C0C0C0",
    400: "#9E9E9E",
    500: "#757575",
    600: "#616161",
    700: "#424242",
    800: "#212121",
    900: "#000000",
    950: "#000000",
  },
} as const;

// ── Shadows (Hard 8-bit: NO blur, NO spread, equal x/y) ─────────────────
export const shadows = {
  none: "none",
  sm: "2px 2px 0px #000000",
  md: "4px 4px 0px #000000",
  lg: "6px 6px 0px #000000",
  xl: "8px 8px 0px #000000",
  hover: "2px 2px 0px #000000",
  pressed: "inset 2px 2px 0px rgba(0,0,0,0.2)",
} as const;

// ── Typography (Comic Book — strict hierarchy) ───────────────────────────
export const typography = {
  fontFamily: {
    heading: '"Comic Neue", "Bungee", "Inter", system-ui, cursive',
    body: '"Roboto", "Open Sans", "Inter", system-ui, sans-serif',
    mono: '"Roboto Mono", monospace',
    pixel: '"Press Start 2P", "Courier New", monospace',
    hindi: '"Noto Sans Devanagari", system-ui, sans-serif',
  },
  // Strict heading scale
  heading: {
    h1: {
      size: "36px",
      weight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      size: "28px",
      weight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: { size: "22px", weight: 700, lineHeight: 1.4, letterSpacing: "0" },
    h4: { size: "18px", weight: 600, lineHeight: 1.5, letterSpacing: "0.01em" },
    h5: { size: "16px", weight: 600, lineHeight: 1.5, letterSpacing: "0.02em" },
    h6: { size: "14px", weight: 600, lineHeight: 1.5, letterSpacing: "0.03em" },
  },
  // Body text scale
  body: {
    lg: { size: "18px", weight: 400, lineHeight: 1.6 },
    md: { size: "16px", weight: 400, lineHeight: 1.6 },
    sm: { size: "14px", weight: 400, lineHeight: 1.5 },
    tiny: { size: "12px", weight: 400, lineHeight: 1.4 },
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  maxLineLength: "65ch",
} as const;

// ── Border Radius (Cards: 0px sharp, Buttons/Inputs: 4px) ───────────────
export const radius = {
  none: "0px",
  btn: "4px",
  input: "4px",
  card: "0px",
} as const;

// ── Spacing (strict 8px baseline grid) ───────────────────────────────────
export const spacing = {
  1: "8px",
  2: "16px",
  3: "24px",
  4: "32px",
  5: "40px",
  6: "48px",
  8: "64px",
  10: "80px",
  12: "96px",
} as const;

// ── Focus Ring ───────────────────────────────────────────────────────────
export const focusRing = {
  boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 6px #000000",
} as const;

// ── Animation Tokens ─────────────────────────────────────────────────────
export const animation = {
  cardTransition:
    "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  hover: { transform: "translate(2px, 2px)", shadow: shadows.hover },
  press: { transform: "translate(2px, 2px)", shadow: shadows.pressed },
} as const;

// ── Component Tokens ─────────────────────────────────────────────────────
export const components = {
  card: {
    background: colors.background.card,
    border: "2px solid #000000",
    borderRadius: radius.card,
    padding: spacing[3], // 24px
    shadow: shadows.md,
    hoverShadow: shadows.hover,
    headerBorder: "2px solid #000000",
    footerBorder: "1px dashed #000000",
  },
  input: {
    background: colors.background.input,
    border: "2px solid #000000",
    borderRadius: radius.input,
    padding: "12px 16px",
    focusRing: focusRing.boxShadow,
    placeholder: colors.text.tertiary,
  },
  button: {
    primary: {
      bg: colors.white,
      text: colors.black,
      border: "3px solid #000000",
      padding: "12px 24px", // 8px grid aligned
      shadow: shadows.md,
      hoverBg: colors.black,
      hoverText: colors.white,
      hoverShadow: shadows.hover,
    },
    secondary: {
      bg: "transparent",
      text: colors.black,
      border: "3px solid #000000",
      padding: "12px 24px",
      shadow: shadows.md,
    },
    icon: {
      size: "48px", // min touch target
      border: "3px solid #000000",
      borderRadius: radius.btn,
      iconSize: "24px",
    },
  },
  navbar: {
    background: colors.charcoal,
    borderBottom: "3px solid #FFFFFF",
    height: "56px", // 7 × 8px
    padding: "0 24px",
  },
  modal: {
    backdrop: "rgba(0,0,0,0.8)",
    background: colors.white,
    border: "4px solid #000000",
    borderRadius: radius.card,
    padding: spacing[4], // 32px
    shadow: shadows.xl,
    maxWidth: "500px",
    headerBorder: "2px solid #000000",
    footerBorder: "2px solid #000000",
  },
  chatBubble: {
    sent: {
      bg: colors.white,
      text: colors.black,
      border: "2px solid #000000",
      borderRadius: "8px 8px 0px 8px",
    },
    received: {
      bg: "#F0F0F0",
      text: colors.black,
      border: "2px solid #000000",
      borderRadius: "8px 8px 8px 0px",
    },
    padding: "16px",
    maxWidth: "70%",
  },
} as const;

// ── Breakpoints ──────────────────────────────────────────────────────────
export const breakpoints = {
  mobile: "320px",
  tablet: "641px",
  desktop: "1025px",
} as const;

// ── Icon Sizes (8px grid) ────────────────────────────────────────────────
export const iconSize = {
  sm: "16px",
  md: "24px",
  lg: "32px",
} as const;

export type Colors = typeof colors;
export type Shadows = typeof shadows;
export type Typography = typeof typography;

const theme = {
  colors,
  shadows,
  typography,
  radius,
  spacing,
  focusRing,
  animation,
  components,
  breakpoints,
  iconSize,
};
export default theme;
