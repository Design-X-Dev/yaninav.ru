import type { HTMLAttributeReferrerPolicy, ReactElement } from 'react';

import { loadScriptsByLocation } from '@/lib/scripts.server';
import type { ScriptLocation } from '@/payload/collections/Scripts';

type ScriptAttrs = {
  src?: string;
  async?: boolean;
  defer?: boolean;
  type?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  integrity?: string;
  id?: string;
  nonce?: string;
};

type ParsedScriptTag = {
  attrs: ScriptAttrs;
  /** Inline body; empty when external src-only tag. */
  inner: string;
};

const SCRIPT_TAG_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function parseAttrValue(raw: string | undefined): string {
  if (raw == null) return '';
  return raw.replace(/^['"]|['"]$/g, '').trim();
}

/** Parse HTML attribute string from a `<script …>` opening tag. */
function parseScriptOpeningAttrs(attrString: string): ScriptAttrs {
  const attrs: ScriptAttrs = {};
  const re = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrString)) !== null) {
    const name = m[1].toLowerCase();
    const value = parseAttrValue(m[2] ?? m[3] ?? m[4]);
    switch (name) {
      case 'src':
        if (value) attrs.src = value;
        break;
      case 'type':
        if (value) attrs.type = value;
        break;
      case 'async':
        attrs.async = true;
        break;
      case 'defer':
        attrs.defer = true;
        break;
      case 'crossorigin':
        if (value === 'use-credentials') attrs.crossOrigin = 'use-credentials';
        else attrs.crossOrigin = 'anonymous';
        break;
      case 'referrerpolicy':
        if (value) attrs.referrerPolicy = value as HTMLAttributeReferrerPolicy;
        break;
      case 'integrity':
        if (value) attrs.integrity = value;
        break;
      case 'id':
        if (value) attrs.id = value;
        break;
      case 'nonce':
        if (value) attrs.nonce = value;
        break;
      default:
        break;
    }
  }
  return attrs;
}

/**
 * Split paste-from-vendor HTML into `<script>` tags.
 * Non-script markup (e.g. `<noscript>`) is ignored in head — put it in body_open.
 */
function extractScriptTags(code: string): ParsedScriptTag[] {
  const out: ParsedScriptTag[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(SCRIPT_TAG_RE.source, SCRIPT_TAG_RE.flags);
  while ((m = re.exec(code)) !== null) {
    out.push({
      attrs: parseScriptOpeningAttrs(m[1] ?? ''),
      inner: m[2] ?? '',
    });
  }
  return out;
}

function renderHeadScript(key: string, tag: ParsedScriptTag): ReactElement {
  const { attrs, inner } = tag;
  const trimmed = inner.trim();
  return (
    <script
      key={key}
      {...(attrs.src ? { src: attrs.src } : {})}
      {...(attrs.type ? { type: attrs.type } : {})}
      {...(attrs.async ? { async: true } : {})}
      {...(attrs.defer ? { defer: true } : {})}
      {...(attrs.crossOrigin != null ? { crossOrigin: attrs.crossOrigin } : {})}
      {...(attrs.referrerPolicy ? { referrerPolicy: attrs.referrerPolicy } : {})}
      {...(attrs.integrity ? { integrity: attrs.integrity } : {})}
      {...(attrs.id ? { id: attrs.id } : {})}
      {...(attrs.nonce ? { nonce: attrs.nonce } : {})}
      {...(!attrs.src && trimmed ? { dangerouslySetInnerHTML: { __html: trimmed } } : {})}
    />
  );
}

function renderHeadSnippet(id: string | number, code: string): ReactElement[] {
  const tags = extractScriptTags(code);
  if (tags.length === 0) {
    // Raw JS without wrapping <script> — keep previous behaviour.
    return [
      <script key={`${id}-inline`} dangerouslySetInnerHTML={{ __html: code }} />,
    ];
  }
  return tags.map((tag, i) => renderHeadScript(`${id}-${i}`, tag));
}

export default async function SiteScripts({ location }: { location: ScriptLocation }) {
  const groups = await loadScriptsByLocation();
  const items = groups[location];
  if (!items?.length) return null;

  const inHead = location === 'head_open' || location === 'head_close';

  return (
    <>
      {items.flatMap((s) =>
        inHead
          ? renderHeadSnippet(s.id, s.code)
          : [
              <div
                key={s.id}
                style={{ display: 'contents' }}
                dangerouslySetInnerHTML={{ __html: s.code }}
              />,
            ],
      )}
    </>
  );
}
