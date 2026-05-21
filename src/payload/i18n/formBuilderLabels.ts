import type { Field } from 'payload';

/**
 * Русские подписи для @payloadcms/plugin-form-builder (коллекции forms / form-submissions).
 * При обновлении плагина сверяйте ключи `name` / `slug` с dist/collections/Forms и FormSubmissions.
 */

type Loose = Record<string, unknown>;

function isRecord(v: unknown): v is Loose {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Глубокая копия конфигурации полей для безопасных мутаций (label/description).
 * `structuredClone` падает на функциях (`admin.condition`, `validate`).
 */
function cloneFieldNode<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (typeof value === 'function') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => cloneFieldNode(item)) as unknown as T;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return value;
  }
  const src = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    out[k] = cloneFieldNode(v);
  }
  return out as T;
}
/** Подписи блоков полей формы (slug → labels). */
const BLOCK_LABELS: Record<string, { singular: string; plural: string }> = {
  text: { singular: 'Текст', plural: 'Текстовые поля' },
  email: { singular: 'Email', plural: 'Поля Email' },
  textarea: { singular: 'Многострочный текст', plural: 'Многострочные поля' },
  number: { singular: 'Число', plural: 'Числовые поля' },
  checkbox: { singular: 'Чекбокс', plural: 'Чекбоксы' },
  select: { singular: 'Выпадающий список', plural: 'Поля выпадающего списка' },
  radio: { singular: 'Переключатель', plural: 'Группы переключателя' },
  message: { singular: 'Текстовый блок', plural: 'Текстовые блоки' },
  date: { singular: 'Дата', plural: 'Поля даты' },
  country: { singular: 'Страна', plural: 'Поля страны' },
  state: { singular: 'Регион', plural: 'Поля региона' },
  payment: { singular: 'Оплата', plural: 'Поля оплаты' },
  upload: { singular: 'Загрузка файла', plural: 'Поля загрузки' },
};

function translateCommonFieldLabel(out: Loose): void {
  const name = typeof out.name === 'string' ? out.name : undefined;
  const type = typeof out.type === 'string' ? out.type : undefined;
  if (!name) return;

  switch (name) {
    case 'name':
      if (type === 'text') {
        out.label = 'Имя поля (латиница, без спецсимволов)';
      }
      break;
    case 'label':
      if (type === 'text') {
        out.label = 'Подпись';
      }
      break;
    case 'required':
      if (type === 'checkbox') {
        out.label = 'Обязательное';
      }
      break;
    case 'width':
      if (type === 'number') {
        out.label = 'Ширина поля (%)';
      }
      break;
    case 'placeholder':
      if (type === 'text') {
        out.label = 'Подсказка (placeholder)';
      }
      break;
    case 'defaultValue':
      if (type === 'checkbox') {
        out.label = 'Включено по умолчанию';
      } else if (type) {
        out.label = 'Значение по умолчанию';
      }
      break;
    case 'value':
      if (type === 'text' || type === 'textarea') {
        out.label = 'Значение';
      }
      break;
    case 'mimeType':
      if (type === 'text') {
        out.label = 'MIME-тип';
      }
      break;
    case 'multiple':
      if (type === 'checkbox') {
        out.label = 'Разрешить несколько файлов';
      }
      break;
    case 'maxFileSize':
      if (type === 'number') {
        out.label = 'Макс. размер файла (байт)';
      }
      break;
    case 'mimeTypes':
      if (type === 'array') {
        out.label = 'Допустимые типы файлов';
        out.labels = { plural: 'MIME-типы', singular: 'MIME-тип' };
      }
      break;
    case 'paymentProcessor':
      if (type === 'select' || type === 'text') {
        out.label = 'Платёжная система';
      }
      break;
    case 'uploadCollection':
      if (type === 'select') {
        out.label = 'Коллекция загрузок';
        if (!isRecord(out.admin)) {
          out.admin = {};
        }
        out.admin = {
          ...(out.admin as Loose),
          description: 'В какой коллекции загрузок хранить файлы',
        };
      }
      break;
    case 'message':
      if (type === 'richText' && !out.label) {
        out.label = 'Текст';
      }
      break;
    default:
      break;
  }

  /* Описание для upload MIME list */
  if (
    name === 'mimeTypes' &&
    type === 'array' &&
    isRecord(out.admin) &&
    typeof out.admin.description === 'string'
  ) {
    out.admin = {
      ...(out.admin as Loose),
      description:
        'Ограничение типов файлов (например image/*, application/pdf). Пусто — все типы разрешены.',
    };
  }
  if (
    name === 'maxFileSize' &&
    type === 'number' &&
    (!out.admin ||
      (isRecord(out.admin) && typeof out.admin.description === 'string' && String(out.admin.description).includes('bytes')))
  ) {
    if (!isRecord(out.admin)) {
      out.admin = {};
    }
    out.admin = {
      ...(out.admin as Loose),
      description: 'Максимальный размер файла в байтах. Пусто — без ограничения.',
    };
  }
}

