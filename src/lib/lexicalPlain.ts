/**
 * Минимальное извлечение текста из Lexical-состояния (richText в Payload / Form Builder).
 */

export function pickLocalizedLexicalState(value: unknown): unknown {
  if (value == null) return undefined;
  if (typeof value === 'object' && value !== null && 'root' in value) return value;
  if (typeof value === 'object' && value !== null) {
    const keys = ['ru', 'ru-RU', 'en', 'en-US'];
    for (const k of keys) {
      const inner = (value as Record<string, unknown>)[k];
      if (inner && typeof inner === 'object' && 'root' in (inner as object)) return inner;
    }
    for (const inner of Object.values(value)) {
      if (inner && typeof inner === 'object' && 'root' in (inner as object)) return inner;
    }
  }
  return undefined;
}

function blockToPlain(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n.type === 'text' && typeof n.text === 'string') return n.text;
  if (Array.isArray(n.children)) {
    return n.children.map((c) => blockToPlain(c)).join('');
  }
  return '';
}

export function lexicalStateToPlainText(state: unknown): string {
  if (!state || typeof state !== 'object') return '';
  const root = (state as { root?: { children?: unknown[] } }).root;
  if (!root?.children || !Array.isArray(root.children)) return '';
  return root.children
    .map((child) => blockToPlain(child).trim())
    .filter((s) => s.length > 0)
    .join('\n\n')
    .trim();
}

export function localizedLexicalToPlain(value: unknown): string {
  return lexicalStateToPlainText(pickLocalizedLexicalState(value));
}
