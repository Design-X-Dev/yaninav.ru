'use client';

import type { AboutContent, AboutIconKey } from '@/types/about';
import { lexicalRootToParagraphs } from '@/lib/lexicalToReact';
import { nbspAfterSi } from '@/utils/typography';

import type { IconType } from 'react-icons';
import {
  LuBadgeCheck,
  LuCircleCheck,
  LuClock,
  LuCompass,
  LuCrown,
  LuDiamond,
  LuEye,
  LuFeather,
  LuFlower2,
  LuGem,
  LuGift,
  LuHandHeart,
  LuHandshake,
  LuHeart,
  LuLeaf,
  LuLockKeyhole,
  LuMoon,
  LuPalette,
  LuPenLine,
  LuScale,
  LuShieldCheck,
  LuSparkles,
  LuStar,
  LuSun,
  LuWandSparkles,
} from 'react-icons/lu';

const ICONS: Record<AboutIconKey, IconType> = {
  heart: LuHeart,
  sparkles: LuSparkles,
  check: LuCircleCheck,
  sparkle4: LuSparkles,
  clock: LuClock,
  shield: LuShieldCheck,
  gem: LuGem,
  diamond: LuDiamond,
  crown: LuCrown,
  leaf: LuLeaf,
  flower: LuFlower2,
  feather: LuFeather,
  palette: LuPalette,
  pen: LuPenLine,
  handHeart: LuHandHeart,
  handshake: LuHandshake,
  badgeCheck: LuBadgeCheck,
  lock: LuLockKeyhole,
  scale: LuScale,
  compass: LuCompass,
  eye: LuEye,
  star: LuStar,
  sun: LuSun,
  moon: LuMoon,
  wand: LuWandSparkles,
  gift: LuGift,
};

const About = ({ about }: { about: AboutContent }) => {
  const leadParagraphs = lexicalRootToParagraphs(about.lead, {
    paragraphClassName: 'text-lg leading-relaxed',
    textClassName: 'text-theme-muted',
    wrapPlainTextFragment: (s) => nbspAfterSi(s),
    strongClassNameFor: () => 'text-theme-inverse',
  });

  const hasLead = leadParagraphs.length > 0;

  return (
    <section id="about" className="relative scroll-mt-28 py-20 bg-accent-primary" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Якорь для «О студии»: всегда, даже без параграфов в rich-text */}
        <div id="about-description" className="scroll-mt-28" aria-hidden />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {hasLead ? (
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-theme-inverse">
                {about.heading}
              </h2>
              <div className="space-y-6">{leadParagraphs}</div>
            </div>
          ) : null}

          {/* Правая колонка — карточки */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${hasLead ? '' : 'lg:col-span-2'}`}>
            {about.features.map((feature) => {
              const Icon = ICONS[feature.icon];

              return (
                <div
                  key={`${feature.icon}-${feature.title}`}
                  className="p-6 rounded-2xl border border-theme-inverse hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1 bg-accent-primary"
                >
                  <div className="mb-3 text-theme-inverse" aria-hidden>
                    <Icon className="w-8 h-8" aria-hidden />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2 text-theme-inverse">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-theme-muted">
                    {nbspAfterSi(feature.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
