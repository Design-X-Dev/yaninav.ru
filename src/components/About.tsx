'use client';

import { SECTIONS } from '@/utils/theme';
import { nbspAfterSi } from '@/utils/typography';

const FEATURES = [
  {
    title: 'Эмоциональная связь',
    description: 'Каждое украшение — это личная история, эмоция и память',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  },
  {
    title: 'Художественный подход',
    description: 'Соединяем эстетику, символизм и современные тренды',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />,
  },
  {
    title: 'Ручная работа',
    description: 'Точные ювелирные техники, авторский взгляд, внимание к деталям',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    title: 'Семейный архив',
    description: 'С 2016 года создаём украшения, которые передаются поколениями',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
  },
  {
    title: '9+ Лет опыта',
    description: 'Богатый опыт в создании уникальных ювелирных изделий',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    title: '100% Гарантия качества',
    description: 'Каждое изделие проходит строгий контроль качества',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  },
] as const;

const About = () => {
  const { bg, heading, subheading, text } = SECTIONS.about;

  return (
    <section id="about" className="relative scroll-mt-28 py-20" style={{ backgroundColor: bg }} suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Левая колонка — якорь для «О студии» в шапке */}
          <div id="about-description" className="scroll-mt-28">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: heading }}>
              Философия бренда
            </h2>
            <div className="space-y-6" style={{ color: text }}>
              <p className="text-lg leading-relaxed">
                {nbspAfterSi(
                  'Бренд ЯНИНА В строится на признании: каждое украшение — это личная история, эмоция и память. Мы создаём ювелирные украшения, отражающие уникальность каждого клиента.'
                )}
              </p>
              <p className="text-lg leading-relaxed">
                <strong style={{ color: subheading }}>Художественный подход и профессиональное мастерство:</strong>{' '}
                {nbspAfterSi(
                  'соединяем эстетику, символизм и современные тренды, при этом сохраняем свою уникальность.'
                )}
              </p>
              <p className="text-lg leading-relaxed">
                {nbspAfterSi('Украшения ЯНИНА В несут глубокий эмоциональный заряд, который резонирует с клиентами.')}
              </p>
              <p className="text-lg leading-relaxed">
                <strong style={{ color: heading }}>Всё ручная работа:</strong>{' '}
                {nbspAfterSi(
                  'точные ювелирные техники, авторский художественный взгляд, внимание к деталям и лимитированные серии.'
                )}
              </p>
              <p className="text-lg leading-relaxed">
                {nbspAfterSi(
                  'С 2016 года мы держим планку высокого качества и гарантии — каждое ювелирное изделие становится частью семейного архива. Стремимся сочетать эстетику и тренды.'
                )}
              </p>
            </div>
          </div>

          {/* Правая колонка — карточки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: bg, borderColor: heading, borderWidth: '1px', borderStyle: 'solid' }}
              >
                <div className="mb-3" aria-hidden style={{ color: heading }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
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
