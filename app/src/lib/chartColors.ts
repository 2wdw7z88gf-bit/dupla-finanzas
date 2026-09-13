/** Literal color values for chart marks — SVG/canvas renderers shouldn't depend on CSS custom properties. */
export const CHART = {
  coral: 'oklch(64% 0.15 35)',
  coralMuted: 'oklch(95% 0.015 75)',
  teal: 'oklch(58% 0.10 196)',
  success: 'oklch(60% 0.12 150)',
  gold: 'oklch(70% 0.11 85)',
  indigo: 'oklch(56% 0.12 265)',
  berry: 'oklch(56% 0.14 340)',
  textMuted: 'oklch(53% 0.02 55)',
}

export const CATEGORY_CHART_COLOR: Record<string, string> = {
  comida: CHART.coral,
  hogar: CHART.indigo,
  transporte: CHART.teal,
  compras: CHART.gold,
  ocio: CHART.berry,
  salud: CHART.success,
}
