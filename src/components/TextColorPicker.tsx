'use client';

import { useState } from 'react';

const colorOptions = [
  { name: 'Темно-оливковый', rgb: '56, 74, 50', hex: '#384a32' },
  { name: 'Светло-кремовый', rgb: '244, 247, 240', hex: '#f4f7f0' },
  { name: 'Светло-голубой', rgb: '159, 177, 194', hex: '#9fb1c2' },
  { name: 'Темно-бордовый', rgb: '89, 21, 31', hex: '#59151f' },
  { name: 'Светло-бежевый', rgb: '224, 205, 186', hex: '#e0cdba' },
  { name: 'Темно-серый', rgb: '97, 97, 97', hex: '#616161' },
];

interface TextColorPickerProps {
  sectionId: string;
  headingColor: string;
  subheadingColor: string;
  textColor: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const TextColorPicker = ({
  sectionId: _sectionId, // eslint-disable-line @typescript-eslint/no-unused-vars
  headingColor,
  subheadingColor,
  textColor,
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
}: TextColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<'heading' | 'subheading' | 'text' | null>(null);

  const handleColorSelect = (color: string) => {
    if (activeType === 'heading' && onHeadingColorChange) {
      onHeadingColorChange(color);
    } else if (activeType === 'subheading' && onSubheadingColorChange) {
      onSubheadingColorChange(color);
    } else if (activeType === 'text' && onTextColorChange) {
      onTextColorChange(color);
    }
    setActiveType(null);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 left-4 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-gray-200 hover:border-accent-primary transition-all duration-300 flex items-center justify-center group"
        title="Выбрать цвет текста секции"
      >
        <svg className="w-5 h-5 text-gray-700 group-hover:text-accent-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setActiveType(null);
            }}
          />
          <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 min-w-[320px] z-50 border border-gray-200">
            {!activeType ? (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-3">Выберите тип текста:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveType('heading')}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border-2 border-transparent hover:border-accent-primary"
                  >
                    <span className="text-sm font-medium text-gray-700">Заголовок</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: headingColor }}
                      />
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveType('subheading')}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border-2 border-transparent hover:border-accent-primary"
                  >
                    <span className="text-sm font-medium text-gray-700">Подзаголовок</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: subheadingColor }}
                      />
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveType('text')}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border-2 border-transparent hover:border-accent-primary"
                  >
                    <span className="text-sm font-medium text-gray-700">Основной текст</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: textColor }}
                      />
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setActiveType(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <p className="text-sm font-semibold text-gray-700">
                    {activeType === 'heading' && 'Цвет заголовка'}
                    {activeType === 'subheading' && 'Цвет подзаголовка'}
                    {activeType === 'text' && 'Цвет основного текста'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((color) => {
                    const currentColor = activeType === 'heading' ? headingColor : activeType === 'subheading' ? subheadingColor : textColor;
                    return (
                      <button
                        key={color.hex}
                        onClick={() => handleColorSelect(color.hex)}
                        className={`w-16 h-16 rounded-lg border-2 transition-all duration-300 hover:scale-110 ${currentColor === color.hex
                            ? 'border-accent-primary ring-2 ring-accent-primary ring-offset-2'
                            : 'border-gray-300 hover:border-accent-primary'
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Текущий: {colorOptions.find(c => {
                    const currentColor = activeType === 'heading' ? headingColor : activeType === 'subheading' ? subheadingColor : textColor;
                    return c.hex === currentColor;
                  })?.name}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TextColorPicker;