function translateConfirmationOptions(field: Loose): void {
  if (field.name !== 'confirmationType' || field.type !== 'radio') return;
  if (!Array.isArray(field.options)) return;
  field.options = field.options.map((opt) => {
    if (!isRecord(opt)) return opt;
    const o = cloneFieldNode(opt) as Loose;
    const value = o.value;
    if (value === 'message') o.label = 'Сообщение';
    if (value === 'redirect') o.label = 'Редирект';
    return o;
  });
}

function translateRedirectInternals(field: Loose): void {
  if (field.name !== 'redirect' || field.type !== 'group') return;
  field.label = 'Редирект после отправки';

  const fields = Array.isArray(field.fields) ? field.fields : [];
  field.fields = fields.map((nested) =>
    translateFormFieldRecursiveInternal(nested, { depth: 'redirect' }),
  );
}

/** Опции внутри блока Payment (перевод по value при совпадении). */
function translatePaymentSelectOptions(optionList: unknown): unknown {
  if (!Array.isArray(optionList)) return optionList;
  return optionList.map((opt) => {
    if (!isRecord(opt)) return opt;
    const o = cloneFieldNode(opt) as Loose;
    const value = o.value;
    const map: Record<string, string> = {
      hasValue: 'Любое значение',
      equals: 'Равно',
      notEquals: 'Не равно',
      add: 'Плюс',
      subtract: 'Минус',
      multiply: 'Умножить',
      divide: 'Разделить',
      static: 'Фиксированное значение',
      valueOfField: 'Из другого поля',
    };
    if (typeof value === 'string' && map[value]) {
      o.label = map[value];
    }
    return o;
  });
}

function translateNestedByContext(out: Loose, ctx: TranslateContext): void {
  const name = typeof out.name === 'string' ? out.name : undefined;
  const type = typeof out.type === 'string' ? out.type : undefined;

  if (ctx.depth === 'redirect') {
    if (name === 'type' && type === 'radio' && Array.isArray(out.options)) {
      out.label = 'Тип ссылки';
      out.options = out.options.map((opt) => {
        if (!isRecord(opt)) return opt;
        const o = cloneFieldNode(opt) as Loose;
        if (o.value === 'reference') o.label = 'Внутренняя ссылка';
        if (o.value === 'custom') o.label = 'Свой URL';
        return o;
      });
      return;
    }
    if (name === 'reference' && type === 'relationship') {
      out.label = 'Документ для ссылки';
      return;
    }
    if (name === 'url' && type === 'text') {
      out.label = 'URL перехода';
      return;
    }
  }

  if (ctx.depth === 'emails') {
    if (name === 'emailTo') {
      out.label = 'Кому';
      return;
    }
    if (name === 'cc') {
      out.label = 'Копия';
      return;
    }
    if (name === 'bcc') {
      out.label = 'Скрытая копия';
      return;
    }
    if (name === 'replyTo') {
      out.label = 'Ответить на (Reply-To)';
      return;
    }
    if (name === 'emailFrom') {
      out.label = 'Отправитель';
      return;
    }
    if (name === 'subject' && type === 'text') {
      out.label = 'Тема';
      out.defaultValue = 'Новое сообщение с сайта';
      return;
    }
    if (name === 'message' && type === 'richText') {
      out.label = 'Текст письма';
      if (!isRecord(out.admin)) {
        out.admin = {};
      }
      out.admin = {
        ...(out.admin as Loose),
        description: 'Текст письма, которое отправляется этому получателю.',
      };
      return;
    }
  }
}

type TranslateContext = {
  depth: 'top' | 'redirect' | 'emails' | 'block';
  /** Slug блока в fields (select, checkbox, …) — нужен для подписей `options`. */
  blockSlug?: string;
};

function translatePaymentExtras(input: unknown): Field {
  if (!isRecord(input)) return input as Field;
  const out = cloneFieldNode(input) as Loose;
  const name = typeof out.name === 'string' ? out.name : undefined;
  const type = typeof out.type === 'string' ? out.type : undefined;

  translateCommonFieldLabel(out);

  if (name === 'condition' && type === 'select') {
    out.label = 'Условие';
    out.options = translatePaymentSelectOptions(out.options) as Loose[];
  }
  if (name === 'operator' && type === 'select') {
    out.label = 'Операция';
    out.options = translatePaymentSelectOptions(out.options) as Loose[];
  }
  if (name === 'valueType' && type === 'radio') {
    out.label = 'Тип значения';
    out.options = translatePaymentSelectOptions(out.options) as Loose[];
    return out as unknown as Field;
  }
  if ((name === 'valueForCondition' || name === 'valueForOperator') && type === 'text') {
    out.label = 'Значение';
  }
  if (name === 'fieldToUse' && type === 'text') {
    out.label = 'Поле';
  }
  if (name === 'basePrice' && type === 'number') {
    out.label = 'Базовая цена';
  }
  return out as unknown as Field;
}

