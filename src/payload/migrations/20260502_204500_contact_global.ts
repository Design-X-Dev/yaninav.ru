import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** Глобал `contact`: тексты секции «Контакты» на главной. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE \`contact\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`enabled\` integer DEFAULT true,
      \`heading\` text NOT NULL,
      \`intro\` text NOT NULL,
      \`contact_info_heading\` text NOT NULL,
      \`address\` text NOT NULL,
      \`hours\` text NOT NULL,
      \`phone_display\` text,
      \`phone_href\` text,
      \`email_display\` text,
      \`email_href\` text,
      \`form_heading\` text NOT NULL,
      \`appointment_button_text\` text NOT NULL,
      \`appointment_note\` text NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`contact\`;`);
}
