const STORAGE_KEY = 'yaninav-favorites-v1';

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  } catch {
    return [];
  }
}

export function getFavoriteIds(): number[] {
  if (typeof window === 'undefined') return [];
  return parseIds(localStorage.getItem(STORAGE_KEY));
}

export function setFavoriteIds(ids: number[]): void {
  if (typeof window === 'undefined') return;
  const unique = Array.from(new Set(ids));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  window.dispatchEvent(new Event('favorites-changed'));
}

export function isFavoriteId(id: number): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavoriteId(id: number): boolean {
  const current = getFavoriteIds();
  const has = current.includes(id);
  const next = has ? current.filter((x) => x !== id) : [...current, id];
  setFavoriteIds(next);
  return !has;
}
