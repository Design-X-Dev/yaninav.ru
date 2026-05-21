import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/**
 * Глобал `homepage` + локализованные поля SEO-плагина (`meta`).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE \`homepage\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `);

  await db.run(sql`
    CREATE TABLE \`homepage_locales\` (
      \`meta_title\` text,
      \`meta_description\` text,
      \`meta_image_id\` integer,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`meta_image_id\`) REFERENCES "image"(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `);

  await db.run(sql`
    CREATE INDEX \`homepage_meta_meta_image_idx\` ON \`homepage_locales\` (\`meta_image_id\`, \`_locale\`);
  `);
  await db.run(sql`
    CREATE UNIQUE INDEX \`homepage_locales_locale_parent_id_unique\` ON \`homepage_locales\` (\`_locale\`, \`_parent_id\`);
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`homepage_locales\`;`);
  await db.run(sql`DROP TABLE IF EXISTS \`homepage\`;`);
}
