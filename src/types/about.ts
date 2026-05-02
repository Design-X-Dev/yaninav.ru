import type { SerializedEditorState } from 'lexical';

export type AboutIconKey =
  | 'heart'
  | 'sparkles'
  | 'check'
  | 'sparkle4'
  | 'clock'
  | 'shield'
  | 'gem'
  | 'diamond'
  | 'crown'
  | 'leaf'
  | 'flower'
  | 'feather'
  | 'palette'
  | 'pen'
  | 'handHeart'
  | 'handshake'
  | 'badgeCheck'
  | 'lock'
  | 'scale'
  | 'compass'
  | 'eye'
  | 'star'
  | 'sun'
  | 'moon'
  | 'wand'
  | 'gift';

const ABOUT_ICON_KEYS: readonly AboutIconKey[] = [
  'heart',
  'sparkles',
  'check',
  'sparkle4',
  'clock',
  'shield',
  'gem',
  'diamond',
  'crown',
  'leaf',
  'flower',
  'feather',
  'palette',
  'pen',
  'handHeart',
  'handshake',
  'badgeCheck',
  'lock',
  'scale',
  'compass',
  'eye',
  'star',
  'sun',
  'moon',
  'wand',
  'gift',
];

export function isAboutIconKey(v: unknown): v is AboutIconKey {
  return typeof v === 'string' && (ABOUT_ICON_KEYS as readonly string[]).includes(v);
}

export interface AboutFeature {
  icon: AboutIconKey;
  title: string;
  description: string;
}

export interface AboutContent {
  heading: string;
  lead: SerializedEditorState | null;
  features: AboutFeature[];
}
