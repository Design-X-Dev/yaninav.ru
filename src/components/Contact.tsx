import Link from 'next/link';
import { Fragment } from 'react';
import ContactForm from '@/components/ContactForm';
import { getContactContent } from '@/lib/contact.server';
import { getSerializedContactForm } from '@/lib/forms.server';
import { CONTACT_FORM_SLUG } from '@/payload/seeds/contactFormDefinition';
import type { ContactSectionContent } from '@/types/contact';
import { nbspAfterSi } from '@/utils/typography';

const ADDRESS_ICON = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PHONE_ICON = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const EMAIL_ICON = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const HOURS_ICON = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function renderIntro(intro: string) {
  const blocks = intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((para, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          <span>{nbspAfterSi(para)}</span>
        </Fragment>
      ))}
    </>
  );
}

function renderHours(text: string) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <p className="text-theme-secondary">
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {nbspAfterSi(line)}
        </Fragment>
      ))}
    </p>
  );
}

function contactRows(content: ContactSectionContent) {
  return [
    {
      key: 'address',
      icon: ADDRESS_ICON,
      label: 'Адрес',
      body: (
        <p className="whitespace-pre-line text-theme-secondary">
          {nbspAfterSi(content.address.trim())}
        </p>
      ),
    },
    {
      key: 'phone',
      icon: PHONE_ICON,
      label: 'Телефон',
      body: (
        <a href={content.phoneHref} className="text-theme-secondary hover:opacity-80 transition-colors">
          {content.phoneDisplay}
        </a>
      ),
    },
    {
      key: 'email',
      icon: EMAIL_ICON,
      label: 'Email',
      body: (
        <a
          href={content.emailHref}
          className="text-theme-secondary hover:opacity-80 transition-colors break-all"
        >
          {content.emailDisplay}
        </a>
      ),
    },
    {
      key: 'hours',
      icon: HOURS_ICON,
      label: 'Режим работы',
      body: renderHours(content.hours),
    },
  ];
}

const Contact = async () => {
  const content = await getContactContent();
  if (!content) return null;

  const serializedForm = await getSerializedContactForm(CONTACT_FORM_SLUG);
  const rows = contactRows(content);

  return (
    <section id="contact" className="relative scroll-mt-28 py-20 bg-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="contact-reach" className="text-center mb-16 scroll-mt-28">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-accent-primary">
            {content.heading}
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-theme-secondary">
            {renderIntro(content.intro)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-6 text-accent-primary">
                {content.contactInfoHeading}
              </h3>

              <div className="space-y-6">
                {rows.map((item) => (
                  <div key={item.key} className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm bg-theme text-accent-primary">
                      {item.icon}
                    </div>
                    <div className="text-theme-secondary">
                      <h4 className="font-semibold mb-1 text-accent-primary">
                        {item.label}
                      </h4>
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled
                  className="inline-block w-full cursor-not-allowed rounded-full border-0 px-8 py-4 text-center font-medium opacity-60 shadow-lg transition-opacity bg-accent-primary text-theme-inverse"
                  aria-disabled="true"
                  title="Запись на встречу скоро будет доступна"
                >
                  {content.appointmentButtonText}
                </button>
                <p className="mt-2 text-center text-xs leading-snug opacity-80 text-theme-secondary">
                  {nbspAfterSi(content.appointmentNote)}
                </p>
              </div>
            </div>
          </div>

          <div id="contact-form" className="glass-card p-8 rounded-2xl">
            <h3 className="font-display text-2xl font-semibold mb-6 text-accent-primary">
              {content.formHeading}
            </h3>

            {!serializedForm ? (
              <div className="space-y-4 text-sm leading-snug text-theme-secondary">
                <p>
                  {nbspAfterSi('Форма временно недоступна: нет записи со slug')} «{CONTACT_FORM_SLUG}»{' '}
                  {nbspAfterSi('в коллекции Forms.')}
                </p>
                <p>
                  {nbspAfterSi('Создайте форму в')}{' '}
                  <Link href="/admin/collections/forms" className="text-accent-primary underline hover:no-underline">
                    Forms
                  </Link>{' '}
                  {nbspAfterSi('или выполните на хосте')}{' '}
                  <code className="text-xs">npm run seed:contact-form</code>
                  {' '}(нужны <code className="text-xs">DATABASE_URI</code> и{' '}
                  <code className="text-xs">PAYLOAD_SECRET</code>
                  ){nbspAfterSi('. После добавления таблиц плагина перезапустите dev-сервер.')}
                </p>
              </div>
            ) : (
              <ContactForm serialized={serializedForm} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
