/** Тонкая линия над футером — только на страницах политики / оферты / гарантий, ширина как у текста */
export default function LegalFooterDivider() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="border-t border-theme" aria-hidden />
    </div>
  );
}
