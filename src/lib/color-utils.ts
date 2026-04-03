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
  return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(c);
}

export const PRESET_COLORS = [
  "#14505C",
  "#E6B8B0",
  "#A0C4E8",
  "#CC9EEC",
  "#B6D8A8",
  "#B21414",
  "#3040A0",
  "#F6B26C",
  "#2E7C32",
  "#70A8DC",
  "#F45A9C",
  "#FFE498",
  "#546E7A",
  "#FF9800",
  "#0078D4",
  "#188600",
  "#701416",
  "#3078C6",
];
