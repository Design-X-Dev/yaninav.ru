'use client';

import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MemoriesSection from '@/components/MemoriesSection';
import Catalog from '@/components/Catalog';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { useEditMode } from '@/utils/useEditMode';

// Цвета по умолчанию
const defaultColors = {
  hero: '#f4f7f0', // светло-кремовый
  memories: '#f4f7f0', // светло-кремовый
  catalog: '#f4f7f0', // светло-кремовый
  about: '#59151f', // темно-бордовый (красный) для секции "Философия бренда"
  contact: '#f4f7f0', // светло-кремовый
  footer: '#f4f7f0', // светло-кремовый
};

// Цвета текста по умолчанию
// Заголовки и подзаголовки - красные (#59151f), основной текст - серый (#616161)
// Для секции "Философия бренда" (about): фон красный, заголовки светлые, текст голубой
const defaultTextColors = {
  hero: { heading: '#59151f', subheading: '#59151f', text: '#616161' },
  memories: { heading: '#59151f', subheading: '#59151f', text: '#616161' },
  catalog: { heading: '#59151f', subheading: '#59151f', text: '#616161' },
  about: { heading: '#f4f7f0', subheading: '#f4f7f0', text: '#9fb1c2' }, // светлые заголовки, голубой текст
  contact: { heading: '#59151f', subheading: '#59151f', text: '#616161' },
  footer: { heading: '#59151f', subheading: '#59151f', text: '#616161' },
};

function HomeContent() {
  // Проверяем режим редактирования через GET-параметр ?edit=true
  const showEditControls = useEditMode();

  // Используем значения по умолчанию
  const [sectionColors, setSectionColors] = useState(defaultColors);
  const [textColors, setTextColors] = useState(defaultTextColors);

  // Лимит карточек каталога на главной: всегда 2 полных ряда
  const [catalogLimit, setCatalogLimit] = useState(4);

  useEffect(() => {
    const updateLimit = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      // < 768px → 2 столбца → 4 карточки, ≥ 768px → 3 столбца → 6 карточек
      setCatalogLimit(width < 768 ? 4 : 6);
    };

    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  const handleColorChange = (sectionId: string, color: string) => {
    setSectionColors((prev: typeof defaultColors) => ({
      ...prev,
      [sectionId]: color,
    }));
  };

  const handleTextColorChange = (sectionId: string, type: 'heading' | 'subheading' | 'text', color: string) => {
    setTextColors((prev: typeof defaultTextColors) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId as keyof typeof defaultTextColors],
        [type]: color,
      },
    }));
  };

  return (
    <main>
      <Header sectionColor={sectionColors.hero} />
      <Hero 
        backgroundColor={sectionColors.hero} 
        onColorChange={showEditControls ? (color) => handleColorChange('hero', color) : undefined} 
      />
      <MemoriesSection
        backgroundColor={sectionColors.memories}
        onColorChange={showEditControls ? (color) => handleColorChange('memories', color) : undefined}
        headingColor={textColors.memories.heading}
        subheadingColor={textColors.memories.subheading}
        textColor={textColors.memories.text}
        onHeadingColorChange={showEditControls ? (color) => handleTextColorChange('memories', 'heading', color) : undefined}
        onSubheadingColorChange={showEditControls ? (color) => handleTextColorChange('memories', 'subheading', color) : undefined}
        onTextColorChange={showEditControls ? (color) => handleTextColorChange('memories', 'text', color) : undefined}
        showSliderToggle={showEditControls}
      />
      <Catalog
        backgroundColor={sectionColors.catalog}
        onColorChange={showEditControls ? (color) => handleColorChange('catalog', color) : undefined}
        headingColor={textColors.catalog.heading}
        subheadingColor={textColors.catalog.subheading}
        textColor={textColors.catalog.text}
        onHeadingColorChange={showEditControls ? (color) => handleTextColorChange('catalog', 'heading', color) : undefined}
        onSubheadingColorChange={showEditControls ? (color) => handleTextColorChange('catalog', 'subheading', color) : undefined}
        onTextColorChange={showEditControls ? (color) => handleTextColorChange('catalog', 'text', color) : undefined}
        limit={catalogLimit}
        showViewAll={true}
        hideCategoryFilter={true}
      />
      <About
        backgroundColor={sectionColors.about}
        onColorChange={showEditControls ? (color) => handleColorChange('about', color) : undefined}
        headingColor={textColors.about.heading}
        subheadingColor={textColors.about.subheading}
        textColor={textColors.about.text}
        onHeadingColorChange={showEditControls ? (color) => handleTextColorChange('about', 'heading', color) : undefined}
        onSubheadingColorChange={showEditControls ? (color) => handleTextColorChange('about', 'subheading', color) : undefined}
        onTextColorChange={showEditControls ? (color) => handleTextColorChange('about', 'text', color) : undefined}
      />
      <Contact
        backgroundColor={sectionColors.contact}
        onColorChange={showEditControls ? (color) => handleColorChange('contact', color) : undefined}
        headingColor={textColors.contact.heading}
        subheadingColor={textColors.contact.subheading}
        textColor={textColors.contact.text}
        onHeadingColorChange={showEditControls ? (color) => handleTextColorChange('contact', 'heading', color) : undefined}
        onSubheadingColorChange={showEditControls ? (color) => handleTextColorChange('contact', 'subheading', color) : undefined}
        onTextColorChange={showEditControls ? (color) => handleTextColorChange('contact', 'text', color) : undefined}
      />
      <Footer
        backgroundColor={sectionColors.footer}
        onColorChange={showEditControls ? (color) => handleColorChange('footer', color) : undefined}
        headingColor={textColors.footer.heading}
        subheadingColor={textColors.footer.subheading}
        textColor={textColors.footer.text}
        onHeadingColorChange={showEditControls ? (color) => handleTextColorChange('footer', 'heading', color) : undefined}
        onSubheadingColorChange={showEditControls ? (color) => handleTextColorChange('footer', 'subheading', color) : undefined}
        onTextColorChange={showEditControls ? (color) => handleTextColorChange('footer', 'text', color) : undefined}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HomeContent />
    </Suspense>
  );
}
