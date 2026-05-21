import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload';

type DocWithSlug = { slug?: string | null };
type DocWithId = { id?: number | string | null };

function runRevalidation(tags: string[], paths: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function makeRevalidateAfterChange(
  tags: string[],
  paths: string[] | ((doc: DocWithSlug & DocWithId) => string[]) = []
): CollectionAfterChangeHook {
  return ({ doc }) => {
    const pathList = typeof paths === 'function' ? paths(doc as DocWithSlug & DocWithId) : paths;
    runRevalidation(tags, pathList);
    return doc;
  };
}

export function makeRevalidateAfterDelete(
  tags: string[],
  paths: string[] | ((doc: DocWithSlug & DocWithId) => string[]) = []
): CollectionAfterDeleteHook {
  return ({ doc }) => {
    const pathList = typeof paths === 'function' ? paths(doc as DocWithSlug & DocWithId) : paths;
    runRevalidation(tags, pathList);
    return doc;
  };
}

export function makeGlobalRevalidateAfterChange(
  tags: string[],
  paths: string[] = []
): GlobalAfterChangeHook {
  return ({ doc }) => {
    runRevalidation(tags, paths);
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
