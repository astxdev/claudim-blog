import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "newsletter_subscribers" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "featured_order" numeric;
  ALTER TABLE "_articles_v" ADD COLUMN "version_featured_order" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "newsletter_subscribers" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "articles" DROP COLUMN "featured_order";
  ALTER TABLE "_articles_v" DROP COLUMN "version_featured_order";`)
}
