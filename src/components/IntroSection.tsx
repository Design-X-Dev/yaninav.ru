'use client';

import ColorControlPanel from './ColorControlPanel';

interface IntroSectionProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
  headingColor?: string;
  subheadingColor?: string;
  textColor?: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const IntroSection = ({ 
  backgroundColor = '#f4f7f0', 
  onColorChange,
  headingColor = '#59151f',
  subheadingColor = '#59151f',
  textColor = '#616161',
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
}: IntroSectionProps) => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20" style={{ backgroundColor }}>
      {(onColorChange || onHeadingColorChange || onSubheadingColorChange || onTextColorChange) && (
        <ColorControlPanel
          sectionId="intro"
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
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: headingColor }}>
            Yanina V
          </h2>
          <h3 className="font-display text-[1.5rem] sm:text-[1.8rem] lg:text-[2.1rem] font-medium mb-3" style={{ color: subheadingColor }}>
            Украшения, в которых живут воспоминания
          </h3>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: textColor }}>
            Главная цель и задача — сохранить ценные воспоминания и значимые моменты
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;

