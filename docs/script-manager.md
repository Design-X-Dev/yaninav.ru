# Script Manager

Управление сторонними HTML/JS-вставками (Яндекс.Метрика, GTM, пиксели, виджеты) через коллекцию **Scripts** в Payload.

## Админка

`/admin` → **Скрипты и вставки** (группа «Администрирование»).

| Поле | Назначение |
|------|------------|
| **Название** (`name`) | Понятное имя в списке |
| **Системный ключ** (`key`) | Стабильный id для сидов (`top-mailru` и т.п.). У сидовых записей не меняйте |
| **Место вставки** (`location`) | `head_open` / `head_close` / `body_open` / `body_close` |
| **Код** (`code`) | Блок целиком, как в инструкции сервиса |
| **Активен** (`isActive`) | Вкл/выкл без удаления |

Для `head_open` / `head_close` используйте только теги `<script>…</script>` (атрибуты `src` / `async` / `defer` сохраняются). Блоки `<noscript>` и прочий HTML — в `body_open` / `body_close`.

После сохранения кэш скриптов сбрасывается автоматически.

## Сид

При старте приложения недостающие записи создаются из [`src/payload/seeds/scriptsDefinition.ts`](../src/payload/seeds/scriptsDefinition.ts) (по `key`, без перезаписи правок админа).

Принудительно пересоздать из кода (затрёт совпадающие по `key`):

```bash
PAYLOAD_SECRET=… DATABASE_URI=file:./data/payload.db npm run seed:scripts
```

## Где подключается на сайте

[`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx) рендерит [`SiteScripts`](../src/components/SiteScripts.tsx) в четырёх точках layout. Данные — Local API ([`src/lib/scripts.server.ts`](../src/lib/scripts.server.ts)); публичный REST `/api/scripts` закрыт.
