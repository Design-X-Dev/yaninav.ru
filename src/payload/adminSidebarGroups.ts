/**
 * Группы в сайдбаре Payload Admin (коллекции / глобалы / блоки из плагинов).
 *
 * Порядок секций «глобалы выше коллекций» задаётся patch-package:
 * — [`patches/@payloadcms+next+3.84.1.patch`](../../patches/@payloadcms+next+3.84.1.patch): `DefaultNav` → `groupNavItems([...globals, ...collections])`;
 * — [`patches/@payloadcms+ui+3.84.1.patch`](../../patches/@payloadcms+ui+3.84.1.patch): `getNavGroups` в `@payloadcms/ui` для прочих мест.
 */
export const PAYLOAD_ADMIN_GROUPS = {
  homeGlobals: 'Главная',
  /** CMS-страницы (/slug), категории и товары каталога — одна секция сайдбара. */
  pagesAndCatalog: 'Страницы и каталог',
  media: 'Медиа',
  forms: 'Формы и заявки',
  system: 'Администрирование',
} as const;
