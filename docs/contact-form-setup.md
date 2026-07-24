# Форма обратной связи (Payload Form Builder)

Сайт загружает форму по **slug `contact`** через [`src/lib/forms.server.ts`](../src/lib/forms.server.ts) и рендерит её в [`ContactForm`](../src/components/ContactForm.tsx).

## Автоматическое создание при старте приложения

При каждом старте Next/Payload выполняется `onInit` в [`payload.config.ts`](../payload.config.ts): если в коллекции **Forms** нет документа со slug `contact`, он создаётся из общего описания [`src/payload/seeds/contactFormDefinition.ts`](../src/payload/seeds/contactFormDefinition.ts). Уже сохранённые в админке правки **не перезаписываются**.

Отдельно останется полезным CLI для **полного совпадения** с файлом описания (`update`/«перетереть поля из кода»).

## Принудительное создание / обновление из CLI

После того как проект хотя бы раз поднимался с плагином `@payloadcms/plugin-form-builder` (таблицы `forms_*` уже в SQLite), **остановите** другие процессы с открытым `payload.db` и выполните:

```bash
PAYLOAD_SECRET=your-secret DATABASE_URI=file:./data/payload.db npm run seed:contact-form
```

Скрипт идемпотентен: при повторном запуске **обновит** документ со slug `contact`.

При ошибке `index ... already exists` см. блок «Автоматическое создание» выше (закройте параллельный dev/Docker).

## Через админку

1. `/admin` → коллекция **Forms** → **Create new**.
2. Поле **Slug (для сайта)**: `contact` (строго это значение иначе фронт не найдёт форму).
3. Добавьте блоки полей (text / email / textarea и т.д.), настройте **Confirmation message** (rich text).

## Где смотреть заявки

`/admin` → **Form Submissions** — записи создаются при `POST /api/form-submissions` с фронта.

## Внешние уведомления (не реализовано)

Почта / Telegram пока не настроены — заявки смотрите в Form Submissions.

## Загрузка файлов (не реализовано)

Поле «Прикрепить файл» с главной убрано; возврат в отдельной итерации.
