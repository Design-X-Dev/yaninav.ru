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

interface SectionColorPickerProps {
  sectionId: string;
  currentColor: string;
  onColorChange: (color: string) => void;
}

const SectionColorPicker = ({ sectionId: _sectionId, // eslint-disable-line @typescript-eslint/no-unused-vars
  currentColor, onColorChange }: SectionColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-gray-200 hover:border-accent-primary transition-all duration-300 flex items-center justify-center group"
        style={{ backgroundColor: currentColor }}
        title="Выбрать цвет фона секции"
      >
        <svg className="w-5 h-5 text-gray-700 group-hover:text-accent-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 min-w-[280px] z-50 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Выберите цвет фона:</p>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => {
                    onColorChange(color.hex);
                    setIsOpen(false);
                  }}
                  className={`w-16 h-16 rounded-lg border-2 transition-all duration-300 hover:scale-110 ${
                    currentColor === color.hex 
                      ? 'border-accent-primary ring-2 ring-accent-primary ring-offset-2' 
                      : 'border-gray-300 hover:border-accent-primary'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">Текущий: {colorOptions.find(c => c.hex === currentColor)?.name}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SectionColorPicker;

