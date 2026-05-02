import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { SerializedEditorState } from 'lexical';
import { RichText } from '@payloadcms/richtext-lexical/react';

import InfoPageLayout from '@/components/InfoPageLayout';
import { absoluteOgImageUrl, siteUrlNormalized, truncateDescription } from '@/lib/seoHelpers';
import { getPageBySlug } from '@/lib/pages.server';
import { THEME } from '@/utils/theme';

export const dynamic = 'force-dynamic';

interface InfoSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: InfoSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};

  const base = siteUrlNormalized();
  const title = page.meta?.title?.trim() || `${page.title} | ЯНИНА В`;
  const description = truncateDescription(
    page.meta?.description?.trim() ||
      `${page.title} — ювелирная студия ЯНИНА В.`,
  );

  const ogPath = page.meta?.image?.trim();
  const ogUrl = ogPath ? absoluteOgImageUrl(ogPath, base) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${base}/${slug.trim().toLowerCase()}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ru_RU',
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  };
}

const richTextArticleClass =
  'payload-info-page space-y-6 text-base leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_a]:text-accent-primary [&_a]:underline hover:[&_a]:no-underline [&_strong]:font-semibold';

export default async function InfoSlugPage({ params }: InfoSlugPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const { heading, text } = THEME;

  return (
    <InfoPageLayout showLegalDivider={page.showLegalDivider}>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
        {page.title}
      </h1>

      <div className={richTextArticleClass} style={{ color: text }}>
        <RichText
          data={page.body as SerializedEditorState}
          converters={({ defaultConverters }) => ({
            ...defaultConverters,
            heading: ({ node, nodesToJSX }) => {
              const Tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
              return (
                <Tag className="font-display font-semibold" style={{ color: heading }}>
                  {nodesToJSX({ nodes: node.children })}
                </Tag>
              );
            },
          })}
        />
      </div>
    </InfoPageLayout>
  );
}
