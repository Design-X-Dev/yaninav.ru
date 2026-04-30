/** Центральная цветовая палитра проекта ЯНИНА В */
export const THEME = {
  bg: '#f4f7f0',
  bgDark: '#59151f',
  heading: '#59151f',
  subheading: '#59151f',
  text: '#616161',
  textLight: '#f4f7f0',
  textBlue: '#9fb1c2',
} as const;

export type ThemeColor = (typeof THEME)[keyof typeof THEME];

/** Цвета секций по умолчанию */
export const SECTIONS = {
  hero:     { bg: THEME.bg,     heading: THEME.heading,    subheading: THEME.subheading, text: THEME.text },
  memories: { bg: THEME.bg,     heading: THEME.heading,    subheading: THEME.subheading, text: THEME.text },
  catalog:  { bg: THEME.bg,     heading: THEME.heading,    subheading: THEME.subheading, text: THEME.text },
  about:    { bg: THEME.bgDark, heading: THEME.textLight,  subheading: THEME.textLight,  text: THEME.textBlue },
  contact:  { bg: THEME.bg,     heading: THEME.heading,    subheading: THEME.subheading, text: THEME.text },
  footer:   { bg: THEME.bg,     heading: THEME.heading,    subheading: THEME.subheading, text: THEME.text },
} as const;
