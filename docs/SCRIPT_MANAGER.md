# Script Manager — централизованное управление сторонними скриптами

Техническое задание и план реализации системы управления сторонними HTML/JS‑вставками
(Яндекс.Метрика, Google Tag Manager, пиксели соцсетей, чат‑виджеты) через админку Payload CMS.

Документ полностью основан на согласованном техническом решении и готов к передаче разработчику.

---

## 0. Цель и контекст

Администратор должен иметь возможность:

1. Добавлять произвольные блоки кода (вставлять «как есть» из инструкции сервиса).
2. Выбирать точку вставки на странице через выпадающий список:
   `head_open`, `head_close`, `body_open`, `body_close`.
3. Включать/выключать скрипт без удаления (поле `isActive`).
4. Давать скрипту понятное название для удобства управления.

Технические требования: нулевое влияние на TTFB (кэширование), корректная инвалидация
кэша при изменениях, совместимость с Next.js 15 (App Router) и React 19.

**Важно про БД:** адаптер `sqliteAdapter` настроен с `push: false` и `prodMigrations`
(см. `payload.config.ts`). Любое изменение схемы (новая коллекция) требует
сгенерированной миграции — см. чеклист, этап 6.

---

## 1. Структура данных — коллекция `Scripts`

Выбрана **Collection** (а не Global): администратору нужно произвольное число независимых
записей, каждая со своим `location` и `isActive`. Global подходит для единичного объекта
с фиксированным набором полей.

**Файл:** `src/payload/collections/Scripts.ts`

| Поле | Тип Payload | Обязательность | Назначение |
|------|-------------|----------------|------------|
| `name` | `text` | required | Название для админки («Яндекс.Метрика», «GTM») |
| `location` | `select` | required, default `body_close` | Точка вставки: `head_open` / `head_close` / `body_open` / `body_close` |
| `code` | `code` (`admin.language: 'html'`) | required | Сырой HTML/JS блок |
| `isActive` | `checkbox` | default `false` | Включение/выключение без удаления |

Настройки коллекции:

- `slug`: `scripts` (экспортировать как `SCRIPTS_COLLECTION_SLUG`).
- `admin.group`: `PAYLOAD_ADMIN_GROUPS.system` (секция «Администрирование»).
- `admin.useAsTitle`: `name`; `admin.defaultColumns`: `['name', 'location', 'isActive']`.
- `access`: `read: () => true`; `create/update/delete: ({ req }) => Boolean(req.user)`
  (тот же паттерн, что в `Categories`, `Image`, `Video`).

### Эталонный конфиг

```ts
import type { CollectionConfig } from 'payload';
import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';
import { revalidateScriptsAfterChange, revalidateScriptsAfterDelete } from '../hooks/revalidate';

export const SCRIPTS_COLLECTION_SLUG = 'scripts';

export const SCRIPT_LOCATIONS = [
  { label: 'В начало <head> (head_open)', value: 'head_open' },
  { label: 'В конец <head> (head_close)', value: 'head_close' },
  { label: 'В начало <body> (body_open)', value: 'body_open' },
  { label: 'В конец <body> (body_close)', value: 'body_close' },
] as const;

export type ScriptLocation = (typeof SCRIPT_LOCATIONS)[number]['value'];

export const Scripts: CollectionConfig = {
  slug: SCRIPTS_COLLECTION_SLUG,
  labels: { singular: 'Скрипт / вставка', plural: 'Скрипты и вставки' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.system,
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'isActive'],
    description: 'Сторонние скрипты и HTML-вставки (Метрика, GTM, пиксели, виджеты).',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название (для админки)',
      admin: { description: 'Понятное имя: «Яндекс.Метрика», «GTM», «Пиксель VK».' },
    },
    {
      name: 'location',
      type: 'select',
      required: true,
      defaultValue: 'body_close',
      options: [...SCRIPT_LOCATIONS],
      label: 'Место вставки',
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      label: 'Код (HTML/JS)',
      admin: { language: 'html', description: 'Вставьте блок целиком, как из инструкции сервиса.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      label: 'Активен',
    },
  ],
  hooks: {
    afterChange: [revalidateScriptsAfterChange],
    afterDelete: [revalidateScriptsAfterDelete],
  },
};
```

