# Бэклог улучшений проекта yaninav.com

Сводка находок аудита кода и инфраструктуры репозитория. Документ предназначен для обсуждения с командой: по каждому пункту принимается решение (сделать сейчас / отложить / не делать) и обновляются поля **Статус** и **Решение команды**.

**Дата аудита:** 2026-04-30  
**Дополнительный аудит Payload CMS:** 2026-05-02  
**Стек:** Next.js 15, React 19, Tailwind 4, Payload CMS v3 + SQLite (каталог), динамический рендер публичных страниц каталога через Local API.

---

## Легенда

### Статусы

| Статус | Смысл |
|--------|--------|
| **Open** | Не обсуждено / ждёт решения |
| **Discussion** | Обсуждается |
| **Decided** | Решение принято, работа не начата |
| **In Progress** | В работе |
| **Done** | Сделано или осознанно отклонено (с пояснением в «Решении») |

### Приоритеты

| Приоритет | Смысл |
|-----------|--------|
| **Critical** | Риск для бизнеса, безопасности, продакшена или сильное раздувание репо |
| **Important** | SEO, UX, репутация (шаринг, поисковики) |
| **Architecture** | Техдолг, проявится при росте или миграции (CMS, каталог) |
| **Nice-to-have** | Качество инженерной культуры, не блокирует релизы |

---

## Содержание

