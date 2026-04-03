'use client';

import ColorControlPanel from './ColorControlPanel';

interface AboutProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
  headingColor?: string;
  subheadingColor?: string;
  textColor?: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const About = ({ 
  backgroundColor = '#59151f', // красный фон по умолчанию
  onColorChange,
  headingColor = '#f4f7f0', // светлый заголовок
  subheadingColor = '#f4f7f0', // светлый подзаголовок
  textColor = '#9fb1c2', // голубой текст
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
}: AboutProps) => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Эмоциональная связь',
      description: 'Каждое украшение — это личная история, эмоция и память'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      title: 'Художественный подход',
      description: 'Соединяем эстетику, символизм и современные тренды'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Ручная работа',
      description: 'Точные ювелирные техники, авторский взгляд, внимание к деталям'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: 'Семейный архив',
      description: 'С 2016 года создаём украшения, которые передаются поколениями'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '9+ Лет опыта',
      description: 'Богатый опыт в создании уникальных ювелирных изделий'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '100% Гарантия качества',
      description: 'Каждое изделие проходит строгий контроль качества'
    }
  ];

  return (
    <section id="about" className="relative py-20" style={{ backgroundColor }} suppressHydrationWarning>
      {(onColorChange || onHeadingColorChange || onSubheadingColorChange || onTextColorChange) && (
        <ColorControlPanel
          sectionId="about"
          backgroundColor={backgroundColor}
          headingColor={headingColor}
          subheadingColor={subheadingColor}
          textColor={textColor}
          onBackgroundColorChange={onColorChange}
          onHeadingColorChange={onHeadingColorChange}
          onSubheadingColorChange={onSubheadingColorChange}
          onTextColorChange={onTextColorChange}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ color: headingColor }}>
            Философия бренда
          </h2>
            <div className="space-y-6" style={{ color: textColor }}>
              <p className="text-lg leading-relaxed">
                Бренд YANINA V строится на признании: каждое украшение — это личная история, эмоция и память. 
                Мы создаём ювелирные украшения, отражающие уникальность каждого клиента.
              </p>
              <p className="text-lg leading-relaxed">
                <strong style={{ color: subheadingColor }}>Художественный подход и профессиональное мастерство:</strong> соединяем эстетику, символизм и современные тренды, при этом сохраняем свою уникальность.
              </p>
              <p className="text-lg leading-relaxed">
                Украшения YANINA V несут глубокий эмоциональный заряд, который резонирует с клиентами.
              </p>
              <p className="text-lg leading-relaxed">
                <strong style={{ color: headingColor }}>Всё ручная работа:</strong> точные ювелирные техники, авторский художественный взгляд, внимание к деталям и лимитированные серии.
              </p>
              <p className="text-lg leading-relaxed">
                С 2016 года мы держим планку высокого качества и гарантии — каждая вещь становится частью семейного архива. 
                Стремимся сочетать эстетику и тренды.
              </p>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="p-6 rounded-2xl hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-1"
                  style={{ backgroundColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
                >
                  <h3 className="font-display text-xl font-semibold mb-2" style={{ color: headingColor }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: textColor }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 