> `defaultValue: false` у `isActive` — безопасный дефолт: непроверенный код не попадёт
> в прод до явного включения.

### Регистрация

В `payload.config.ts` добавить импорт и зарегистрировать в массиве `collections`.
Порядок регистрации задаёт порядок внутри группы сайдбара:

```ts
import { Scripts } from './src/payload/collections/Scripts';
// ...
collections: [Pages, Categories, Products, Image, Video, Scripts, Users],
```

---

## 2. Серверная логика и кэширование

**Файл:** `src/lib/scripts.server.ts`

Повторяет паттерн из `src/lib/contact.server.ts`:

- `unstable_cache` — межзапросный кэш с тегом `scripts` и `revalidate: 300` (страховка
  на случай пропущенной инвалидации). Тег `scripts` сбрасывается хуками коллекции.
- React `cache` — дедупликация внутри одного SSR‑запроса: четыре `<SiteScripts>`
  в layout сделают **один** запрос к БД/кэшу.
- `server-only` — защита от случайного импорта в клиентский бандл.
- Группировка по `location` и `catch → []`: сбой CMS не должен ронять layout.

```ts
import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SCRIPTS_COLLECTION_SLUG, type ScriptLocation } from '@/payload/collections/Scripts';

export type SiteScript = {
  id: string | number;
  name: string;
  code: string;
  location: ScriptLocation;
};

async function fetchActiveScripts(): Promise<SiteScript[]> {
  const p = await getPayload({ config });
  const res = await p.find({
    collection: SCRIPTS_COLLECTION_SLUG,
    where: { isActive: { equals: true } },
    depth: 0,
    limit: 100,
    pagination: false,
    overrideAccess: true,
  });
  return res.docs as unknown as SiteScript[];
}

/** Межзапросный кэш; сбрасывается тегом 'scripts' из revalidate-хуков. */
const loadActiveScriptsCached = unstable_cache(fetchActiveScripts, ['site-scripts'], {
  revalidate: 300,
  tags: ['scripts'],
});

/** Один запрос на SSR-рендер; результат сгруппирован по точке вставки. */
export const loadScriptsByLocation = cache(async () => {
  const docs = await loadActiveScriptsCached().catch(() => [] as SiteScript[]);
  const groups: Record<ScriptLocation, SiteScript[]> = {
    head_open: [],
    head_close: [],
    body_open: [],
    body_close: [],
  };
  for (const d of docs) {
    if (groups[d.location]) groups[d.location].push(d);
  }
  return groups;
});
```

**Влияние на TTFB:** в большинстве запросов данные берутся из кэша; обращение к БД —
максимум раз в 5 минут или сразу после правки в админке (через инвалидацию тега).

---

## 3. Интеграция в Layout (Next.js 15 / React 19)

### Ключевые особенности, которые учитываем

1. **`<head>` в root‑layout рендерить можно** — это документированный валидный способ
   добавлять произвольные элементы (для `<meta>`/`<title>` по‑прежнему используется
   Metadata API).
2. **React 19 НЕ поднимает (hoist) инлайн‑скрипты** из `dangerouslySetInnerHTML` —
   они остаются ровно там, где отрендерены. Для нас это плюс: позиция в JSX = позиция в DOM.
3. **`<div>`‑обёртку нельзя ставить внутри `<head>`**: HTML‑парсер по спецификации
   закрывает `<head>` на первом «телесном» теге и выкидывает `<div>` в `<body>`.
   А `dangerouslySetInnerHTML` требует host‑элемент.

