import { loadScriptsByLocation } from '@/lib/scripts.server';
import type { ScriptLocation } from '@/payload/collections/Scripts';

export default async function SiteScripts({ location }: { location: ScriptLocation }) {
  const groups = await loadScriptsByLocation();
  const items = groups[location];
  if (!items?.length) return null;

  const inHead = location === 'head_open' || location === 'head_close';

  return (
    <>
      {items.map((s) =>
        inHead ? (
          <script key={s.id} dangerouslySetInnerHTML={{ __html: s.code }} />
        ) : (
          <div
            key={s.id}
            style={{ display: 'contents' }}
            dangerouslySetInnerHTML={{ __html: s.code }}
          />
        )
      )}
    </>
  );
}
