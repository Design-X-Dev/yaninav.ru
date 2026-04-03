'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SiVk, SiInstagram, SiTelegram, SiPinterest } from 'react-icons/si';
import ColorControlPanel from './ColorControlPanel';

interface ContactProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
  headingColor?: string;
  subheadingColor?: string;
  textColor?: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const Contact = ({ 
  backgroundColor = '#f4f7f0', 
  onColorChange,
  headingColor = '#59151f',
  subheadingColor = '#59151f',
  textColor = '#616161',
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
}: ContactProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    file: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    // TODO: Implement form submission logic
    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '', file: null });
  };

  const [consentAccepted, setConsentAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'file' && target.files) {
      setFormData({
        ...formData,
        file: target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  return (
    <section id="contact" className="relative py-20" style={{ backgroundColor }}>
      {(onColorChange || onHeadingColorChange || onSubheadingColorChange || onTextColorChange) && (
        <ColorControlPanel
          sectionId="contact"
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
        {/* Section Header — якорь для «Контакты» в шапке */}
        <div id="contact-reach" className="text-center mb-16 scroll-mt-28">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: headingColor }}>
            Свяжитесь с нами
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: textColor }}>
            Готовы создать украшение вашей мечты?
            <br />
            Свяжитесь с нами для оформления заказа или консультации
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-6" style={{ color: subheadingColor }}>
                Контактная информация
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm" style={{ backgroundColor }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: headingColor }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: headingColor }}>Адрес</h4>
                    <p style={{ color: textColor }}>
                      г. Екатеринбург, ул. Белинского, 41
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm" style={{ backgroundColor }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: headingColor }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: headingColor }}>Телефон</h4>
                    <p style={{ color: textColor }}>
                      <a href="tel:+79920147127" style={{ color: textColor }} className="hover:opacity-80 transition-colors">+7(992)014-71-27</a><br />
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm" style={{ backgroundColor }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: headingColor }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: headingColor }}>Email</h4>
                    <p style={{ color: textColor }}>
                      <a href="mailto:yaninav-jewelrystudio@yandex.ru" style={{ color: textColor }} className="hover:opacity-80 transition-colors break-all">
                        yaninav-jewelrystudio@yandex.ru
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm" style={{ backgroundColor }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: headingColor }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: headingColor }}>Режим работы</h4>
                    <p style={{ color: textColor }}>
                      Пн-Пт: 10:00 - 20:00<br />
                      Сб-Вс: 11:00 - 19:00<br />
                      По предварительной записи
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Appointment Button */}
              <div className="mt-8">
                <a
                  href="#contact-form"
                  className="inline-block w-full px-8 py-4 rounded-full font-medium text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: headingColor, color: backgroundColor }}
                >
                  Записаться на встречу
                </a>
              </div>

              {/* Messenger Buttons */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4" style={{ color: headingColor }}>Напишите нам в мессенджер</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://wa.me/79920147127"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 rounded-full font-medium text-center transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href="https://t.me/yanina_v_jewelry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 rounded-full font-medium text-center transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#0088cc', color: '#ffffff' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.028-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: headingColor }}>Мы в социальных сетях</h4>
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
          </div>

          {/* Contact Form */}
          <div id="contact-form" className="glass-card p-8 rounded-2xl" style={{ backgroundColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}>
            <h3 className="font-display text-2xl font-semibold mb-6" style={{ color: subheadingColor }}>
              Отправить сообщение
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  style={{ backgroundColor, color: textColor, borderColor: headingColor }}
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  style={{ backgroundColor, color: textColor, borderColor: headingColor }}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  style={{ backgroundColor, color: textColor, borderColor: headingColor }}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 resize-none backdrop-blur-sm"
                  style={{ backgroundColor, color: textColor, borderColor: headingColor }}
                  placeholder="Расскажите о ваших пожеланиях..."
                />
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
                  Прикрепить файл (фото или картинку)
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer"
                  style={{ backgroundColor, color: textColor, borderColor: headingColor }}
                />
                {formData.file && (
                  <p className="mt-2 text-sm" style={{ color: textColor }}>
                    Выбран файл: {formData.file.name}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  required
                  aria-required="true"
                  className="mt-1 h-[18px] w-[18px] shrink-0 rounded-none border-2 cursor-pointer accent-[#59151f]"
                  style={{ borderColor: headingColor }}
                />
                <label htmlFor="privacy-consent" className="text-sm leading-snug cursor-pointer select-none" style={{ color: textColor }}>
                  Оставляя данные, вы соглашаетесь с{' '}
                  <Link href="/privacy" className="text-accent-primary underline hover:no-underline" onClick={(e) => e.stopPropagation()}>
                    Политикой конфиденциальности
                  </Link>
                  {' '}и принимаете условия{' '}
                  <Link href="/offer" className="text-accent-primary underline hover:no-underline" onClick={(e) => e.stopPropagation()}>
                    Публичной оферты
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={!consentAccepted}
                style={{ 
                  backgroundColor: headingColor,
                  color: backgroundColor,
                  borderColor: headingColor,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                className="w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-luxury"
              >
                Отправить сообщение
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 