Отсюда — **разные обёртки для головы и тела**.

### Компонент `SiteScripts`

**Файл:** `src/components/SiteScripts.tsx` (Server Component)

```tsx
import { loadScriptsByLocation } from '@/lib/scripts.server';
import type { ScriptLocation } from '@/payload/collections/Scripts';

export default async function SiteScripts({ location }: { location: ScriptLocation }) {
  const groups = await loadScriptsByLocation();
  const items = groups[location];
  if (!items?.length) return null;

  const inHead = location === 'head_open' || location === 'head_close';

  return (
    <>
      {items.map((s) =>
        inHead ? (
          // <head>: один <script> на запись — валидный потомок head
          <script key={s.id} dangerouslySetInnerHTML={{ __html: s.code }} />
        ) : (
          // <body>: div с display:contents безопасно отдаёт весь блок (script + noscript)
          <div
            key={s.id}
            style={{ display: 'contents' }}
            dangerouslySetInnerHTML={{ __html: s.code }}
          />
        )
      )}
    </>
  );
}
```

### Правила для содержимого поля `code`

- **`body_open` / `body_close`** — можно вставлять **блок целиком**
  (`<script>…</script>` + `<noscript>…</noscript>`), как из инструкции сервиса.
- **`head_open` / `head_close`** — кладётся **тело скрипта без внешнего `<script>`‑тега**
  (обёртка `<script>` добавляется компонентом). `<noscript>`‑фолбэк Метрики/GTM по
  спецификации живёт в `<body>` — его помещают в `body_open`.

Для Яндекс.Метрики и GTM это полностью рабочий сценарий: оба официально поддерживают
размещение в `<body>`, а `<noscript>`‑часть GTM обязана быть в начале `<body>`.

### Подключение в `src/app/(site)/layout.tsx`

Внутри `SiteLayout` добавить явный `<head>` и расставить компонент в 4 точках:

```tsx
import SiteScripts from '@/components/SiteScripts';

// ...
return (
  <html lang="ru" className={`${playfair.variable} ${inter.variable} ${disruptorScript.variable}`}>
    <head>
      <SiteScripts location="head_open" />
      {/* остальное содержимое head Next добавит через Metadata API */}
      <SiteScripts location="head_close" />
    </head>
    <body className="antialiased min-h-screen">
      <SiteScripts location="body_open" />
      <AppLoader />
      {children}
      <ContactMessengerFab whatsappHref={whatsappHref} />
      <SiteScripts location="body_close" />
    </body>
  </html>
);
```

> Благодаря React `cache` все четыре вызова используют один результат `loadScriptsByLocation`.

**Почему `dangerouslySetInnerHTML`, а не `next/script`:** `next/script` берёт на себя
стратегию загрузки и не позволяет вставить произвольный сырой блок (с `<noscript>`,
несколькими тегами). Прямая вставка отдаёт код «как есть» в начальный SSR‑HTML — теги
видны сразу. XSS‑риск приемлем: писать в коллекцию могут только авторизованные
администраторы (доверенный ввод, как любой код в CMS).

---

## 4. Механизм инвалидации кэша

**Файл:** `src/payload/hooks/revalidate.ts`

Добавить два экспортируемых хука по образцу существующих фабрик
(`makeRevalidateAfterChange` / `makeRevalidateAfterDelete`):

```ts
export const revalidateScriptsAfterChange = makeRevalidateAfterChange(['scripts'], ['/']);
export const revalidateScriptsAfterDelete = makeRevalidateAfterDelete(['scripts'], ['/']);
```

- Тег `scripts` совпадает с тегом в `unstable_cache` (`src/lib/scripts.server.ts`) —
  при любом создании/изменении/удалении записи кэш сбрасывается мгновенно.
- `revalidatePath('/')` обновляет layout‑дерево.
- Хуки подключаются в коллекции `Scripts` (`hooks.afterChange`, `hooks.afterDelete`),
  см. раздел 1.