- [Критично](#критично)
  - [B-01](#b-01-изображения-оригиналы-в-repo-и-большой-объём-publicimages) — Изображения: оригиналы в repo и большой объём `public/images`
  - [B-02](#b-02-форма-обратной-связи-ничего-не-отправляет) — Форма обратной связи ничего не отправляет
  - [B-03](#b-03-главная-и-ещё-страницы-целиком-use-client) — Главная (и ещё страницы) целиком `'use client'`
  - [B-24](#b-24-production-hardening-payload-api-и-секретов) — Production hardening Payload API и секретов
- [Важно — SEO / UX](#важно--seo--ux)
  - [B-09](#b-09-нет-единого-ог-image--twitter-card-в-metadata) — Нет единого OG-image / Twitter card в metadata
  - [B-18](#b-18-внешние-уведомления-o-form-submissions-telegramsmtp) — Внешние уведомления о form-submissions (Telegram/SMTP)
  - [B-25](#b-25-cms-страницы-и-metadata-не-полностью-попадают-в-sitemap-и-seo) — CMS-страницы и metadata не полностью попадают в sitemap и SEO
  - [B-31](#b-31-нет-structured-data-для-rich-results) — Нет structured data для rich results
- [Архитектура — техдолг](#архитектура--техдолг)
  - [B-10](#b-10-логика-категорий-else-if-по-подстрокам) — Логика категорий: `else if` по подстрокам
  - [B-20](#b-20-управление-блоком-воспоминания-через-payload) — Управление блоком «Воспоминания» через Payload
  - [B-21](#b-21-управление-hero-видео-через-payload) — Управление Hero-видео через Payload
  - [B-22](#b-22-управление-блоком-философия-бренда-через-payload) — Управление блоком «Философия бренда» через Payload
  - [B-23](#b-23-миграции-payloadsqlite-вместо-push-схемы) — Миграции Payload/SQLite вместо push-схемы
  - [B-26](#b-26-локализация-ru-и-en-включена-но-сайт-читает-только-ru) — Локализация ru и en включена, но сайт читает только ru
  - [B-27](#b-27-каталог-зависит-от-populated-relations-и-жёстких-лимитов) — Каталог зависит от populated relations и жёстких лимитов
  - [B-28](#b-28-эксплуатация-payload-и-sqlite-после-миграций) — Эксплуатация Payload и SQLite после миграций
  - [B-30](#b-30-всё-публичное-cms-читается-force-dynamic-без-стратегии-кэша) — Всё публичное CMS читается force-dynamic без стратегии кэша
- [Менее критично](#менее-критично)
  - [B-13](#b-13-нет-ci) — Нет CI
  - [B-14](#b-14-нет-тестов) — Нет тестов
  - [B-15](#b-15-readme-устарел-относительно-реальной-структуры) — README устарел относительно реальной структуры
  - [B-16](#b-16-зависимость-react-icons) — Зависимость `react-icons`
  - [B-17](#b-17-логирование-ошибок-видео-и-мониторинг) — Логирование ошибок видео и мониторинг
  - [B-19](#b-19-загрузка-файла-в-форме-обратной-связи) — Загрузка файла в форме обратной связи
  - [B-29](#b-29-сиды-и-cms-дедуп-пока-хрупкие) — Сиды и CMS-дедуп пока хрупкие
- [История решений](#история-решений)

---

## Критично

### B-01. Изображения: оригиналы в repo и большой объём `public/images`

- **Статус:** Done — частично (рабочее дерево очищено, история git не переписана)
- **Приоритет:** Critical
- **Категория:** Performance / DX / Infra

**Что нашли:** В `public/images/products/` лежали пары файлов на товар — полноразмерные `DSC_*.jpg` (~10–15 МБ каждый) и версии `_small.jpg` (~80 КБ). В UI для превью использовались только `_small` (логика была в `src/utils/products.ts`, сейчас URL картинок отдаёт Payload / коллекция `media`).

Каталог перенесён в Payload: файлы превью живут в volume `data/media` (репозиторий не хранит ни JSON, ни `public/images/products/`).

**Почему это важно:** Долгое время CI/CD и деплоя, дорогий трафик, риск упереться в лимиты хостинга. История Git может сохранять блобы даже после удаления файлов — может понадобиться очистка истории (`git filter-repo` / BFG).

**Предлагаемый подход:**
- Вынести оригиналы из репозитория в объектное хранилище (S3‑совместимое) или хранить только локально у заказчика.
- Если оригиналы не нужны на сайте — удалить их из дерева файлов и при необходимости переписать историю.
- Для Retina: рассмотреть промежуточный размер (например `_medium`) вместо или вместе с `_small`, не светя 15 МБ на пользователя.

**Решение команды:**  
Оригиналы (`DSC_*.jpg`) удалены из рабочего дерева; превью исторически были в `public/images/products/` (~8.9 МБ). После внедрения Payload превью загружаются в коллекцию `media` (`data/media` на диске/volume). История git по-прежнему может содержать старые блобы — при необходимости `git filter-repo` / BFG. Оригиналы хранить отдельно (S3 / локально у заказчика).

---

### B-02. Форма обратной связи ничего не отправляет

- **Статус:** Done — частично (хранение в Payload; без внешних уведомлений и без файла — см. **B-18**, **B-19**)
- **Приоритет:** Critical
- **Категория:** Bug / Product

**Что нашли (аудит до 2026-04-30):** Отправка формы только сбрасывала состояние, данные никуда не уходили (см. старый код в [`Contact.tsx`](../src/components/Contact.tsx)).

**Почему это важно:** Пользователь считает, что сообщение отправлено; лиды теряются. Ранее в форме было поле прикрепления файла — **в текущей реализации главной убрано** (плагин Form Builder не поддерживает upload без отдельной доработки; возврат — **B-19**).

**Предлагаемый подход (частично сделано):**
- Встроенный Form Builder в Payload + записи в коллекции **`form-submissions`**; публичный `POST /api/form-submissions`.
- Внешние каналы (SMTP / Resend / Telegram) — **не настроены**, отдельный пункт **B-18**.
- Спам‑защита и hardening публичного `create`: honeypot, rate limit, Turnstile — отдельный пункт **B-24**.

**Решение команды:**  
Подключён `@payloadcms/plugin-form-builder` ([`payload.config.ts`](../payload.config.ts)). Схема формы с slug `contact`: [`docs/contact-form-setup.md`](../docs/contact-form-setup.md), идемпотентное заполнение БД — **`npm run seed:contact-form`** (нужны `PAYLOAD_SECRET` и `DATABASE_URI`). Сервер: [`src/lib/forms.server.ts`](../src/lib/forms.server.ts) → [`Contact`](../src/components/Contact.tsx) → клиент [`ContactForm`](../src/components/ContactForm.tsx) (динамический рендер полей + согласие с политиками). Лиды смотреть в **`/admin/collections/form-submissions`**. Внешняя доставка — **B-18**; прикрепление файла к заявке — **B-19**.

---

### B-03. Главная (и ещё страницы) целиком `'use client'`

- **Статус:** Done (частично — см. **Что осталось на потом** ниже)
- **Приоритет:** Critical
- **Категория:** SEO / Performance / Architecture

**Что нашли (состояние на дату аудита, до 2026-04-30):** Корень приложения для главной был помечен как клиентский компонент (`'use client'` в историческом `src/app/page.tsx`; после route group файл живёт как [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx)).

Аналогично исторические `src/app/collection/page.tsx` и `src/app/favorites/page.tsx` сейчас соответствуют [`src/app/(site)/collection/page.tsx`](../src/app/(site)/collection/page.tsx) и [`src/app/(site)/favorites/page.tsx`](../src/app/(site)/favorites/page.tsx).

**Почему это важно:** Меньше серверного HTML при первой отдаче, хуже для SEO‑ботов и LCP по сравнению с тем, когда статичный контент рендерится на сервере. Весь связанный граф может уезжать в клиентский бандл.

**Предлагаемый подход:**
- Оставить страницы **Server Components** по умолчанию.
- Вынести хуки (`useResponsiveCatalogLimit`, `useHashScroll`, фильтры с `useSearchParams`) в маленькие клиентские обёртки и обернуть ими только нужные участки.

**Исправлено (2026-04-30):**
- [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx) — **Server Component**; `Header` и блок каталога в `<Suspense>` (из‑за `useSearchParams` в шапке и клиентского каталога). Логика `useResponsiveCatalogLimit` + `useHashScroll` перенесена в [`src/components/HomeCatalog.tsx`](../src/components/HomeCatalog.tsx) (`'use client'`).
- [`src/app/(site)/collection/page.tsx`](../src/app/(site)/collection/page.tsx) — **Server Component**; `Header` и `Catalog` в `<Suspense>`.
- [`src/app/(site)/favorites/page.tsx`](../src/app/(site)/favorites/page.tsx) — **Server Component**; клиент только в [`FavoritesClient`](../src/components/FavoritesClient.tsx) (чтение избранного из `localStorage` через `useFavoriteIds`).

**Что осталось на потом:**
- Полный перенос загрузки списка товаров на внешний fetch / CMS (сейчас данные пробрасываются с сервера из [`products.server`](../src/lib/products.server.ts) через props — см. **История решений**, 2026-04-30: Payload + SQLite, **B-10**).
- Сейчас [`Catalog`](../src/components/Catalog.tsx) по‑прежнему целиком клиентский (`usePathname`, `useRouter`, `useSearchParams` для `?category=`) — это осознанный компромисс минимального рефакторинга.

**Решение команды:**  
Минимальные правки по плану B-03: главная, `/collection`, `/favorites` — серверные страницы с клиентскими обёртками там, где нужны хуки; дальнейшая глубина RSC — после CMS.

---

### B-24. Production hardening Payload API и секретов

- **Статус:** Open
- **Приоритет:** Critical
- **Категория:** Security / Ops / CMS

**Что нашли:** После внедрения Payload остались открытые поверхности, которые допустимы в dev, но опасны для production:

- [`src/payload/collections/Users.ts`](../src/payload/collections/Users.ts): `access.create: () => true` разрешает создание пользователей через API. При `auth: true` это нужно явно проверить и закрыть до production, чтобы регистрация админов не была публичной.
- [`payload.config.ts`](../payload.config.ts): `secret: process.env.PAYLOAD_SECRET || 'dev-local-payload-secret-change-me'` оставляет известный fallback для подписи cookies/JWT, если env забыли задать.
- [`payload.config.ts`](../payload.config.ts): `form-submissions` принимают `create: () => true` без rate limit / CAPTCHA / honeypot. Это нужно для публичной формы, но без защиты превращается в канал спама и раздувания БД.
- Публичные коллекции/globals с `read: () => true` доступны через Payload REST/GraphQL API: товары, категории, медиа, страницы и главные globals можно массово выгружать, если не ограничить API surface.
- [`src/app/(payload)/api/graphql-playground/route.ts`](../src/app/(payload)/api/graphql-playground/route.ts) оставляет GraphQL Playground route в приложении; для production нужно решить, отключать ли Playground и introspection.
- В [`Users.ts`](../src/payload/collections/Users.ts) заданы только `read` и `create`; defaults для `update` / `delete` нужно проверить отдельно, чтобы не оставить неожиданные мутации пользователей.
- [`docker-compose.yml`](../docker-compose.yml) задаёт `PAYLOAD_SECRET: ${PAYLOAD_SECRET:-change-me-local-dev-secret}` — это удобно локально, но файл нельзя использовать как production-шаблон без явного override.
- `form-submissions` хранят персональные данные заявок; backlog пока описывает доставку и спам, но не retention/export/delete/backups для этих данных.

**Почему это важно:** Это прямой риск для админ-доступа, сессий, приватности заявок и стабильности SQLite/диска. В отличие от SEO/UX пунктов, такие настройки лучше закрыть до публичного запуска.

**Предлагаемый подход:**
- Закрыть `users.create` для unauthenticated запросов или явно оставить только bootstrap-сценарий первого пользователя, если Payload не покрывает его сам.
- Явно задать `users.update` / `users.delete`, даже если текущие defaults безопасны.
- В production падать при отсутствии `PAYLOAD_SECRET`; dev fallback оставить только под `NODE_ENV !== 'production'`.
- Для формы добавить минимальный антиспам: honeypot + throttling по IP/UA, затем Turnstile или аналог при росте спама.
- Решить, какие публичные REST/GraphQL endpoints действительно нужны сайту; закрыть или rate-limit лишнее, отключить GraphQL Playground в production.
- Зафиксировать политику хранения заявок: срок retention, экспорт, удаление по запросу, попадание в backup.

**Решение команды:**  
_(заполнить после обсуждения)_

---

## Важно — SEO / UX

### B-09. Нет единого OG-image / Twitter card в metadata

- **Статус:** Done — частично (товар, каталог и CMS slug pages покрыты; главная/fallback — см. **B-25**)
- **Приоритет:** Important
- **Категория:** SEO / Marketing

**Что нашли:** В [`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx) в базовом metadata всё ещё есть только `title`, `description`, `type`, `locale` — нет default `openGraph.images` и `twitter` для главной/fallback-страниц.

```28:41:src/app/(site)/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'ЯНИНА В - Ювелирная студия | Эксклюзивные украшения',
  description:
    'Ювелирная студия ЯНИНА В - помолвочные и обручальные кольца, эксклюзивные украшения ручной работы. Индивидуальный подход к каждому клиенту.',
  keywords:
    'ювелирная студия, помолвочные кольца, обручальные кольца, эксклюзивные украшения, ювелирные изделия на заказ',
  openGraph: {
    title: 'ЯНИНА В - Ювелирная студия',
    description: 'Эксклюзивные украшения ручной работы',
    type: 'website',
    locale: 'ru_RU',
  },
};
```

**Почему это важно:** Ссылки на главную в мессенджерах показывают превью без фирменного изображения; для luxury-бренда это заметный минус.

**Предлагаемый подход:**
- Завести одно качественное изображение (1200×630) для главной OG + заполнить `twitter: { card, title, description, images }`.
- На странице товара, каталоге и CMS slug pages `generateMetadata` реализован (см. **История решений**, 2026-05-01: B-06, B-07).

**Решение команды:**  
На странице товара, CMS slug pages и при `?category=` на каталоге в `generateMetadata` заданы `openGraph.images` и `twitter` (`summary_large_image` при наличии картинки) из `meta.image` плагина SEO с резолвом URL медиа, иначе — основное изображение товара / без превью для списков. [`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx): `metadataBase: new URL(NEXT_PUBLIC_SITE_URL)` для корректных абсолютных OG URL. Default OG/Twitter для главной и fallback-страниц остаётся в **B-25**.

---

### B-18. Внешние уведомления о form-submissions (Telegram/SMTP)

- **Статус:** Open
- **Приоритет:** Important
- **Категория:** Product / Ops

**Что:** Заявки с главной попадают в коллекцию **`form-submissions`**, но владельцу **не отправляются** ни письма, ни пуш — только просмотр в `/admin`. В плагине Form Builder возможны email-rules в документе формы и/или конфиг **`payload.email` + SMTP**, либо кастомный хук **`afterChange`** по `form-submissions` для вызова Telegram Bot API или Resend.

**Почему важно:** Без канала уведомлений лиды остаются невидимыми до ручной проверки админки.

**Предлагаемый подход:**
- минимально: Telegram-бот (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` в [.env.example](../.env.example)) из хука;
- альтернатива: Resend/Brevo/SMTP через `payload.config` `email` + шаблоны формы.

**Решение команды:**  
Отложено; связано с частичным закрытием **B-02**. Плейсхолдеры env обновлены под будущую интеграцию.

---

### B-25. CMS-страницы и metadata не полностью попадают в sitemap и SEO

- **Статус:** Open
- **Приоритет:** Important
- **Категория:** SEO / CMS

**Что нашли:** [`src/app/sitemap.ts`](../src/app/sitemap.ts) строит sitemap из фиксированного `staticPaths`, категорий и товаров. Документы коллекции [`pages`](../src/payload/collections/Pages.ts), которые редактор может добавить через Payload, не попадают в sitemap автоматически. Для всех URL сейчас выставляется `lastModified: now`, а не реальный `updatedAt` из Payload.

Отдельно: главная страница использует CMS-глобалы (`hero`, `memories`, `about`), но [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx) не задаёт `generateMetadata`. [`src/app/(site)/favorites/page.tsx`](../src/app/(site)/favorites/page.tsx) тоже наследует общий metadata. Поисковики и соцсети видят общий metadata из [`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx), а не актуальное содержимое страницы.

При этом у CMS slug pages уже есть `generateMetadata` в [`src/app/(site)/[slug]/page.tsx`](../src/app/(site)/[slug]/page.tsx); проблема не в полном отсутствии SEO у `pages`, а в sitemap, `lastModified` и default metadata для главной/favorites.

Ещё один момент для проверки: [`Pages`](../src/payload/collections/Pages.ts) включают drafts, а [`getPageBySlug`](../src/lib/pages.server.ts) читает через Local API с `overrideAccess: true` без явного `_status = published`. Нужно подтвердить, что публичный сайт и `/api/pages` не показывают draft-контент/metadata.

**Почему это важно:** Новые CMS-страницы могут существовать и открываться по URL, но не попадать в карту сайта. Для главной маркетинговый контент может обновляться в админке, а title/description/OG оставаться статичными. `lastModified: now` заставляет поисковики видеть все URL как обновлённые на каждый запрос sitemap.

**Предлагаемый подход:**
- Добавить серверный loader для опубликованных страниц (`slug`, `updatedAt`) и включать их в [`sitemap.ts`](../src/app/sitemap.ts), исключая системные и reserved slug.
- Использовать реальные `updatedAt` для products/categories/pages вместо `new Date()` на все entries.
- Решить, будет ли главная иметь отдельный SEO global или использовать статический metadata. Если нужен CMS-контроль, добавить поля SEO для home/global и `generateMetadata`.
- Добавить явный metadata для `/favorites` или осознанно закрыть страницу от индексации, если она не нужна в поиске.
- Для `pages` проверить, что metadata берётся из `meta` плагина SEO и что canonical совпадает с `/${slug}`.
- Для `pages` явно зафиксировать published-only поведение: фильтр `_status`, access rule или документированная гарантия Payload Local API.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-31. Нет structured data для rich results

- **Статус:** Open
- **Приоритет:** Important
- **Категория:** SEO / Schema.org

**Что нашли:** В проекте нет JSON-LD / structured data для товаров, организации/бренда, сайта или локального бизнеса. Metadata через `generateMetadata` уже закрывает title/description/OG/Twitter для части страниц, но не даёт поисковикам структурированные сущности.

**Почему это важно:** Для jewelry/catalog сайта structured data может помочь поисковикам корректнее понимать товары, бренд, навигацию и контактные данные. Это не гарантирует rich results, но снижает неоднозначность.

**Предлагаемый подход:**
- Для [`src/app/(site)/products/[id]/page.tsx`](../src/app/(site)/products/[id]/page.tsx) добавить `Product` JSON-LD из Payload-данных: name, image, description, price/availability при наличии.
- Для layout/home добавить `Organization` или `LocalBusiness`, `WebSite`, возможно `BreadcrumbList` для product/category pages.
- Не дублировать неподтверждённые данные: если цена «по запросу», не подставлять фейковый `Offer`.

**Решение команды:**  
_(заполнить после обсуждения)_

---

## Архитектура — техдолг

### B-10. Логика категорий: `else if` по подстрокам

- **Статус:** Done
- **Приоритет:** Architecture
- **Категория:** Maintainability

**Что нашли (исторически):** Фильтрация по категории опиралась на эвристики по подстрокам и легаси‑английские slug’и.

**Почему это важно:** Любая правка текста категории в данных могла сломать фильтр; сложно тестировать и расширять.

**Предлагаемый подход:**
- При миграции на CMS: поле «категория» как enum / relation + явный `slug` на товаре.
- До миграции: сузить маппинг до явной таблицы `categoryName → navSlug` без «включает подстроку» где возможно.

**Решение команды:**  
Серверная фильтрация в [`src/lib/products.server.ts`](src/lib/products.server.ts): `getProductsByCategory(slug)` использует Payload `where` по `category.slug` (relation, `depth`). Клиентский [`Catalog`](src/components/Catalog.tsx) фильтрует переданный с сервера массив тем же правилом по slug. Категории в админке имеют явные поля `slug` и `order` (порядок в навигации). Для маршрута `/collection` slug из query по-прежнему читается на клиенте (`useSearchParams`). Оставшиеся риски после перехода на Payload — populated relation, лимиты и локаль — вынесены в **B-27**.

---

### B-20. Управление блоком «Воспоминания» через Payload

- **Статус:** Done
- **Приоритет:** Important
- **Категория:** Content / CMS

**Что было:** Заголовки и слайды блока «Воспоминания» захардкожены в [`src/components/MemoriesSection.tsx`](src/components/MemoriesSection.tsx), картинки — из `public/images/00*.jpeg`; тяжёлые файлы и `next/image` давали проблемы с оптимизатором.

**Решение команды:**  
Глобал [`memories`](../src/payload/globals/Memories.ts): тексты полей `heading`, `subheading`, `description`, массив `slides` (upload → `media` + подпись), минимум 5 элементов карусели. Редактор: **`/admin/globals/memories`**. Данные на главной: [`getMemoriesContent`](../src/lib/memories.server.ts) в [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx) → props в [`MemoriesSection`](../src/components/MemoriesSection.tsx); URL через `sizes.card` и `/_next/image`. Идемпотентный первичный контент из `public/images/`: **`npm run seed:memories`**; при первом запуске без данных — попытка в `onInit` ([`memoriesBootstrap`](../src/payload/seeds/memoriesBootstrap.ts)) без перезаписи существующих слайдов.

---

### B-21. Управление Hero-видео через Payload

- **Статус:** Done
- **Приоритет:** Architecture
- **Категория:** Content / CMS

**Что было:** Полноэкранное Hero-видео и постер зашиты в [`Hero.tsx`](../src/components/Hero.tsx) (`/videos/jewelry-hero.*`).

**Решение команды:**  
Коллекция **`media-video`** ([`MediaVideo.ts`](../src/payload/collections/MediaVideo.ts), `data/media-video`), глобал **`hero`** ([`globals/Hero.ts`](../src/payload/globals/Hero.ts)): флаг **`enabled`** (скрыть секцию без удаления медиа), `overlayText`, постер в `media`, обязательный `videoMp4`, опционально `videoWebm`. Редактор: **`/admin/globals/hero`**. Главная: [`getHeroContent`](../src/lib/hero.server.ts) → props в [`Hero`](../src/components/Hero.tsx); при `enabled === false` или отсутствии постера/источников секция не рендерится. Первичное наполнение из `public/videos/`: **`npm run seed:hero`**, в `onInit` — [`seedHeroIfMissing`](../src/payload/seeds/heroBootstrap.ts) без перезаписи при уже заданных постере и mp4. Long-cache заголовки для отдачи видеофайлов через API: [`next.config.ts`](../next.config.ts) — `/api/media-video/file/:path*`.

---

### B-22. Управление блоком «Философия бренда» через Payload

- **Статус:** Done
- **Приоритет:** Architecture
- **Категория:** Content / CMS

**Что было:** Заголовок, тексты левой колонки и 6 карточек блока захардкожены в [`About.tsx`](../src/components/About.tsx).

**Решение команды:**  
Глобал **`about`** ([`globals/About.ts`](../src/payload/globals/About.ts)): **`enabled`**, **`heading`**, rich-text **`lead`** (лексическая разметка, жирное отображение на главной через [`lexicalToReact.tsx`](../src/lib/lexicalToReact.tsx)), массив **`features`** (до 6 элементов): `title`, `description`, `icon` из фиксированного пресета (heart / sparkles / check / sparkle4 / clock / shield). Редактор: **`/admin/globals/about`**. Главная: [`getAboutContent`](../src/lib/about.server.ts) → props в [`About`](../src/components/About.tsx); при **`enabled === false`**, без карточек или без заголовка/`features` блок не показывается. Первичное наполнение: **`npm run seed:about`**, автосид без перезаписи уже заполненного — [`seedAboutIfMissing`](../src/payload/seeds/aboutBootstrap.ts) в [`onInit`](../payload.config.ts).

---

### B-23. Миграции Payload/SQLite вместо push-схемы

- **Статус:** Done
- **Приоритет:** Architecture
- **Категория:** Infra / CMS

**Что было:** В Docker после изменений страниц (draft versions + SEO) Drizzle в режиме `push` задавал интерактивные вопросы (`snapshot` в `_pages_v`), stdin в контейнере пустой — зависание старта.

**Решение команды:**  
В [`payload.config.ts`](../payload.config.ts): `sqliteAdapter({ push: false, migrationDir, prodMigrations })`. Миграции в [`src/payload/migrations/`](../src/payload/migrations/): **полный baseline** от drizzle-kit (`migrate:create baseline`), а не самописный «только snapshot» — иначе в БД не появляются `pages_locales` / `_pages_v_locales` при включённой localization. Скрипты: `payload:config:bundle`, `payload:dev-db-prep` ([`scripts/remove-dev-push-marker.mjs`](../scripts/remove-dev-push-marker.mjs)), `payload:migrate` ([`scripts/run-payload-migrate.mjs`](../scripts/run-payload-migrate.mjs) — без `npx payload migrate` / tsx в Docker), `payload:migrate:create`. Dev Docker: [`docker-compose.yml`](../docker-compose.yml) выполняет `npm run payload:migrate` перед `next dev`; production рассчитывает на `prodMigrations` при старте приложения, а не на явный `npm run payload:migrate` в [`Dockerfile`](../Dockerfile). Подробности: [`docs/payload-migrations.md`](../docs/payload-migrations.md). Операционную проверку fresh-start, явного migrate в entrypoint и non-`file:` БД вынести в **B-28**.

**Восстановление каталога товаров после wipe БД (если нет бэкапа `data/payload.db`):** из коммита **`b6b13f9`** (Initial release) временно восстановить `src/data/products.json` и каталог `public/images/products/` (`git checkout b6b13f9 -- …`), затем **`npm run migrate:payload`** ([`scripts/migrate-json-to-payload.ts`](../scripts/migrate-json-to-payload.ts)). Импорт дедуплицирует по **полному имени** товара — в историческом JSON есть совпадающие `name`, поэтому число строк в `products` будет меньше числа объектов в JSON. После успешного импорта временные файлы можно снова удалить из рабочего дерева.

---

### B-26. Локализация ru и en включена, но сайт читает только ru

- **Статус:** Open
- **Приоритет:** Architecture
- **Категория:** i18n / CMS / Product

**Что нашли:** В [`payload.config.ts`](../payload.config.ts) включены `i18n` и content `localization` для `ru` / `en`, но публичный сайт пока одноязычный:

- [`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx) фиксирует `<html lang="ru">` и `openGraph.locale: 'ru_RU'`.
- [`src/lib/pages.server.ts`](../src/lib/pages.server.ts) читает CMS-страницы только с `locale: 'ru'`.
- [`src/payload/seeds/pagesBootstrap.ts`](../src/payload/seeds/pagesBootstrap.ts) создаёт и backfill-ит только `ru`.

**Почему это важно:** Админка уже выглядит двуязычной, но английский контент не имеет публичного маршрута, sitemap, canonical/hreflang и сидов. Редактор может заполнить `en`, но сайт это не покажет.

**Предлагаемый подход:**
- Зафиксировать продуктово: сайт только `ru` сейчас или нужен публичный `en`.
- Если только `ru`: добавить подсказки в админке/документации, что `en` зарезервирован на будущее.
- Если нужен `en`: спроектировать маршруты (`/en/...` или locale segment), locale-aware loaders, `hreflang`, sitemap по локалям и seed/backfill для `en`.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-27. Каталог зависит от populated relations и жёстких лимитов

- **Статус:** Open
- **Приоритет:** Architecture
- **Категория:** Catalog / CMS / Data integrity

**Что нашли:** В [`src/lib/products.server.ts`](../src/lib/products.server.ts) `docToUi` ожидает, что `category` и media relations будут populated объектами при `depth: 2`. Если `category` вернётся числовым id, `category` станет пустой строкой, а `getProductsByCategory` затем отфильтрует товар через `Boolean(item.category)`.

Дополнительно клиентский [`Catalog`](../src/components/Catalog.tsx) сравнивает active category slug из URL с `getCategorySlug(p.category)`, а `p.category` сейчас приходит как **название** категории. Если редактор задаст slug, который не равен slugified Russian name, клиентский фильтр может показать пустую категорию, хотя серверный `where: 'category.slug'` работает правильно.

Там же стоят лимиты `limit: 300` для товаров и `limit: 100` для категорий. При росте каталога лишние записи исчезнут из выдачи и sitemap без явной ошибки. Product/category loaders также пока не задают `locale`, что может стать неожиданностью, если локализовать названия/описания. На странице товара [`src/app/(site)/products/[id]/page.tsx`](../src/app/(site)/products/[id]/page.tsx) related products считаются через `getAllProducts()`, то есть полный каталог грузится ради трёх карточек.

**Почему это важно:** Сейчас каталог небольшой, но эти предположения станут хрупкими при росте, миграции данных или изменении Payload depth/access. Ошибка будет выглядеть как «товар пропал из категории», «категория пустая» или «страница товара медленно отвечает», а не как явный сбой.

**Предлагаемый подход:**
- Для category-filtered запросов и UI возвращать slug/name категории независимо от populated relation: либо отдельным lookup по категории, либо явной проверкой relation shape.
- Добавить во фронтовый тип товара `categorySlug` и фильтровать клиент/сервер по одному ключу, не вычисляя slug из display name.
- Заменить фиксированные лимиты на pagination (`page`/`hasNextPage`) или заведомо документированный лимит каталога.
- Related products получать отдельным Payload-запросом по категории и `id != current`, с `limit: 3`, а не через полный каталог.
- Если локализация каталога появится, добавить `locale: 'ru'` или locale-aware параметр во все product/category loaders.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-28. Эксплуатация Payload и SQLite после миграций

- **Статус:** Open
- **Приоритет:** Architecture
- **Категория:** Infra / Ops / CMS

**Что нашли:** **B-23** закрыл переход от `push` к миграциям, но после аудита остались эксплуатационные вопросы:

- [`Dockerfile`](../Dockerfile) запускает `node scripts/remove-dev-push-marker.mjs && node server.js`, но не вызывает `npm run payload:migrate` явно. Нужно подтвердить, что `prodMigrations` в standalone-сборке применяются на всех production-сценариях старта и свежей БД.
- [`scripts/remove-dev-push-marker.mjs`](../scripts/remove-dev-push-marker.mjs) поддерживает только `file:` `DATABASE_URI`; для hosted libsql/Turso скрипт пишет skip и выходит с `0`. Это безопасно для текущего local file, но может скрыть проблему при миграции инфраструктуры.
- В production нужен явный persistence checklist: volume/backup для `data/payload.db`, `data/media` и `data/media-video`; [`Dockerfile`](../Dockerfile) сам не описывает, куда монтировать эти данные.
- [`.gitignore`](../.gitignore) игнорирует `/data/*.db*` и `/data/media/*`, но не `/data/media-video/*`; hero-видео можно случайно добавить в git.
- [`package.json`](../package.json) использует `patch-package` для `@payloadcms/ui`; это может усложнять обновления Payload admin и быстрые security patch upgrades.

**Почему это важно:** Схема Payload быстро меняется: localization, drafts, SEO plugin, globals. Если production-миграции не применятся в нужный момент, сайт может стартовать с несовместимой SQLite-схемой. Если volume/backup настроены неполно, можно потерять БД, изображения или видео; если large video попадёт в git, вернётся проблема B-01.

**Предлагаемый подход:**
- Документально или тестом подтвердить fresh-start контейнера с пустой `data/payload.db`.
- Решить, должен ли prod entrypoint явно запускать `payload:migrate` перед `server.js`, или текущий `prodMigrations` достаточно надёжен.
- При переходе на non-file SQLite обновить `remove-dev-push-marker` или убрать его из production path.
- Добавить `/data/media-video/*` в `.gitignore` и описать production volume/backup для всех `data/*`, которые нужны Payload.
- Перед обновлением `@payloadcms/*` проверять, что patch для UI всё ещё применим и нужен.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-30. Всё публичное CMS читается force-dynamic без стратегии кэша

- **Статус:** Open
- **Приоритет:** Architecture
- **Категория:** Performance / CMS / Ops

**Что нашли:** Публичные страницы и sitemap после перехода на Payload в основном используют `export const dynamic = 'force-dynamic'`: главная, каталог, избранное, товар, CMS slug pages и [`sitemap.ts`](../src/app/sitemap.ts). Это корректно для SQLite Local API и свежего контента, но пока нет решения, где допустимы `revalidate`, `unstable_cache` или другой cache layer.

**Почему это важно:** При росте трафика каждый запрос снова идёт в Payload/SQLite и пересобирает данные. Для каталога, sitemap и CMS globals это может стать узким местом раньше, чем появится необходимость в Postgres.

**Предлагаемый подход:**
- Разделить данные по свежести: форма/админ — без кэша, каталог/страницы/globals — короткий `revalidate` или ручная инвалидация после publish.
- Проверить, как drafts/preview должны обходить кэш, чтобы редакторы видели изменения.
- Начать с точечных loaders: `getAllProducts`, `getCategoriesForNav`, `getMemoriesContent`, `getHeroContent`, `getAboutContent`, sitemap.

**Решение команды:**  
_(заполнить после обсуждения)_

---

## Менее критично

### B-13. Нет CI

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX

**Что нашли:** Нет workflow’ов в `.github/workflows/` (или аналога) для `npm ci` + `npm run lint` + `npm run build` на PR.

**Почему это важно:** Регрессии ловятся поздно.

**Предлагаемый подход:** Минимальный GitHub Actions job на `push`/`pull_request`.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-14. Нет тестов

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX

**Что нашли:** В репозитории нет unit/e2e тестов.

**Почему это важно:** При рефакторинге каталога и форм легко сломать критичные сценарии.

**Предлагаемый подход:** 1–3 e2e (Playwright): главная, карточка товара, отправка формы после реализации B-02.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-15. README устарел относительно реальной структуры

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX

**Что нашли:** [`README.md`](../README.md) описывает упрощённую картину (например, добавление товаров через правку компонента), тогда как каталог сейчас в **Payload** (`/admin`), есть Docker, скрипты в `scripts/`, страницы `/collection`, `/products/[id]` и др.

**Почему это важно:** Ожидания новых участников не совпадают с кодом.

**Предлагаемый подход:** Обновить разделы «Структура», «Данные», «Docker», «Скрипты»; опционально ссылка на этот `docs/backlog.md`.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-16. Зависимость `react-icons`

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** Performance / Bundle

**Что нашли:** Пакет [`react-icons`](package.json) используется для соцсетей в [`src/utils/social.ts`](src/utils/social.ts); tree-shaking Next обычно спасает от полного набора иконок, но `node_modules` остаются тяжёлыми.

**Почему это важно:** При желании максимально облегчить зависимости — замена на несколько SVG.

**Предлагаемый подход:** Оставить как есть или заменить 4 иконки на локальные SVG — по ощущениям от размера бандла после `next build` анализом.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-17. Логирование ошибок видео и мониторинг

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** Observability

**Что нашли:** В [`src/components/Hero.tsx`](src/components/Hero.tsx) ошибка воспроизведения видео логируется только в режиме разработки; в production вызов `play()` ошибки иглотируются без отправки на сервер:

```14:19:src/components/Hero.tsx
const tryPlay = () => {
  if (process.env.NODE_ENV === 'development') {
    video.play().catch((err) => console.warn('[Hero] video.play():', err));
  } else {
    video.play().catch(() => {});
  }
};
```

**Почему это важно:** На проде проблемы автовоспроизведения (политики браузера, форматы кодеков, сеть к `/videos`) не попадают ни в метрики, ни в алерты.

**Предлагаемый подход:** При появлении мониторинга (Sentry / LogRocket / собственный endpoint) — редко, но осмысленно логировать неуспех `play()` с контекстом (user agent, readyState), без спама.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-19. Загрузка файла в форме обратной связи

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** Product / UX

**Что:** В старой вёрстке [`Contact.tsx`](../src/components/Contact.tsx) было поле «Прикрепить файл». При переходе на `@payloadcms/plugin-form-builder` оно **намеренно убрано**: нативного upload-блока в связке «публичный сабмит → form-submissions» без доработки нет (либо включаются `fields.upload` + `uploadCollections` + `submissionUploads`, либо отдельный `POST` в коллекцию `media`, затем в `submissionData` сохранять URL/`id`).

**Решение команды:**  
Вернуть в отдельной итерации: предзагрузка в `media` + ссылка в заявке, лимиты размера и MIME, возможно связка с **B-18** (оповещение с вложением). См. также [docs/contact-form-setup.md](../docs/contact-form-setup.md).

---

### B-29. Сиды и CMS-дедуп пока хрупкие

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX / CMS / Data quality

**Что нашли:** После переноса контента в Payload сиды стали критичнее, но часть эвристик пока мягкая:

- [`sourceBasename`](../src/payload/collections/Media.ts) в `media` и [`media-video`](../src/payload/collections/MediaVideo.ts) индексируется, но не уникален. Сидеры ищут `limit: 1`, поэтому дубликаты могут сделать выбор медиа недетерминированным.
- [`src/payload/seeds/aboutBootstrap.ts`](../src/payload/seeds/aboutBootstrap.ts) считает global заполненным, если есть `heading` и хотя бы одна карточка, но не проверяет обязательный rich-text `lead`.
- В seed-файлах встречаются `as never` / `as unknown`, из-за чего часть изменений схемы Payload будет ловиться только в runtime.

**Почему это важно:** Это не блокирует релиз, но усложняет восстановление после wipe БД, повторные сиды и будущие изменения схемы.

**Предлагаемый подход:**
- Сделать `sourceBasename` уникальным там, где он реально используется как ключ дедупликации, или явно документировать, что это только hint.
- Уточнить `seedAboutIfMissing`: проверять `lead` и минимальный набор карточек, а не только факт наличия массива.
- Постепенно заменить грубые type casts на локальные типы payload data для сидов.

**Решение команды:**  
_(заполнить после обсуждения)_

---

## История решений

| Дата | Пункт | Решение |
|------|--------|---------|
| 2026-04-30 | B-03 | Done — частично: [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx) и [`src/app/(site)/collection/page.tsx`](../src/app/(site)/collection/page.tsx) переведены в Server Components, клиентские хуки главной вынесены в [`src/components/HomeCatalog.tsx`](../src/components/HomeCatalog.tsx). Подробности и «что на потом» — в теле B-03. |
| 2026-04-30 | Payload + SQLite | Done: каталог и медиа в Payload v3 (`@payloadcms/db-sqlite`), файлы БД/медиа в `data/`, публичные страницы каталога с `dynamic = 'force-dynamic'`, импорт из JSON — `npm run migrate:payload` (bundle esbuild + `node`). Postgres — отложен до лимитов SQLite. |
| 2026-04-30 | B-10 | Done: `products.server` + данные через RSC/props; фильтр по slug без легаси-веток; категория в URL на `/collection` синхронизируется на клиенте. По серверной фильтрации — блок **B-10** выше; оставшиеся Payload-риски каталога — **B-27**. |
| 2026-04-30 | B-01 | Done — частично: оригиналы `DSC_*.jpg` удалены из рабочего дерева; превью ранее жили в `public/images/products/` (~8.9 МБ `_small`), затем каталог перенесён в Payload (`data/media`). История git не переписана — блобы остаются. |
| 2026-04-30 | B-05 | Done — добавлен файл `public/images/placeholder.jpg` (≈ 3.9 КБ); fallback`ы из кода теперь резолвятся. |
| 2026-04-30 | B-12 | Done — добавлен [`.env.example`](../.env.example): `NEXT_PUBLIC_SITE_URL`, SMTP, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (для будущего **B-18**), S3, `PAYLOAD_SECRET`, `DATABASE_URI`. |
| 2026-05-01 | B-06, B-07, B-09 | Done — частично: `@payloadcms/plugin-seo` на товары, категории и pages; `generateMetadata` на товаре, каталоге (`?category=`) и CMS slug pages; [`sitemap.ts`](../src/app/sitemap.ts), [`robots.ts`](../src/app/robots.ts), OG/Twitter через `meta` + `metadataBase` в `(site)/layout`. Default metadata главной/fallback — **B-25**. |
| 2026-05-01 | B-02 (часть 1), B-18, B-19 | Частично **B-02**: `@payloadcms/plugin-form-builder`, сабмиты в **`form-submissions`**, главная через [`forms.server`](../src/lib/forms.server.ts) + [`ContactForm`](../src/components/ContactForm.tsx), док [`contact-form-setup.md`](../docs/contact-form-setup.md), **`npm run seed:contact-form`**. Поле файла убрано → **Open B-19**. Внешние уведомления (Telegram/SMTP) не делали → **Open B-18**. |
| 2026-05-02 | B-04, B-08 | Done: [`next.config.ts`](../next.config.ts) — убран `/:path*` с годовым immutable; long-cache для `/_next/static`, `/images`, `/videos`; включена оптимизация `next/image` (AVIF/WebP, `deviceSizes`/`imageSizes`); `sizes` на слайдах Memories. |
| 2026-05-02 | B-20 | Done: глобал **`memories`** ([`payload.config.ts`](../payload.config.ts), [`globals/Memories.ts`](../src/payload/globals/Memories.ts)), загрузка [`getMemoriesContent`](../src/lib/memories.server.ts) на главной и [`MemoriesSection`](../src/components/MemoriesSection.tsx); первичное наполнение **`npm run seed:memories`**, авто‑сид в `onInit` без перезаписи уже заполненного. |
| 2026-05-02 | B-21 | Done: коллекция **`media-video`**, глобал **`hero`**, [`getHeroContent`](../src/lib/hero.server.ts) + CMS-driven [`Hero`](../src/components/Hero.tsx); **`npm run seed:hero`**, [`seedHeroIfMissing`](../src/payload/seeds/heroBootstrap.ts) в `onInit`; long-cache в [`next.config.ts`](../next.config.ts) для `/api/media-video/file/:path*`. |
| 2026-05-02 | B-22 | Done: глобал **`about`**, [`getAboutContent`](../src/lib/about.server.ts), CMS-driven [`About`](../src/components/About.tsx); **`npm run seed:about`**, [`seedAboutIfMissing`](../src/payload/seeds/aboutBootstrap.ts) в `onInit`; rich-text **`lead`** + 6 пресет-иконок в карточках. |
| 2026-05-02 | B-23 | Done: **`push: false`** + [`src/payload/migrations/`](../src/payload/migrations/) + `prodMigrations`; baseline `20260502_082625_baseline` (полная схема, в т.ч. `pages_locales` / `_pages_v_locales`); dev-БД пересоздана после wipe; `npm run payload:migrate` → бандл + [`scripts/run-payload-migrate.mjs`](../scripts/run-payload-migrate.mjs) (tsx в alpine на undici); ESLint: игнор сгенерённых миграций в [`eslint.config.mjs`](../eslint.config.mjs); см. **[`docs/payload-migrations.md`](../docs/payload-migrations.md)**. |
| 2026-05-02 | B-23 (каталог) | После wipe: каталог восстановлен из **`b6b13f9`** + **`npm run migrate:payload`** (не путать с schema-migrate); зафиксировано в теле **B-23** выше. |
| 2026-05-02 | Payload CMS audit | Open: после внедрения Payload добавлены B-24–B-31 — security hardening, CMS sitemap/SEO, локализация, устойчивость каталога, эксплуатация SQLite/migrations, сиды и дедуп, кэширование и structured data. |
| — | — | _(заполняется по мере обсуждения)_ |
