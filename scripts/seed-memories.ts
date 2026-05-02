/**
 * Принудительно перезаписывает глобал `memories` дефолтным текстом и 5 файлами из `public/images/`.
 *
 * Запуск: `PAYLOAD_SECRET=… DATABASE_URI=… npm run seed:memories`
 */

import config from '../payload.config';
import { getPayload } from 'payload';

import { seedMemoriesFromDisk } from '../src/payload/seeds/memoriesBootstrap';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await seedMemoriesFromDisk(payload, { force: true });
  console.info('Global memories seeded (force)');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