---

## 5. Чеклист реализации (Implementation Checklist)

### Этап 1 — Коллекция
- [ ] Создать `src/payload/collections/Scripts.ts` (раздел 1).
- [ ] Экспортировать `SCRIPTS_COLLECTION_SLUG`, `SCRIPT_LOCATIONS`, `ScriptLocation`.

### Этап 2 — Инвалидация
- [ ] Добавить `revalidateScriptsAfterChange` / `revalidateScriptsAfterDelete`
      в `src/payload/hooks/revalidate.ts`.
- [ ] Подключить хуки в коллекции `Scripts`.

### Этап 3 — Регистрация
- [ ] Импортировать и добавить `Scripts` в массив `collections` в `payload.config.ts`.

### Этап 4 — Серверная логика
- [ ] Создать `src/lib/scripts.server.ts` с `unstable_cache` (тег `scripts`) + React `cache`
      (раздел 2).

### Этап 5 — Layout
- [ ] Создать `src/components/SiteScripts.tsx` (раздел 3).
- [ ] Обновить `src/app/(site)/layout.tsx`: добавить `<head>` и 4 точки вставки.

### Этап 6 — Типы и миграция БД
- [ ] Перегенерировать типы: `npm run generate:types` (обновит `src/payload-types.ts`,
      добавит `scripts` в `Config['collections']`).
- [ ] Сгенерировать миграцию (адаптер с `push: false`):
      `npm run payload migrate:create` → проверить файл в `src/payload/migrations/`.
- [ ] Применить локально: `npm run payload migrate`.

### Этап 7 — Сборка и проверка
- [ ] `npm run lint` и `npm run build` — без ошибок.
- [ ] Прогнать QA из раздела 6.

> Точные имена npm‑скриптов сверить с `package.json`; команды Payload запускаются как
> `npx payload <cmd>`, если отдельных скриптов нет.

---

## 6. Методика проверки (QA)

### 6.1 Корректность вставки в DOM
- [ ] Создать запись Метрики (`location = body_close`, `isActive = true`) — целый блок
      `<script>…</script><noscript>…</noscript>`. Проверить в **View Source** (не DevTools!),
      что код присутствует в исходном SSR‑HTML.
- [ ] Запись с `location = head_open` (тело скрипта без `<script>`): убедиться, что в
      `<head>` появился `<script>…</script>` в нужной позиции.
- [ ] Проверить все четыре точки: `head_open`, `head_close`, `body_open`, `body_close` —
      элементы стоят в ожидаемом месте, `<head>` не «схлопывается» (нет утечки `<div>` в body).
- [ ] Проверить выполнение: для Метрики — счётчик появился в кабинете / `window.ym` определён.

### 6.2 Работа `isActive`
- [ ] Снять галочку `isActive` → после ревалидации код исчезает из HTML.
- [ ] Вернуть галочку → код снова появляется. Удаление записи также убирает код.

### 6.3 Отсутствие дублирования запросов к БД
- [ ] В dev‑режиме добавить временный `console.log` в `fetchActiveScripts` и открыть страницу:
      при 4 вызовах `<SiteScripts>` лог должен сработать **один раз** (React `cache`).
- [ ] Повторный заход в течение `revalidate`‑окна — без обращения к БД (`unstable_cache`).

### 6.4 Инвалидация и TTFB
- [ ] Изменить запись в админке → на сайте изменения видны без ручного перезапуска
      (сработал тег `scripts`).
- [ ] Замерить TTFB `/` до и после внедрения — без заметной деградации.

### 6.5 Регрессия
- [ ] Метаданные/SEO в `<head>` (Metadata API) не сломаны соседством с ручным `<head>`.
- [ ] При пустой коллекции / отключённых скриптах layout рендерится без ошибок
      (`SiteScripts` возвращает `null`).

