'use client';

import type { AboutContent, AboutIconKey } from '@/types/about';
import { lexicalRootToParagraphs } from '@/lib/lexicalToReact';
import { SECTIONS } from '@/utils/theme';
import { nbspAfterSi } from '@/utils/typography';

import type { ReactNode } from 'react';

const ICON_PATHS: Record<AboutIconKey, ReactNode> = {
  heart: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  ),
  sparkles: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
  ),
  check: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  sparkle4: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  ),
  clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  shield: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  ),
};

const About = ({ about }: { about: AboutContent }) => {
  const { bg, heading, subheading, text } = SECTIONS.about;

  const leadParagraphs = lexicalRootToParagraphs(about.lead, {
    paragraphClassName: 'text-lg leading-relaxed',
    textColor: text,
    wrapPlainTextFragment: (s) => nbspAfterSi(s),
    getStrongStyle: (paragraphIndex) =>
      paragraphIndex === 3 ? { color: heading } : { color: subheading },
  });

  const hasLead = leadParagraphs.length > 0;

  return (
    <section id="about" className="relative scroll-mt-28 py-20" style={{ backgroundColor: bg }} suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Якорь для «О студии»: всегда, даже без параграфов в rich-text */}
        <div id="about-description" className="scroll-mt-28" aria-hidden />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {hasLead ? (
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: heading }}>
                {about.heading}
              </h2>
              <div className="space-y-6">{leadParagraphs}</div>
            </div>
          ) : null}

          {/* Правая колонка — карточки */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${hasLead ? '' : 'lg:col-span-2'}`}>
            {about.features.map((feature) => (
              <div
                key={`${feature.icon}-${feature.title}`}
                className="p-6 rounded-2xl hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: bg, borderColor: heading, borderWidth: '1px', borderStyle: 'solid' }}
              >
                <div className="mb-3" aria-hidden style={{ color: heading }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {ICON_PATHS[feature.icon]}
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: heading }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: text }}>
                  {nbspAfterSi(feature.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
