'use client';

import Link from 'next/link';
import { SiVk, SiInstagram, SiTelegram, SiPinterest } from 'react-icons/si';
import ColorControlPanel from './ColorControlPanel';

interface FooterProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
  headingColor?: string;
  subheadingColor?: string;
  textColor?: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const Footer = ({ 
  backgroundColor = '#f4f7f0', 
  onColorChange,
  headingColor = '#59151f',
  subheadingColor = '#59151f',
  textColor = '#616161',
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
}: FooterProps) => {
  return (
    <footer className="relative text-theme-primary" style={{ backgroundColor }}>
      {(onColorChange || onHeadingColorChange || onSubheadingColorChange || onTextColorChange) && (
        <ColorControlPanel
          sectionId="footer"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-3xl font-bold inline-block mb-4" style={{ color: headingColor }}>
              YANINA V
            </Link>
            <p className="mb-6 max-w-md" style={{ color: textColor }}>
              Ювелирная студия, создающая эксклюзивные украшения ручной работы.
              Каждое изделие — это произведение искусства, созданное с любовью и вниманием к деталям.
            </p>
            <div className="flex space-x-4">
              <a href="https://vk.com/yanina_v_js" target="_blank" rel="noopener noreferrer" className="w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:opacity-80" style={{ backgroundColor, color: textColor }} aria-label="ВКонтакте">
                <SiVk className="w-5 h-5" />
              </a>
              <a href="https://pin.it/167eneWKe" target="_blank" rel="noopener noreferrer" className="w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:opacity-80" style={{ backgroundColor, color: textColor }} aria-label="Pinterest">
                <SiPinterest className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/yanina_v_jewelry_studio_?igsh=cWtqcTV6bGFybWVi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:opacity-80" style={{ backgroundColor, color: textColor }} aria-label="Instagram">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href="https://t.me/yanina_v_jewelry" target="_blank" rel="noopener noreferrer" className="w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:opacity-80" style={{ backgroundColor, color: textColor }} aria-label="Telegram">
                <SiTelegram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: headingColor }}>Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#catalog" className="hover:text-accent-primary transition-colors duration-300" style={{ color: textColor }}>
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="#collections" className="hover:text-accent-primary transition-colors duration-300" style={{ color: textColor }}>
                  Коллекции
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-accent-primary transition-colors duration-300" style={{ color: textColor }}>
                  О студии
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-accent-primary transition-colors duration-300" style={{ color: textColor }}>
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/custom-orders" className="hover:text-accent-primary transition-colors duration-300" style={{ color: textColor }}>
                  Индивидуальные заказы
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: headingColor }}>Контакты</h3>
            <div className="space-y-3" style={{ color: textColor }}>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">г. Екатеринбург, ул. Белинского, 41</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-accent-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-sm">
                  <a href="tel:+79920147127" className="hover:text-accent-primary transition-colors block">+7(992) 014-71-27</a>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:yaninav-jewelrystudio@yandex.ru" className="text-sm hover:text-accent-primary transition-colors break-all">
                  yaninav-jewelrystudio@yandex.ru
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div>Пн-Пт: 10:00 - 20:00</div>
                  <div>Сб-Вс: 11:00 - 19:00</div>
                  <div>По предварительной записи</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme-muted mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm" style={{ color: textColor }}>
              © 2024 YANINA V. Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-accent-primary text-sm transition-colors duration-300" style={{ color: textColor }}>
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="hover:text-accent-primary text-sm transition-colors duration-300" style={{ color: textColor }}>
                Условия использования
              </Link>
              <Link href="/delivery" className="hover:text-accent-primary text-sm transition-colors duration-300" style={{ color: textColor }}>
                Доставка и оплата
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 