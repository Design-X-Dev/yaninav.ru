/**
 * Хелперы для @payloadcms/plugin-seo и generateMetadata:
 * поля SEO в админке помечены `localized: true` — значение может быть строкой или картой локалей.
 */

export function siteUrlNormalized(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function pickLocalizedString(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    // Only treat as serialized locale map when JSON looks like { ru: "...", en: "..." }.
    // Avoid mangling legitimate content that happens to start with `{`.
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (isLocaleStringMap(parsed)) {
          const fromLocales = pickLocalizedString(parsed);
          if (fromLocales !== undefined) return fromLocales;
        }
      } catch {
        /* not JSON — treat as plain string */
      }
    }
    return trimmed;
  }
  if (typeof value === 'object' && value !== null) {
    const preferredKeys = ['ru', 'ru-RU', 'en', 'en-US'];
    for (const key of preferredKeys) {
      const inner = (value as Record<string, unknown>)[key];
      if (typeof inner === 'string') {
        const t = inner.trim();
        if (t) return t;
      }
    }
    for (const v of Object.values(value)) {
      if (typeof v === 'string') {
        const t = v.trim();
        if (t) return t;
      }
    }
  }
  return undefined;
}

const LOCALE_MAP_KEYS = new Set(['ru', 'ru-RU', 'en', 'en-US']);

function isLocaleStringMap(value: unknown): boolean {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return false;
  let hasKnownLocale = false;
  for (const [key, inner] of entries) {
    if (typeof inner !== 'string') return false;
    if (LOCALE_MAP_KEYS.has(key)) hasKnownLocale = true;
  }
  return hasKnownLocale;
}

/** Для связи upload/meta.image из локализованной карты значений — берём первое непустое. */
export function pickLocalizedRelationValue<T>(
  value: unknown
): T | number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) return value as T;
  if (typeof value === 'object' && value !== null) {
    const preferredKeys = ['ru', 'ru-RU', 'en', 'en-US'];
    for (const key of preferredKeys) {
      const inner = (value as Record<string, unknown>)[key];
      if (inner != null) return inner as T | number;
    }
    for (const inner of Object.values(value)) {
      if (inner != null) return inner as T | number;
    }
  }
  return undefined;
}

export function truncateDescription(raw: string, max = 160): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Преобразует путь типа `/api/image/...` или абсолютный URL в абсолютный URL. */
export function absoluteOgImageUrl(pathOrUrl: string, base: string): string {
  const trimmed = base.replace(/\/$/, '');
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${trimmed}${p}`;
}
