'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SECTIONS } from '@/utils/theme';
import { nbspAfterSi } from '@/utils/typography';
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_DISPLAY, EMAIL_HREF } from '@/utils/social';

const CONTACT_ITEMS = [
  {
    key: 'address',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Адрес',
    content: <p>г. Екатеринбург, ул. Белинского, 41</p>,
  },
  {
    key: 'phone',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Телефон',
    content: (color: string) => (
      <a href={PHONE_HREF} style={{ color }} className="hover:opacity-80 transition-colors">
        {PHONE_DISPLAY}
      </a>
    ),
  },
  {
    key: 'email',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    content: (color: string) => (
      <a href={EMAIL_HREF} style={{ color }} className="hover:opacity-80 transition-colors break-all">
        {EMAIL_DISPLAY}
      </a>
    ),
  },
  {
    key: 'hours',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Режим работы',
    content: (
      <p>
        Пн-Пт: 10:00 - 20:00<br />
        Сб-Вс: 11:00 - 19:00<br />
        По предварительной записи
      </p>
    ),
  },
] as const;

const INITIAL_FORM = { name: '', email: '', phone: '', message: '', file: null as File | null };

const Contact = () => {
  const { bg: backgroundColor, heading: headingColor, subheading: subheadingColor, text: textColor } = SECTIONS.contact;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'file' && target.files) {
      setFormData((prev) => ({ ...prev, file: target.files![0] }));
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(INITIAL_FORM);
    setConsentAccepted(false);
  };

  const iconWrapStyle = { backgroundColor };
  const inputCls = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 backdrop-blur-sm';
  const inputStyle = { backgroundColor, color: textColor, borderColor: headingColor };

  return (
    <section id="contact" className="relative scroll-mt-28 py-20" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок — якорь для «Контакты» в шапке */}
        <div id="contact-reach" className="text-center mb-16 scroll-mt-28">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: headingColor }}>
            Свяжитесь с нами
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: textColor }}>
            {nbspAfterSi('Готовы создать украшение вашей мечты?')}
            <br />
            {nbspAfterSi('Свяжитесь с нами для оформления заказа или консультации')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Контактная информация */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-6" style={{ color: subheadingColor }}>
                Контактная информация
              </h3>

              <div className="space-y-6">
                {CONTACT_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-start space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                      style={{ ...iconWrapStyle, color: headingColor }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ color: textColor }}>
                      <h4 className="font-semibold mb-1" style={{ color: headingColor }}>{item.label}</h4>
                      {typeof item.content === 'function' ? item.content(textColor) : item.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled
                  className="inline-block w-full cursor-not-allowed rounded-full border-0 px-8 py-4 text-center font-medium opacity-60 shadow-lg transition-opacity"
                  style={{ backgroundColor: headingColor, color: backgroundColor }}
                  aria-disabled="true"
                  title="Запись на встречу скоро будет доступна"
                >
                  Записаться на встречу
                </button>
                <p className="mt-2 text-center text-xs leading-snug opacity-80" style={{ color: textColor }}>
                  {nbspAfterSi('Скоро здесь появится календарь и график записи на встречу.')}
                </p>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div id="contact-form" className="glass-card p-8 rounded-2xl" style={{ backgroundColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}>
            <h3 className="font-display text-2xl font-semibold mb-6" style={{ color: subheadingColor }}>
              Отправить сообщение
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: 'name',    label: 'Имя *',      type: 'text',  placeholder: 'Ваше имя' },
                { id: 'email',   label: 'Email *',     type: 'email', placeholder: 'your@email.com' },
                { id: 'phone',   label: 'Телефон *',   type: 'tel',   placeholder: '+7 (999) 123-45-67' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: headingColor }}>{label}</label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id as keyof typeof INITIAL_FORM] as string}
                    onChange={handleChange}
                    required
                    className={inputCls}
                    style={inputStyle}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: headingColor }}>Сообщение *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
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
                  className={`${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer`}
                  style={inputStyle}
                />
                {formData.file && (
                  <p className="mt-2 text-sm" style={{ color: textColor }}>Выбран файл: {formData.file.name}</p>
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
                  <Link href="/privacy" className="text-accent-primary underline hover:no-underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    Политикой конфиденциальности
                  </Link>
                  {' '}и принимаете условия{' '}
                  <Link href="/offer" className="text-accent-primary underline hover:no-underline" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    Публичной оферты
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={!consentAccepted}
                style={{ backgroundColor: headingColor, color: backgroundColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
                className="w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-luxury"
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
