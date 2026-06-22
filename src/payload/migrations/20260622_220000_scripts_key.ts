import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** Колонка `key` в коллекции `scripts` для идемпотентного сидирования. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`scripts\` ADD \`key\` text NOT NULL;`);
  await db.run(sql`CREATE UNIQUE INDEX \`scripts_key_idx\` ON \`scripts\` (\`key\`);`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`scripts_key_idx\`;`);
  await db.run(sql`ALTER TABLE \`scripts\` DROP COLUMN \`key\`;`);
}
