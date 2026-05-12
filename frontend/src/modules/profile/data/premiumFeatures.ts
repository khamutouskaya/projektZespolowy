export const PREMIUM_FEATURES = [
  { icon: "person-circle-outline", label: "Praca z psychologiem", highlight: true },
  { icon: "analytics-outline",     label: "Głęboka analiza wzorców" },
  { icon: "flash-outline",         label: "Wykrywanie triggerów stresu" },
  { icon: "bar-chart-outline",     label: "Analiza nastroju (tydzień / miesiąc)" },
  { icon: "bulb-outline",          label: "AI-porady na podstawie zachowania" },
  { icon: "leaf-outline",          label: "AI proponuje nawyki" },
  { icon: "trophy-outline",        label: "Adaptacyjne cele" },
  { icon: "checkmark-done-outline",label: "Analiza wykonania" },
  { icon: "warning-outline",       label: "Prognoza wypalenia" },
] as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];