function translateFormFieldRecursiveInternal(input: unknown, ctx: TranslateContext): Field {
  if (!isRecord(input)) return input as Field;

  const out = cloneFieldNode(input) as Loose;
  const name = typeof out.name === 'string' ? out.name : undefined;
  const type = typeof out.type === 'string' ? out.type : undefined;

  if (ctx.depth === 'top') {
    if (name === 'title' && type === 'text') {
      out.label = 'Заголовок';
    }
    if (name === 'fields' && type === 'blocks') {
      out.label = 'Поля формы';
      if (Array.isArray(out.blocks)) {
        out.blocks = out.blocks.map((block) => translateBlock(block as Loose));
      }
    }
    if (name === 'submitButtonLabel' && type === 'text') {
      out.label = 'Текст кнопки отправки';
    }
    if (name === 'confirmationType' && type === 'radio') {
      out.label = 'Тип подтверждения';
      if (!isRecord(out.admin)) {
        out.admin = {};
      }
      out.admin = {
        ...(out.admin as Loose),
        description:
          'Показывать сообщение на странице или перенаправить пользователя после отправки формы.',
      };
      translateConfirmationOptions(out);
    }
    if (name === 'confirmationMessage' && type === 'richText') {
      out.label = 'Сообщение благодарности';
    }
    if (name === 'redirect') {
      translateRedirectInternals(out);
    }
    if (name === 'emails' && type === 'array') {
      out.label = 'Email-уведомления';
      if (!isRecord(out.admin)) {
        out.admin = {};
      }
      out.admin = {
        ...(out.admin as Loose),
        description:
          'Отправка писем при отправке формы. Адресаты через запятую. Подстановка значений полей: двойные фигурные скобки, например {{firstName}}. {{*}} — все данные, {{*:table}} — таблица HTML.',
      };
      if (Array.isArray(out.fields)) {
        out.fields = out.fields.map((row) =>
          translateFormFieldRecursiveInternal(row, { depth: 'emails' }),
        );
      }
    }
    translateNestedByContext(out, ctx);
    translateCommonFieldLabel(out);
  } else if (ctx.depth === 'redirect' || ctx.depth === 'emails') {
    if (type === 'row' && Array.isArray(out.fields)) {
      out.fields = out.fields.map((f) =>
        translateFormFieldRecursiveInternal(f, { depth: ctx.depth }),
      );
    } else {
      translateNestedByContext(out, ctx);
      translateCommonFieldLabel(out);
    }
  } else if (ctx.depth === 'block') {
    translateCommonFieldLabel(out);

    if (name === 'options' && type === 'array') {
      if (Array.isArray(out.fields)) {
        const slug = ctx.blockSlug;
        out.labels = { plural: 'Варианты', singular: 'Вариант' };
        if (slug === 'select') {
          out.label = 'Варианты выпадающего списка';
        } else if (slug === 'radio') {
          out.label = 'Варианты переключателя';
        } else if (!out.label || typeof out.label !== 'string') {
          out.label = 'Варианты';
        }
        out.fields = out.fields.map((f) =>
          translateFormFieldRecursiveInternal(f, {
            depth: 'block',
            blockSlug: slug,
          }),
        );
      }
    }
    if (type === 'row' && Array.isArray(out.fields)) {
      out.fields = out.fields.map((f) =>
        translateFormFieldRecursiveInternal(f, {
          depth: 'block',
          blockSlug: ctx.blockSlug,
        }),
      );
    }
    if (name === 'priceConditions' && type === 'array') {
      out.label = 'Условия цены';
      out.labels = { plural: 'Условия', singular: 'Условие' };
      if (Array.isArray(out.fields)) {
        out.fields = out.fields.map((f) => translatePaymentExtras(f));
      }
    }

    /* Вложенные array внутри блока upload */
    if (name === 'mimeTypes' && type === 'array' && Array.isArray(out.fields)) {
      out.fields = out.fields.map((f) =>
        translateFormFieldRecursiveInternal(f, {
          depth: 'block',
          blockSlug: ctx.blockSlug,
        }),
      );
    }
  }

  if (ctx.depth === 'top' && !(name === 'redirect' && type === 'group')) {
    if (type === 'row' && Array.isArray(out.fields)) {
      out.fields = out.fields.map((f) => translateFormFieldRecursiveInternal(f, { depth: 'top' }));
    }
  }

  return out as unknown as Field;
}

