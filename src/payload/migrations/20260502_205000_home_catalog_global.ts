import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** Глобал `home-catalog` и массив ручного выбора товаров для главной. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE \`home_catalog\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`enabled\` integer DEFAULT true,
      \`selection_mode\` text DEFAULT 'catalog' NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `);

  await db.run(sql`
    CREATE TABLE \`home_catalog_manual_products\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`product_id\` integer NOT NULL,
      FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_catalog\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `);

  await db.run(sql`
    CREATE INDEX \`home_catalog_manual_products_order_idx\` ON \`home_catalog_manual_products\` (\`_order\`);
  `);
  await db.run(sql`
    CREATE INDEX \`home_catalog_manual_products_parent_id_idx\` ON \`home_catalog_manual_products\` (\`_parent_id\`);
  `);
  await db.run(sql`
    CREATE INDEX \`home_catalog_manual_products_product_idx\` ON \`home_catalog_manual_products\` (\`product_id\`);
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`home_catalog_manual_products\`;`);
  await db.run(sql`DROP TABLE IF EXISTS \`home_catalog\`;`);
}
