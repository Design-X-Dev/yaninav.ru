import type { GlobalConfig } from 'payload';

import { IMAGE_COLLECTION_SLUG } from '../collections/Image';
import { VIDEO_COLLECTION_SLUG } from '../collections/Video';
import { PAYLOAD_ADMIN_GROUPS } from '../adminSidebarGroups';

export const HERO_GLOBAL_SLUG = 'hero';

export const Hero: GlobalConfig = {
  slug: HERO_GLOBAL_SLUG,
  label: 'Главная — Hero',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: PAYLOAD_ADMIN_GROUPS.homeGlobals,
    description: 'Первый экран с видео на главной. Поле «Показывать секцию» выключает блок без удаления файлов.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Показывать секцию на главной',
      admin: {
        description: 'Снимите галочку, чтобы временно скрыть Hero без удаления медиа.',
      },
    },
    {
      name: 'overlayText',
      type: 'text',
      defaultValue: 'Смотреть видео',
      label: 'Подпись (плеер на паузе)',
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: IMAGE_COLLECTION_SLUG,
      required: true,
      label: 'Постер (jpg/png)',
    },
    {
      name: 'videoMp4',
      type: 'upload',
      relationTo: VIDEO_COLLECTION_SLUG,
      required: true,
      label: 'Видео .mp4',
    },
    {
      name: 'videoWebm',
      type: 'upload',
      relationTo: VIDEO_COLLECTION_SLUG,
      label: 'Видео .webm (опц.)',
    },
  ],
};