function translateBlock(block: Loose): Loose {
  const b = cloneFieldNode(block) as Loose;
  const slug = typeof b.slug === 'string' ? b.slug : '';
  const lbl = BLOCK_LABELS[slug];
  if (lbl) {
    b.labels = { singular: lbl.singular, plural: lbl.plural };
  }
  if (Array.isArray(b.fields)) {
    b.fields = b.fields.map((f) =>
      translateFormFieldRecursiveInternal(f, { depth: 'block', blockSlug: slug }),
    );
  }
  return b;
}

/** Применить русские подписи ко всем полям коллекции forms */
export function applyRussianFormLabels(defaultFields: Field[]): Field[] {
  return defaultFields.map((f) => translateFormFieldRecursiveInternal(f, { depth: 'top' }));
}

function translateRussianPaymentSubmissionGroup(group: Loose): void {
  if (group.type !== 'group' || group.name !== 'payment') return;
  group.label = 'Платёж';
  if (!Array.isArray(group.fields)) return;

  group.fields = group.fields.map((sub: unknown) => {
    if (!isRecord(sub)) return sub;
    const s = cloneFieldNode(sub) as Loose;
    const n = typeof s.name === 'string' ? s.name : undefined;
    const t = typeof s.type === 'string' ? s.type : undefined;
    if (n === 'field' && t === 'text') {
      s.label = 'Идентификатор поля';
    }
    if (n === 'status' && t === 'text') {
      s.label = 'Статус';
    }
    if (n === 'amount' && t === 'number') {
      s.label = 'Сумма (коп.)';
      if (!isRecord(s.admin)) {
        s.admin = {};
      }
      s.admin = {
        ...(s.admin as Loose),
        description: 'Сумма в минимальных единицах валюты (копейки).',
      };
    }
    if (n === 'paymentProcessor' && t === 'text') {
      s.label = 'Платёжная система';
    }
    if (n === 'creditCard' && t === 'group') {
      s.label = 'Банковская карта';
      if (Array.isArray(s.fields)) {
        s.fields = s.fields.map((inner: unknown) => {
          if (!isRecord(inner)) return inner;
          const i = cloneFieldNode(inner) as Loose;
          const iname = typeof i.name === 'string' ? i.name : undefined;
          if (iname === 'token') {
            i.label = 'Токен';
          }
          if (iname === 'brand') {
            i.label = 'Платёжная система (бренд)';
          }
          if (iname === 'number') {
            i.label = 'Номер';
          }
          return i;
        });
      }
    }
    return s;
  });
}

function translateSubmissionField(input: unknown): Field {
  if (!isRecord(input)) return input as Field;
  const field = cloneFieldNode(input) as Loose;
  const name = typeof field.name === 'string' ? field.name : undefined;

  if (name === 'form') {
    field.label = 'Форма';
    return field as unknown as Field;
  }

  if (name === 'submissionData') {
    field.label = 'Данные заявки';
    field.labels = { plural: 'Строки данных', singular: 'Строка' };
    if (Array.isArray(field.fields)) {
      field.fields = field.fields.map((sub) => {
        if (!isRecord(sub)) return sub;
        const s = cloneFieldNode(sub) as Loose;
        const sn = typeof s.name === 'string' ? s.name : undefined;
        const st = typeof s.type === 'string' ? s.type : undefined;
        if (sn === 'field' && st === 'text') {
          s.label = 'Поле';
        }
        if (sn === 'value' && (st === 'textarea' || st === 'text')) {
          s.label = 'Значение';
        }
        return s;
      });
    }
    return field as unknown as Field;
  }

  if (name === 'submissionUploads') {
    field.label = 'Загруженные файлы';
    field.labels = { singular: 'Группа файлов', plural: 'Файлы' };
    if (Array.isArray(field.fields)) {
      field.fields = field.fields.map((sub) => {
        if (!isRecord(sub)) return sub;
        const s = cloneFieldNode(sub) as Loose;
        if (typeof s.name === 'string' && s.name === 'field') {
          s.label = 'Поле';
        }
        if (typeof s.name === 'string' && s.name === 'value') {
          s.label = 'Файлы';
        }
        return s;
      });
    }
    return field as unknown as Field;
  }

  if (name === 'payment') {
    translateRussianPaymentSubmissionGroup(field);
    return field as unknown as Field;
  }

  return field as unknown as Field;
}

/** Применить русские подписи к коллекции form-submissions */
export function applyRussianSubmissionLabels(defaultFields: Field[]): Field[] {
  return defaultFields.map(translateSubmissionField);
}
