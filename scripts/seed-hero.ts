/**
 * Принудительно перезаписывает глобал `hero` дефолтными полями и файлами из `public/videos/`.
 *
 * Запуск: `PAYLOAD_SECRET=… DATABASE_URI=… npm run seed:hero`
 */

import config from '../payload.config';
import { getPayload } from 'payload';

import { seedHeroFromDisk } from '../src/payload/seeds/heroBootstrap';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await seedHeroFromDisk(payload, { force: true });
  console.info('Global hero seeded (force)');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
