'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SECTIONS } from '@/utils/theme';
import { nbspAfterSi } from '@/utils/typography';
import type { ContactSerializedForm, ContactSerializedFormField } from '@/types/contactFormSerialized';

type FormState = Record<string, string | boolean>;

function buildInitialFormState(fields: ContactSerializedFormField[]): FormState {
  const s: FormState = {};
  for (const f of fields) {
    if (f.blockType === 'checkbox') {
      s[f.name] = Boolean(f.defaultValue);
    } else {
      s[f.name] = f.defaultValue ?? '';
    }
  }
  return s;
}

interface ContactFormProps {
  serialized: ContactSerializedForm;
}

export default function ContactForm({ serialized }: ContactFormProps) {
  const { heading: headingColor, text: textColor } = SECTIONS.contact;
  const backgroundColor = SECTIONS.contact.bg;

  const [formData, setFormData] = useState<FormState>(() => buildInitialFormState(serialized.fields));
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const inputCls =
    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300 backdrop-blur-sm';
  const inputStyle = { backgroundColor, color: textColor, borderColor: headingColor };

  const serializeValue = (field: ContactSerializedFormField): string => {
    const raw = formData[field.name];
    if (field.blockType === 'checkbox') {
      return raw === true || raw === 'true' ? 'true' : 'false';
    }
    return String(raw ?? '').trim();
  };

  const validateBeforeSubmit = (): string | null => {
    for (const f of serialized.fields) {
      if (!f.required) continue;
      const raw = formData[f.name];
      if (f.blockType === 'checkbox') {
        if (!(raw === true || raw === 'true')) {
          const label = f.label || f.name;
          return nbspAfterSi(`Отметьте поле «${label}».`);
        }
        continue;
      }
      const s = typeof raw === 'string' ? raw.trim() : '';
      if (!s) {
        const label = f.label || f.name;
        return nbspAfterSi(`Заполните поле «${label}».`);
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    if (!consentAccepted) return;
    const err = validateBeforeSubmit();
    if (err) {
      setErrorText(err);
      return;
    }

    const submissionData = serialized.fields.map((field) => ({
      field: field.name,
      value: serializeValue(field),
    }));

    setBusy(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: serialized.id,
          submissionData,
          hp: honeypot,
        }),
      });

      if (res.status === 204) {
        setSent(true);
        setFormData(buildInitialFormState(serialized.fields));
        setConsentAccepted(false);
        setHoneypot('');
        return;
      }

      const rawText = await res.text().catch(() => '');
      let bodyUnknown: unknown = null;
      if (rawText) {
        try {
          bodyUnknown = JSON.parse(rawText) as unknown;
        } catch {
          bodyUnknown = null;
        }
      }
      const bodyErr =
        bodyUnknown &&
        typeof bodyUnknown === 'object' &&
        'error' in bodyUnknown &&
        typeof (bodyUnknown as { error: unknown }).error === 'string'
          ? (bodyUnknown as { error: string }).error
          : undefined;

      setErrorText(
        nbspAfterSi(
          bodyErr ?? 'Не удалось отправить сообщение. Попробуйте позже или позвоните нам.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const fieldNodes = serialized.fields.map((field) => {
    const id = `cf-${serialized.id}-${field.name}`;
    const labelText = field.label || field.name;
    switch (field.blockType) {
      case 'text':
      case 'email':
      case 'number': {
        const t =
          field.inputType === 'email'
            ? 'email'
            : field.inputType === 'tel'
              ? 'tel'
              : field.inputType === 'number'
                ? 'number'
                : 'text';
        return (
          <div key={field.name}>
            <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
              {field.required ? `${labelText} *` : labelText}
            </label>
            <input
              type={t}
              id={id}
              name={field.name}
              value={typeof formData[field.name] === 'string' ? (formData[field.name] as string) : ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              required={false}
              className={inputCls}
              style={inputStyle}
              placeholder={field.placeholder}
              inputMode={field.inputType === 'tel' ? 'tel' : undefined}
              autoComplete={field.inputType === 'email' ? 'email' : undefined}
              disabled={sent}
            />
          </div>
        );
      }
      case 'textarea':
        return (
          <div key={field.name}>
            <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
              {field.required ? `${labelText} *` : labelText}
            </label>
            <textarea
              id={id}
              name={field.name}
              rows={4}
              value={typeof formData[field.name] === 'string' ? (formData[field.name] as string) : ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              required={false}
              className={`${inputCls} resize-none`}
              style={inputStyle}
              placeholder={field.placeholder}
              disabled={sent}
            />
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.name} className="flex items-start gap-3">
            <input
              type="checkbox"
              id={id}
              checked={formData[field.name] === true}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.checked,
                }))
              }
              disabled={sent}
              className="mt-1 h-[18px] w-[18px] shrink-0 rounded-none border-2 cursor-pointer accent-[#59151f]"
              style={{ borderColor: headingColor }}
            />
            <label htmlFor={id} className="text-sm leading-snug cursor-pointer select-none" style={{ color: textColor }}>
              {field.required ? `${labelText} *` : labelText}
            </label>
          </div>
        );
      case 'select':
        return (
          <div key={field.name}>
            <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: headingColor }}>
              {field.required ? `${labelText} *` : labelText}
            </label>
            <select
              id={id}
              name={field.name}
              value={typeof formData[field.name] === 'string' ? (formData[field.name] as string) : ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              className={inputCls}
              style={inputStyle}
              disabled={sent}
              required={false}
            >
              {!field.required && (
                <option value="">{field.placeholder || nbspAfterSi('Выберите вариант')}</option>
              )}
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return null;
    }
  });

  if (sent) {
    return (
      <div className="space-y-4" role="status">
        <p className="text-lg leading-snug whitespace-pre-wrap" style={{ color: textColor }}>
          {serialized.confirmationMessagePlain}
        </p>
        <button
          type="button"
          className="text-sm underline text-accent-primary"
          onClick={() => {
            setSent(false);
            setErrorText(null);
          }}
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        name="hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute left-[-10000px] h-0 w-0 opacity-0 overflow-hidden"
      />
      {serialized.fields.length === 0 ? (
        <p className="text-sm" style={{ color: textColor }}>
          {nbspAfterSi('В форме нет полей. Настройте блоки в админке Payload → Forms.')}
        </p>
      ) : (
        <>{fieldNodes}</>
      )}

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="privacy-consent-cf"
          checked={consentAccepted}
          onChange={(e) => setConsentAccepted(e.target.checked)}
          required
          aria-required="true"
          className="mt-1 h-[18px] w-[18px] shrink-0 rounded-none border-2 cursor-pointer accent-[#59151f]"
          style={{ borderColor: headingColor }}
        />
        <label htmlFor="privacy-consent-cf" className="text-sm leading-snug cursor-pointer select-none" style={{ color: textColor }}>
          Оставляя данные, вы соглашаетесь с{' '}
          <Link href="/privacy" className="text-accent-primary underline hover:no-underline" onClick={(ev) => ev.stopPropagation()}>
            Политикой конфиденциальности
          </Link>{' '}
          и принимаете условия{' '}
          <Link href="/offer" className="text-accent-primary underline hover:no-underline" onClick={(ev) => ev.stopPropagation()}>
            Публичной оферты
          </Link>
          .
        </label>
      </div>

      {errorText ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorText}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!consentAccepted || busy || serialized.fields.length === 0}
        style={{
          backgroundColor: headingColor,
          color: backgroundColor,
          borderColor: headingColor,
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
        className="w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-luxury"
      >
        {busy ? nbspAfterSi('Отправка…') : nbspAfterSi(serialized.submitButtonLabel)}
      </button>
    </form>
  );
}
