/**
 * Минимальный рендер Lexical → React: только `paragraph` и `text` (в т.ч. bold через format & IS_BOLD).
 * Списки, ссылки, заголовки на верхнем уровне — пропускаются.
 */

import type { SerializedEditorState } from 'lexical';
import { IS_BOLD } from 'lexical';
import { Fragment, type CSSProperties, type ReactNode } from 'react';

type LexRecord = Record<string, unknown>;

function isRecord(v: unknown): v is LexRecord {
  return typeof v === 'object' && v !== null;
}

export interface LexicalLeadRenderOptions {
  paragraphClassName: string;
  textColor?: string;
  /** Стили для фрагментов текста с format bold. */
  getStrongStyle: (paragraphIndex: number) => CSSProperties | undefined;
  wrapPlainTextFragment: (text: string) => ReactNode;
}

function renderParagraphChildren(children: unknown[], paragraphIndex: number, opts: LexicalLeadRenderOptions): ReactNode {
  let key = 0;
  const out: ReactNode[] = [];

  const walkInline = (nodes: unknown[]) => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!isRecord(n)) continue;
      const type = typeof n.type === 'string' ? n.type : '';

      if (type === 'text') {
        const text = typeof n.text === 'string' ? n.text : '';
        const format = typeof n.format === 'number' ? n.format : 0;
        const bold = (format & IS_BOLD) !== 0;
        key += 1;
        if (!text) continue;
        if (bold) {
          const strongStyle = opts.getStrongStyle(paragraphIndex);
          out.push(
            <strong key={key} style={strongStyle}>
              {opts.wrapPlainTextFragment(text)}
            </strong>,
          );
        } else {
          out.push(<Fragment key={key}>{opts.wrapPlainTextFragment(text)}</Fragment>);
        }
        continue;
      }

      if (Array.isArray(n.children)) {
        walkInline(n.children as unknown[]);
      }
    }
  };

  walkInline(children);
  return <>{out}</>;
}

/** Массив `<p>` для `about.lead`; пустой, если некуда рендерить. */
export function lexicalRootToParagraphs(
  lead: SerializedEditorState | null | undefined,
  opts: LexicalLeadRenderOptions,
): ReactNode[] {
  if (!lead || typeof lead !== 'object' || !('root' in lead)) return [];

  const root = (lead as { root?: unknown }).root;
  if (!isRecord(root)) return [];

  const top = Array.isArray(root.children) ? root.children : [];
  const paragraphs: ReactNode[] = [];
  let paragraphIndex = -1;

  for (let i = 0; i < top.length; i++) {
    const block = top[i];
    if (!isRecord(block)) continue;
    if (typeof block.type !== 'string' || block.type !== 'paragraph') continue;

    const children = Array.isArray(block.children) ? block.children : [];
    paragraphIndex += 1;
    paragraphs.push(
      <p key={i} className={opts.paragraphClassName} style={opts.textColor ? { color: opts.textColor } : undefined}>
        {renderParagraphChildren(children, paragraphIndex, opts)}
      </p>,
    );
  }

  return paragraphs;
}
