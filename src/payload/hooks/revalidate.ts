import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload';

type DocWithSlug = { slug?: string | null };
type DocWithId = { id?: number | string | null };

async function runRevalidation(tags: string[], paths: string[]): Promise<void> {
  try {
    const { revalidateTag, revalidatePath } = await import('next/cache');
    for (const tag of tags) {
      revalidateTag(tag);
    }
    for (const path of paths) {
      revalidatePath(path);
    }
  } catch (err) {
    if (process.env.PAYLOAD_MIGRATING !== 'true') {
      console.warn('[revalidate] next/cache недоступен, пропускаю инвалидацию', err);
    }
  }
}

export function makeRevalidateAfterChange(
  tags: string[],
  paths: string[] | ((doc: DocWithSlug & DocWithId) => string[]) = []
): CollectionAfterChangeHook {
  return async ({ doc }) => {
    const pathList = typeof paths === 'function' ? paths(doc as DocWithSlug & DocWithId) : paths;
    await runRevalidation(tags, pathList);
    return doc;
  };
}

export function makeRevalidateAfterDelete(
  tags: string[],
  paths: string[] | ((doc: DocWithSlug & DocWithId) => string[]) = []
): CollectionAfterDeleteHook {
  return async ({ doc }) => {
    const pathList = typeof paths === 'function' ? paths(doc as DocWithSlug & DocWithId) : paths;
    await runRevalidation(tags, pathList);
    return doc;
  };
}

export function makeGlobalRevalidateAfterChange(
  tags: string[],
  paths: string[] = []
): GlobalAfterChangeHook {
  return async ({ doc }) => {
    await runRevalidation(tags, paths);
    return doc;
  };
}

export const revalidateProductsAfterChange = makeRevalidateAfterChange(
  ['products', 'homepage-catalog'],
  (doc) => {
    const paths = ['/', '/collection', '/sitemap.xml'];
    const id = doc.id;
    if (typeof id === 'number' && Number.isFinite(id)) {
      paths.push(`/products/${id}`);
    }
    return paths;
  }
);

export const revalidateProductsAfterDelete = makeRevalidateAfterDelete(
  ['products', 'homepage-catalog'],
  ['/', '/collection', '/sitemap.xml']
);

export const revalidateCategoriesAfterChange = makeRevalidateAfterChange(['categories'], [
  '/collection',
  '/sitemap.xml',
]);

export const revalidateCategoriesAfterDelete = makeRevalidateAfterDelete(['categories'], [
  '/collection',
  '/sitemap.xml',
]);

export const revalidatePagesAfterChange = makeRevalidateAfterChange(['pages'], (doc) => {
  const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';
  return slug ? [`/${slug}`] : [];
});

export const revalidatePagesAfterDelete = makeRevalidateAfterDelete(['pages'], (doc) => {
  const slug = typeof doc.slug === 'string' ? doc.slug.trim() : '';
  return slug ? [`/${slug}`] : [];
});

export const revalidateHomeGlobalsAfterChange = makeGlobalRevalidateAfterChange(['globals'], ['/']);

export const revalidateHomeCatalogAfterChange = makeGlobalRevalidateAfterChange(
  ['homepage-catalog'],
  ['/']
);
