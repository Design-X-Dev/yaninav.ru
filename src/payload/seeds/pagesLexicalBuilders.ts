/** Serialized Lexical root для полей richText в Payload. */
export type LexicalRootDoc = {
  root: {
    type: 'root';
    format: string;
    indent: number;
    version: number;
    direction: 'ltr';
    children: unknown[];
  };
};

export function textNode(text: string, format = 0) {
  return {
    type: 'text' as const,
    detail: 0,
    format,
    mode: 'normal' as const,
    style: '',
    text,
    version: 1,
  };
}

export function paragraph(children: unknown[]) {
  return {
    type: 'paragraph' as const,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    version: 1,
    textFormat: 0,
    children,
  };
}

export function heading(tag: 'h2' | 'h3', children: unknown[]) {
  return {
    type: 'heading' as const,
    tag,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    version: 1,
    children,
  };
}

export function linkNode(url: string, label: string, newTab = false) {
  return {
    type: 'link' as const,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    version: 2,
    fields: {
      linkType: 'custom' as const,
      newTab,
      url,
    },
    children: [textNode(label)],
  };
}

export function bulletList(items: string[]) {
  return {
    type: 'list' as const,
    listType: 'bullet' as const,
    tag: 'ul',
    start: 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: items.map((text) => ({
      type: 'listitem' as const,
      format: '',
      indent: 0,
      version: 1,
      value: 1,
      direction: 'ltr' as const,
      children: [paragraph([textNode(text)])],
    })),
  };
}

export function orderedList(items: string[]) {
  return {
    type: 'list' as const,
    listType: 'number' as const,
    tag: 'ol',
    start: 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: items.map((text, idx) => ({
      type: 'listitem' as const,
      format: '',
      indent: 0,
      version: 1,
      value: idx + 1,
      direction: 'ltr' as const,
      children: [paragraph([textNode(text)])],
    })),
  };
}

export function lexicalDoc(children: unknown[]): LexicalRootDoc {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  };
}
