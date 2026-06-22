import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** Коллекция `scripts`: сторонние HTML/JS-вставки для layout. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE \`scripts\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`location\` text DEFAULT 'body_close' NOT NULL,
      \`code\` text NOT NULL,
      \`is_active\` integer DEFAULT false,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    );
  `);
  await db.run(sql`CREATE INDEX \`scripts_updated_at_idx\` ON \`scripts\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`scripts_created_at_idx\` ON \`scripts\` (\`created_at\`);`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`scripts\`;`);
}
