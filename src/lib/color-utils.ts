import { HEX_COLOR_PATTERN } from "./types";

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function autoTextColor(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return "#FFFFFF";
  return relativeLuminance(rgb.r, rgb.g, rgb.b) > 0.179 ? "#000000" : "#FFFFFF";
}

export function isValidColor(c: string): boolean {
  return HEX_COLOR_PATTERN.test(c);
}

/** VRChat world background color for non-text contrast checking */
export const VRCHAT_BG = "#A0A0A0";

/** WCAG contrast ratio between two hex colors. Returns a number >= 1, or 0 for invalid input. */
export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  textBgRatio: number;
  textBgPass: boolean;
  bgWorldRatio: number;
  bgWorldPass: boolean;
}

export function checkCellContrast(cell: { text_color: string; bg_color: string }): ContrastResult {
  const textBgRatio = contrastRatio(cell.text_color, cell.bg_color);
  const bgWorldRatio = contrastRatio(cell.bg_color, VRCHAT_BG);
  return {
    textBgRatio,
    textBgPass: textBgRatio >= 4.5,
    bgWorldRatio,
    bgWorldPass: bgWorldRatio >= 3,
  };
}

export const PRESET_COLORS = [
  "#14505C",
  "#8C1A2E",
  "#1A4FA0",
  "#4B2D8E",
  "#165A2B",
  "#701416",
  "#3040A0",
  "#8C2A1A",
  "#2E5020",
  "#0A4C72",
  "#962150",
  "#614A10",
  "#7B2D7B",
  "#0D4D6B",
  "#5C2D82",
  "#3D5A18",
  "#6B3A2A",
  "#991A2E",
];
