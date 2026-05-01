/** То же значение, что константа `CONTACT_FORM_SLUG` в `src/components/Contact.tsx`. */
export const CONTACT_FORM_SLUG = 'contact';

/** Минимальное Lexical-состояние для richText `confirmationMessage`. */
export const contactFormConfirmationLexical = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        direction: 'ltr',
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
            version: 1,
          },
        ],
      },
    ],
  },
} as const;

/** Документ формы для `payload.create` / `payload.update` (коллекция `forms` из plugin-form-builder). */
export const contactFormSeedData = {
  slug: CONTACT_FORM_SLUG,
  title: 'Свяжитесь с нами',
  submitButtonLabel: { ru: 'Отправить сообщение' },
  confirmationType: 'message' as const,
  confirmationMessage: contactFormConfirmationLexical,
  emails: [] as Record<string, unknown>[],
  fields: [
    {
      blockType: 'text' as const,
      name: 'name',
      label: 'Имя',
      required: true,
      placeholder: 'Ваше имя',
    },
    {
      blockType: 'email' as const,
      name: 'email',
      label: 'Email',
      required: true,
      placeholder: 'your@email.com',
    },
    {
      blockType: 'text' as const,
      name: 'phone',
      label: 'Телефон',
      required: true,
      placeholder: '+7 (999) 123-45-67',
    },
    {
      blockType: 'textarea' as const,
      name: 'message',
      label: 'Сообщение',
      required: true,
      placeholder: 'Расскажите о ваших пожеланиях...',
    },
  ],
};
