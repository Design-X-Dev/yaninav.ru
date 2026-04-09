/** Плавная прокрутка к секции на главной странице (работает только на '/') */
export function scrollToHomeSection(sectionId: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/') return;
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${sectionId}`);
  }
}
