'use client';

import { useState, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Catalog from '@/components/Catalog';
import { useEditMode } from '@/utils/useEditMode';

function CatalogPageContent() {
  const showEditControls = useEditMode();
  const [sectionColors, setSectionColors] = useState({
    catalog: '#f4f7f0',
  });
  const [textColors, setTextColors] = useState({
    catalog: { heading: '#59151f', subheading: '#59151f', text: '#616161' },
  });

  const handleColorChange = (color: string) => {
    setSectionColors((prev) => ({ ...prev, catalog: color }));
  };

  const handleTextColorChange = (type: 'heading' | 'subheading' | 'text', color: string) => {
    setTextColors((prev) => ({
      ...prev,
      catalog: {
        ...prev.catalog,
        [type]: color,
      },
    }));
  };

  return (
    <main>
      <Header sectionColor={sectionColors.catalog} />
      <Catalog
        backgroundColor={sectionColors.catalog}
        onColorChange={showEditControls ? handleColorChange : undefined}
        headingColor={textColors.catalog.heading}
        subheadingColor={textColors.catalog.subheading}
        textColor={textColors.catalog.text}
        onHeadingColorChange={showEditControls ? (color) => handleTextColorChange('heading', color) : undefined}
        onSubheadingColorChange={showEditControls ? (color) => handleTextColorChange('subheading', color) : undefined}
        onTextColorChange={showEditControls ? (color) => handleTextColorChange('text', color) : undefined}
      />
      <Footer backgroundColor={sectionColors.catalog} />
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CatalogPageContent />
    </Suspense>
  );
}

