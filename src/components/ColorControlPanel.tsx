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

interface ColorControlPanelProps {
  sectionId: string;
  backgroundColor: string;
  headingColor: string;
  subheadingColor: string;
  textColor: string;
  onBackgroundColorChange?: (color: string) => void;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const ColorControlPanel = ({
  sectionId: _sectionId, // eslint-disable-line @typescript-eslint/no-unused-vars
  backgroundColor,
  headingColor,
  subheadingColor,
  textColor,
  onBackgroundColorChange,
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
}: ColorControlPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBackgroundColorSelect = (color: string) => {
    if (onBackgroundColorChange) {
      onBackgroundColorChange(color);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white backdrop-blur-sm shadow-xl border-2 border-gray-800 hover:border-gray-900 transition-all duration-300 flex items-center justify-center group"
        title="Управление оформлением секции"
      >
        <svg className="w-5 h-5 text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 min-w-[384px] z-50 border border-gray-200 max-h-[600px] overflow-y-auto">
            {/* Выбор цвета фона */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Цвет фона:</p>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => {
                      handleBackgroundColorSelect(color.hex);
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${backgroundColor === color.hex
                        ? 'border-accent-primary ring-2 ring-accent-primary ring-offset-2'
                        : 'border-gray-300 hover:border-accent-primary'
                      }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Разделитель */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Выбор цвета текста */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Цвет текста:</p>

              {/* Заголовок */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Заголовок</p>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={`heading-${color.hex}`}
                      onClick={() => {
                        if (onHeadingColorChange) {
                          onHeadingColorChange(color.hex);
                        }
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${headingColor === color.hex
                          ? 'border-accent-primary ring-2 ring-accent-primary ring-offset-2'
                          : 'border-gray-300 hover:border-accent-primary'
                        }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Подзаголовок */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Подзаголовок</p>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={`subheading-${color.hex}`}
                      onClick={() => {
                        if (onSubheadingColorChange) {
                          onSubheadingColorChange(color.hex);
                        }
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${subheadingColor === color.hex
                          ? 'border-accent-primary ring-2 ring-accent-primary ring-offset-2'
                          : 'border-gray-300 hover:border-accent-primary'
                        }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Основной текст */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Основной текст</p>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={`text-${color.hex}`}
                      onClick={() => {
                        if (onTextColorChange) {
                          onTextColorChange(color.hex);
                        }
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${textColor === color.hex
                          ? 'border-accent-primary ring-2 ring-accent-primary ring-offset-2'
                          : 'border-gray-300 hover:border-accent-primary'
                        }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorControlPanel;

